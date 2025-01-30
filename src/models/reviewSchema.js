const mongoose = require("mongoose");



const reviewSchema = new mongoose.Schema({
  productId : {
    type : mongoose.Schema.Types.ObjectId,
    required : true,
    ref : "Product",
  },
  userId : {
    type : mongoose.Schema.Types.ObjectId,
    required : true,
    ref : "User",
  },
  review : {
    type : String,
    required : true,
    trim : true,
  }
},{
  timestamps : true,
});


const Review  = mongoose.model("Review" , reviewSchema);


module.exports = Review;