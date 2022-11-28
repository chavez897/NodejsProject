const mongoose = require("mongoose");

// Initializing Model
const Restaurant = require("./restaurant");

// Connecting with Database
function initialize(url){
    mongoose
    .connect(url)
    .then(() => {
      console.log("Connection successful");
    })
    .catch((err) => {
      console.log(err);
    });
}

// Create a new Restaurant Record
async function addNewRestaurant(data) {
    try{
      const restaurant = await Restaurant.create(data)
      return restaurant
    }catch(err){
      console.log(err)
    }
  }
  
  // Get all restaurants based on page, perPage, borough
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
  
  // Get RestaurantById
  async function getRestaurantById(id){
    try{
      const restaurant=await Restaurant.find({_id:id})
      return restaurant
    }catch(err){
      console.log(err)
    }
  }
  
  // Update a Restaurant Record By Id
  async function updateRestaurantById(data, id) {
    try{
      await Restaurant.findOneAndUpdate({_id: id}, data)
      const update = await Restaurant.findById(id)
      return update
    }catch(err){
      console.log(err)
    }
  }
  
  // Delete Restaurant Record By Id
  async function deleteRestaurantById(id) {
    try{
      const restaurant=await Restaurant.deleteOne({id});
      return `${restaurant.name} restaurant has been deleted successfully`
    }catch(err){
      console.log(err)
    }
  }

  module.exports={initialize,addNewRestaurant,getAllRestaurants,getRestaurantById,updateRestaurantById,deleteRestaurantById}