const express = require('express');
const userAuth = require('../middleware/userAuth.js');
const {Product} = require("../models/productSchema.js");
const mongoose = require("mongoose");
const productRouter = express.Router();


//geting all product
productRouter.get('/allProducts' , async (req,res) => {
    try{
        const product = await Product.find();

        res.json({product})

    }catch(err){
        res.status(400).json({message : err.message})
    }
})


//getting specific category 
productRouter.get('/filter/product' , async (req,res) => {
    try{
    const {category} = req.query;

    if(!category){
        throw new Error("category is required");
    }

    const product = await Product.find({category});

    res.json({product});
}catch(err){
    res.status(400).json({message : err.message});
}

});


//Setting up Product
productRouter.post('/product/add' , async (req,res) => {
    try{

        const {productName,price,description,stock,color,category} = req.body;

        if (!productName || !price  || !stock || !color || !category) {
            throw new Error({message: "All required fields must be provided" });
        }

        if(!description.descriptionHeading || description.descriptionData.length === 0){
            throw new Error("description details must be provided and should be an array");
        }

       

        if (!Array.isArray(color) || color.length === 0) {
            throw new Error("Color details must be provided and should be an array");
        }

        for (const col of color) {
            if (!col.colorName || !col.mainImageUrl || !col.hoverImageUrl) {
                throw new Error("Each color must include 'colorName', 'mainImageUrl', and 'hoverImageUrl'");
            }
        }

        let size,shoeSize;

        if(category === 'Shoes' ){
            shoeSize = req.body.shoeSize;

            if(!shoeSize){
                throw new Error({message: "All required fields must be provided" });
            }
            const product = new Product({
                productName,
                price : parseFloat(price),
                description,
                stock,
                color,
                
                category,
                shoeSize
            });

            await product.save();
        }else{
            size = req.body.size;
            if(!size){
                throw new Error("All required fields must be provided");
            }
            const product = new Product({
                productName,
                price : parseFloat(price),
                description,
                stock,
                color,
             
                category,
                size,
            })
            await product.save();
        }

       
            
        res.json({message : "Product added successfully"})

    }catch(err){
        res.status(400).json({message : err.message})
    }
})


//particular product
productRouter.get("/product/:productId",async(req,res) => {
    try{
        const {productId} = req.params;

        if(!mongoose.Types.ObjectId.isValid(productId)){
            throw new Error('Please provide productId')
        }

        const product = await Product.findById({_id : productId});

        if(!product){
            throw new error("Product is Not Found")
        }

        res.json({product})
    }catch(err){
        res.status(400).json({message : err.message})
    }
})


module.exports = productRouter;