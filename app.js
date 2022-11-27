const express = require("express");
const app = express();
const database = require("./config/database");
const db = require("./models/db");
const bodyParser = require("body-parser"); // pull information from HTML POST (express4)

const port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ extended: "true" })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: "application/vnd.api+json" })); // parse application/vnd.api+json as json

// Connecting with DB
db.initialize(database.url)

// *! ROUTES
app.get("/api/restaurants", function (req, res) {
  let page = req.query.page;
  let perPage = req.query.perPage;
  let borough = req.query.borough;  
  db.getAllRestaurants(page, perPage, borough)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

// Get Record By id
app.get("/api/restaurants/:id",((req,res)=>{
  let id=req.params.id;
  db.getRestaurantById(id)
  .then((data)=>{
    res.json(data);
  }).catch((err)=>{
    console.log(err);
  })
}))

// Add a New Record
app.post("/api/restaurants", function (req, res) {
  let data = req.body
  db.addNewRestaurant(data)
  .then((data) => {
    res.status(201).json(data);
  })
  .catch((err) => {
    res.send(err)
  })
});

// Update a Record
app.put("/api/restaurants/:id", function (req, res) {
  let data = req.body
  let id = req.params.id;
  db.updateRestaurantById(data, id)
  .then((data) => {
    res.status(200).json(data);
  })
  .catch((err) => {
    res.send(err)
  })
});

// Delete a record
app.delete("/api/restaurants/:id", (req, res) => {
  let id = req.params.id;
  db.deleteRestaurantById(id)
    .then((data) => {
      res.send(`${data.name} Record has been deleted successfully`);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.listen(port);
console.log("Listening on port : " + port);