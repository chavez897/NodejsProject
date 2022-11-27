const mongoose = require("mongoose");
const restaurantSchema = mongoose.Schema({
  address: {
    type: Object,
    building: String,
    coord: Array,
    street: String,
    zipcode: String,
  },
  borough: String,
  cuisine: String,
  grades: [
    {
      date: {
        type: Date,
      },
      grade: String,
      score: Number,
    },
  ],
  name: String,
  restaurant_id: String,
});
module.exports = mongoose.model("Restaurant", restaurantSchema);
