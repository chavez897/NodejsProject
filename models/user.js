const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  email:{
    type:String
  },
  password:String
});
module.exports = mongoose.model("User", userSchema);
