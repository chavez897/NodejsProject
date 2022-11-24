const express = require("express");
const mongoose = require("mongoose");
const app = express();
const database = require("./config/database");
const bodyParser = require("body-parser"); // pull information from HTML POST (express4)

const port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ extended: "true" })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: "application/vnd.api+json" })); // parse application/vnd.api+json as json

// Connecting with DB
mongoose
  .connect(database.url)
  .then(() => {
    console.log("Connection successful");
  })
  .catch((err) => {
    console.log(err);
  });

// Initializing Model
const Restaurant = require("./models/Restaurant");

async function getAllRestaurants(page, perPage, borough) {
  try {
    if (borough == undefined) {
      const restaurants = await Restaurant.find()
        .sort({ restaurant_id: 1 })
        .limit(perPage)
        .skip((page - 1) * perPage);

      // If no matching records found
      if (restaurants.length == 0) {
        return { message: "No records Found" };
      } else {
        return restaurants;
      }
    } else {
      const restaurants = await Restaurant.find({ borough: borough })
        .sort({ restaurant_id: 1 })
        .limit(perPage)
        .skip((page - 1) * perPage);

      // If no matching records found
      if (restaurants.length == 0) {
        return { message: "No records Found" };
      } else {
        console.log(restaurants);
        return restaurants;
      }
    }
  } catch (err) {
    console.log(err);
  }
}

async function deleteRestaurantById(id) {
  try{
    const restaurant=await Restaurant.deleteOne({id});
    return `${restaurant.name} restaurant has been deleted successfully`
  }catch(err){
    console.log(err)
  }
}

app.get("/api/restaurants", function (req, res) {
  let page = req.query.page;
  let perPage = req.query.perPage;
  let borough = req.query.borough;

  getAllRestaurants(page, perPage, borough)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

// Delete a record
app.delete("/api/restaurants/id=:id", (req, res) => {
  let id = req.params.id;
  deleteRestaurantById(id)
    .then((data) => {
      res.send("Record has been deleted successfully");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.listen(port);
console.log("Listening on port : " + port);