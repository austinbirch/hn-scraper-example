const express = require("express");
const app = express();

const WEBSERVER_PORT = 4000;

app.get("/", (req, res) => {
  res.json({
    message: "hello!"
  });
});

console.info("Starting hn-scraper-example on port", WEBSERVER_PORT);
app.listen(WEBSERVER_PORT, "127.0.0.1");
