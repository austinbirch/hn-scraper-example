const puppeteer = require("puppeteer");
const HN_URL = "https://news.ycombinator.com";

async function scrapeHNScores() {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.goto(HN_URL);

    // selection could be much better, will do for now
    // grab each story off of the HN page first page. User info/score
    // row follows the title row (for the most part?!)
    const titleRows = await page.$$("tr.athing");
    const userRows = await page.$$("tr.athing + tr");

    const stories = titleRows.reduce((acc, titleRow, i) => {
      acc.push({ titleRow, userRow: userRows[i] });
      return acc;
    }, []);

    const scores = {};
    for (story of stories) {
      // accumulate each user's current front page post score, accounting for users that
      // have more than one story on the front page
      const [name, score] = await story.userRow.evaluate(e => {
        try {
          return [
            e.querySelector(".hnuser").innerText,
            parseInt(e.querySelector(".score").innerText.replace(" points", ""))
          ];
        } catch (e) {
          // if we can't read the selectors we expect, assume it's a row we shouldn't
          // have selected for now. Strip these out after.
          return [null, null];
        }
      });

      const title = await story.titleRow.evaluate(e => {
        try {
          return e.querySelector(".title .storylink").innerText;
        } catch (e) {
          return null;
        }
      });

      // we didn't get what we expected, so skip this row for now
      if (name === null || score === null || title === null) {
        continue;
      }

      // update our counts
      const storyMeta = { title, score };
      if (scores[name]) {
        (scores[name].points = scores[name].points + score), scores[
          name
        ].stories.push(storyMeta);
      } else {
        scores[name] = {
          points: score,
          stories: [storyMeta]
        };
      }
    }

    // flatten scores to array, now we've de-duped users
    const flattenedScores = Object.keys(scores).reduce((acc, k) => {
      const { points, stories } = scores[k];
      acc.push({ user: k, points, stories });
      return acc;
    }, []);

    return flattenedScores;
  } finally {
    browser.close();
  }
}

function start(scraper) {
  scraper.state = "started";
  scraper.intervalId = setInterval(async () => {
    try {
      await update(scraper);
    } catch (e) {
      // TODO: do something about this? Slow down? count retries? back-off etc?
      console.error(e);
    }
  }, scraper.interval);
  return scraper;
}

function stop(scraper) {
  clearInterval(scraper.intervalId);
  delete scraper[intervalId];
  return scraper;
}

async function update(scraper) {
  const newScores = await scrapeHNScores();
  return await scraper.dbConn.updateScores(newScores);
}

// dbConn is going to conform to our (very informal...) 'db' interface
function makeIntervalScraper(dbConn, opts = { interval: 1000 * 60 }) {
  let scraper = {
    state: "awaiting-start",
    dbConn: dbConn,
    interval: opts.interval
  };
  return scraper;
}

module.exports = {
  makeIntervalScraper,
  start,
  stop,
  update
};
