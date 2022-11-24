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

const Restaurant = require("./models/Restaurant");

async function getAllRestaurants(page,perPage,borough) {
  try {
    if(borough==undefined){
      const restaurants = await Restaurant.find().sort({restaurant_id:1}).limit(perPage).skip((page-1)*perPage)
      return await restaurants;
    }else{
      const restaurants = await Restaurant.find({borough:borough}).sort({restaurant_id:1}).limit(perPage).skip((page-1)*perPage)
      return await restaurants;
    }
  }
  catch (err) {
    console.log(err);
  }
}

app.get("/api/restaurants", function (req, res) {
  let page=req.query.page;
  let perPage=req.query.perPage;
  let borough=req.query.borough;
  getAllRestaurants(page,perPage,borough).then((data)=>{
    res.json(data)
  }).catch((err)=>{
    console.log(err)
  })
});

app.listen(port);
console.log("App listening on port : " + port);
