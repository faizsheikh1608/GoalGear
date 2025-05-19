const express = require('express');
const userAuth = require('../middleware/userAuth');
const Order = require('../models/orderSchema');

const orderRouter = express.Router();

orderRouter.get('/orders', userAuth, async (req, res) => {
  try {
    const user = req.user;
    const page = Math.max(1, parseInt(req.query.page)) || 1;
    const LIMIT = 5;

    // 1. Fetch all user orders sorted by createdAt desc
    const allOrders = await Order.find({ userId: user._id }).sort({
      createdAt: -1,
    });

    if (!allOrders || allOrders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }

    // 2. Flatten all items from orders into one array with some order info if needed
    const allItems = allOrders.flatMap((order) =>
      order.items.map((item) => ({
        ...(item.toObject ? item.toObject() : item), // toObject for mongoose docs
        orderCreatedAt: order.createdAt,
        orderId: order._id.toString(),
      }))
    );

    // 3. Paginate the flattened items array
    const totalItems = allItems.length;
    const totalPages = Math.ceil(totalItems / LIMIT);
    const start = (page - 1) * LIMIT;
    const paginatedItems = allItems.slice(start, start + LIMIT);

    // 4. Send paginated items with currentPage and totalPages
    res.json({ data: paginatedItems, currentPage: page, totalPages });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = orderRouter;
