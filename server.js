var express = require("express");
var mongojs = require("mongojs");
var request = require("request");
var cheerio = require("cheerio");

var app = express();

var databaseUrl = "scraper";
var collections = ["scrapedData"];

var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.send("Hello world");
});

// This route will retrieve all of the data
app.get("/all", function(req, res) {
  db.scraper.find(), function(error, found) {
    // Log any errors if the server encounters one
    if (error) {
      console.log(error);
    }
    // Otherwise, send the result of this query to the browser
    else {
      res.json(found);
    }
  };
});

// Route that scrapes from NPR when you append /scrape to URL
app.get("/scrape", function(req, res) {
  request("http://www.npr.org", function(error, response, html) {
    var $ = cheerio.load(html);
    var results = [];
    $("h1.title, p.teaser").each(function(i, element) {
        var link = $(element).parent().attr("href");
        var title = $(element).text();
        var description = $(element).parents("div.story-text").find("p.teaser").text();

      // Adds data to mongo database
      db.scrapedData.insert({
        title: title,
        link: link,
        description: description
      },function(err, stuff) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(stuff);
        }
      });
    });
  });
});
// Listen on port 3000
app.listen(3001, function() {
  console.log("App running on port 3001!");
});
