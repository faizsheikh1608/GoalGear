const express = require('express');
const Fuse = require('fuse.js');
const { Product } = require('../models/productSchema');
const { Order } = require('../models/orderSchema');

const searchRouter = express.Router();

// SEARCH ORDERS by query string
searchRouter.get('/search/order', async (req, res) => {
  try {
    const { query, page = 1, limit = 8 } = req.query;

    if (!query) {
      return res
        .status(400)
        .json({ message: 'Please provide a search query!' });
    }

    const orders = await Order.find();

    // Prepare searchable data
    const searchableOrders = orders.map((order) => ({
      _id: order._id,
      orderId: order.orderId || order._id.toString(),
      itemsString: order.items.map((item) => item.productName).join(' '), // for Fuse
      items: order.items, // for post filtering
      original: order,
    }));

    const options = {
      includeScore: true,
      threshold: 0.3,
      keys: ['orderId', 'itemsString'],
    };

    let fuse = new Fuse(searchableOrders, options);
    let result = fuse.search(query);

    // Retry with looser threshold if no results
    if (result.length === 0) {
      options.threshold = 0.5;
      fuse = new Fuse(searchableOrders, options);
      result = fuse.search(query);
    }

    if (result.length === 0) {
      throw new Error('No matching orders found!');
    }

    // Extract matched original orders
    let formattedResult = result.map((item) => item.item.original);

    // Exact match boost
    const exactMatches = formattedResult.filter(
      (order) =>
        (order.orderId &&
          order.orderId.toLowerCase().includes(query.toLowerCase())) ||
        order.items.some(
          (item) =>
            item.productName &&
            item.productName.toLowerCase().includes(query.toLowerCase())
        )
    );

    const otherMatches = formattedResult.filter(
      (order) => !exactMatches.includes(order)
    );

    formattedResult = [...exactMatches, ...otherMatches];

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedOrders = formattedResult.slice(startIndex, endIndex);

    const totalCount = formattedResult.length;
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      orders: paginatedOrders,
      currentPage: parseInt(page),
      totalPages,
      totalCount,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = searchRouter;
