# hn-scraper-example

Rough example of scraping some content off of HN using [chrome-headless](https://developers.google.com/web/updates/2017/04/headless-chrome) via [puppeteer](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageselector) and using [Express.js](https://expressjs.com/) to serve results.

Rough order of things that I’d probably do next:

- start adding in a real DB and making a better interface around that, leverage database for sorting etc.
- start adding some tests and defining schema/objects inside the system.
- make the scraping more robust and more easily testable - at the moment the function that does the scraping is hard to test.
- global exception handling, backing off on scraping errors etc.
