const express = require('express');
const userAuth = require('../middleware/userAuth');
const Order = require('../models/orderSchema');

const orderRouter = express.Router();

orderRouter.get('/orders', userAuth, async (req, res) => {
  try {
    const user = req.user;
    const { page } = req.query;
    const LIMIT = 5;
    const skip = (page - 1) * LIMIT;

    const data = await Order.find({ userId: user._id }).skip(skip).limit(LIMIT);

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.json({ data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = orderRouter;
