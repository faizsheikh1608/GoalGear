const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
  userId : {
    type : mongoose.Schema.Types.ObjectId,
    required : true,
    ref : "User",
  },
  productId : {
    type : mongoose.Schema.Types.ObjectId,
    required : true,
    ref : "Product",
  },
  quantity : {
    type : Number,
    required : true,
    default : 1,
  },
  status : {
    type : String,
    enum : {
      values : ["placed" , "notPlaced"],
      message : "{VALUE} is not valid"
    },
    default : "notPlaced",

  }
});

cartSchema.index({userId : 1 , productId : 1})


const Storecart = mongoose.model("Storecart",cartSchema);

module.exports = Storecart;