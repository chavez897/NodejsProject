const mongoose = require("mongoose");

// Initializing Model
const Restaurant = require("./restaurant");
const User = require("./user");

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
      res.status(500).json({'msg':'Unable to create a new record'});
    }
  }
  
  // Get all restaurants based on page, perPage, borough
  async function getAllRestaurants(page, perPage, borough) {
    try {
      if (borough == undefined) {
        const restaurants = await Restaurant.find()
          .sort({ restaurant_id: 1 })
          .limit(perPage)
          .skip((page - 1) * perPage)
          .lean();
  
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
          .skip((page - 1) * perPage)
          .lean();
  
        // If no matching records found
        if (restaurants.length == 0) {
          return { message: "No records Found" };
        } else {
          console.log(restaurants);
          return restaurants;
        }
      }
    } catch (err) {
      res.status(500).json({'msg':'Unable to find records'});
    }
  }
  
  // Get RestaurantById
  async function getRestaurantById(id){
    try{
      const restaurant=await Restaurant.find({_id:id})
      return restaurant
    }catch(err){
      res.status(500).json({'msg':'Unable to find record'});
    }
  }
  
  // Update a Restaurant Record By Id
  async function updateRestaurantById(data, id) {
    try{
      await Restaurant.findOneAndUpdate({_id: id}, data)
      const update = await Restaurant.findById(id)
      return update
    }catch(err){
      res.status(500).json({'msg':'Unable to update record'});
    }
  }
  
  // Delete Restaurant Record By Id
  async function deleteRestaurantById(id,req,res) {
    try{
      const restaurant=await Restaurant.deleteOne({_id:id});
      return `${restaurant.name} restaurant has been deleted successfully`
    }catch(err){
      res.status(500).json({'msg':'Unable to delete record'});
    }
  }

  // Register a new user
  async function registerUser(data){
    try{
      const user=await User.create(data);
      return user;
    }catch(err){
      res.status(500).json({'msg':'Unable to register user'});
    }
  }

  // Get User(Login)
  async function getUser(emailID,req,res){
    try{
      const user=await User.findOne({email:emailID});
      return user;
    }catch(err){
      res.status(500).json({'msg':'Unable to login user'});
    }
  }

  module.exports={initialize,addNewRestaurant,getAllRestaurants,getRestaurantById,updateRestaurantById,deleteRestaurantById,registerUser,getUser}