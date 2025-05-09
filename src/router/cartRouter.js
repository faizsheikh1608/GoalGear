const express = require('express');
const userAuth = require('../middleware/userAuth');
const User = require('../models/userSchema');
const { Product } = require('../models/productSchema');
const Storecart = require('../models/cartSchema');


const cartRouter = express.Router();

//adding item in the cart
cartRouter.post("/cart/addItem",userAuth, async(req,res) =>{

  try{

  
  const {productId,status,size} = req.body;

  const quantity = !req.body.quantity ? 1 : req.body.quantity;

  if(!productId || !status || !size){
    throw new Error("Please add all the field!")
  }

  const product = await Product.findById({_id : productId});

  if(!product){
    throw new Error("Product not found");
  }

  //check if already any same data is present
  const isExisting = await Storecart.findOne({
    userId : req.user._id,
    productId,
  })

  if(isExisting){
    throw new Error("Item already Added");
  }

  if("notPlaced" !== status){
    throw new Error("Status is incorrect");
  }

  const cart = new Storecart({
    userId : req.user._id,
    productId,
    quantity,
    size,
    status,
  })

  await cart.save();

  res.json({message : "Item added Successfully !",cart})
}catch(err){
  res.status(400).json({message : err.message})
}

});


//Delete Item from cart
cartRouter.delete("/cart/removeItem/:productId" , userAuth , async(req,res) => {

  try{
  const {productId} = req.params

  const deletedItem = await Storecart.findOneAndDelete({
    userId : req.user._id,
    productId
  })

  if(!deletedItem){
    throw new Error("Item Not Found in cart");
  }

  res.json({message : "Item deleted Successfully!"});
}catch(err){
  res.status(400).json({message : err.message})
}
}) 



//get items of cart
cartRouter.get("/cart/getItems" , userAuth , async(req,res) => {
  try{

    const userId = req.user._id

    const items = await Storecart.find({userId})

    if(!items || items.length === 0){
      throw new Error("No item found");
    }

    res.json({items});


  }catch(err){
    res.status(400).json({message : err.message})
  }
})


//clear cart
cartRouter.delete('/cart/clear',userAuth,async (req,res)=>{
  try{
    const userId = req.user._id;

    // Delete all cart items for the user
    const deletedItems = await Storecart.deleteMany({ userId });

    if (deletedItems.deletedCount === 0) {
      throw new Error("Cart is already empty");
    }

    res.json({ message: "Cart cleared successfully!" });

  }catch(err){
    res.status(400).json({error : error.message})
  }
})

module.exports = cartRouter