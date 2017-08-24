const express = require("express");
const app = express();

const db = require("./db");
const intervalScraper = require("./interval-scraper");

const WEBSERVER_PORT = 4000;

// update database on interval
const dbConn = db.makeDBConnection();
const scraper = intervalScraper.makeIntervalScraper(dbConn);
intervalScraper.start(scraper);

// just to make sure it is alive
app.get("/", (req, res) => {
  res.json({
    message: "hello!"
  });
});

// on demand scraping
app.get("/scores-latest", (req, res, next) => {
  intervalScraper
    .update(scraper)
    .then(dbConn.getScores)
    .then(scores => {
      return res.json(scores);
    })
    .catch(next);
});

app.get("/scores", (req, res, next) => {
  const nameSorter = scoreRow => scoreRow.user.toLowerCase;
  const valueSorter = scoreRow => scoreRow.points;

  // TODO: refactor to share these sorts implementation. Annoyingly
  // need the opposite comparisons for A->Z + low->high points. Not
  // going to spend much time here because if not in-mem db then should
  // sort via DB.
  const sortName = (a, b) => {
    const vA = a.user.toLowerCase();
    const vB = b.user.toLowerCase();
    if (vA < vB) {
      return -1;
    } else if (vA > vB) {
      return 1;
    } else {
      return 0;
    }
  };

  const sortPoints = (a, b) => {
    const vA = a.points;
    const vB = b.points;
    if (vA < vB) {
      return 1;
    } else if (vA > vB) {
      return -1;
    } else {
      return 0;
    }
  };

  dbConn
    .getScores()
    .then(scores => {
      if (req.query.sortBy === "name" || req.query.sortBy === "points") {
        scores.sort(req.query.sortBy === "name" ? sortName : sortPoints);
      }
      res.json(scores);
    })
    .catch(next);
});

console.info("Starting hn-scraper-example on port", WEBSERVER_PORT);
app.listen(WEBSERVER_PORT, "127.0.0.1");
