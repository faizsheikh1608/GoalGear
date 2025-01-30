const express = require('express');
const userAuth = require('../middleware/userAuth');
const { Product } = require('../models/productSchema');
const Review = require('../models/reviewSchema');

const reviewRouter = express.Router();

//Add review

reviewRouter.post('/review/add', userAuth, async (req, res) => {
  try {
    const { productId, review } = req.body;

    if (!productId || !review) {
      throw new Error('please add details in review!');
    }

    const product = await Product.findById({ _id: productId });

    if (!product) {
      throw new Error('Product not Found');
    }

    const reviewd = new Review({
      userId: req.user._id,
      productId,
      review,
    });

    await reviewd.save();

    res.json({ message: 'Review added Successfully !' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//getting review

reviewRouter.get('/review/get/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      throw new Error('Please provide product Id');
    }

    const product = await Product.findById({ _id: productId });

    if (!product) {
      throw new Error('Product Not Found!');
    }

    const reviews = await Review.find({ productId }).populate('userId', ['firstName']);

    if (!reviews) {
      throw new Error('No review found');
    }

    res.json({ reviews });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = reviewRouter;
