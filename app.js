var express = require("express");
var mongoose = require("mongoose");
var app = express();
var database = require("./config/database");
var bodyParser = require("body-parser"); // pull information from HTML POST (express4)

var port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ extended: "true" })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: "application/vnd.api+json" })); // parse application/vnd.api+json as json

mongoose.connect(database.url);

var Restaurant = require("./models/restaurant");

app.get("/api/restaurants", function (req, res) {
  Restaurant.findById("5eb3d668b31de5d588f4292b", function (err, restaurants) {
    if (err) res.send(err);
    res.json(restaurants); // return all employees in JSON format
  });
});

app.listen(port);
console.log("App listening on port : " + port);