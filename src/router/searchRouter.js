const express = require('express');
const Fuse = require('fuse.js');
const { Product } = require('../models/productSchema');
const { Order } = require('../models/orderSchema');

const searchRouter = express.Router();

//Searching
searchRouter.get('/search/product', async (req, res) => {
  try {
    const { query, page = 1, limit = 8 } = req.query;

    if (!query) {
      return res
        .status(400)
        .json({ message: 'Please provide a search query!' });
    }

    const products = await Product.find();

    const options = {
      includeScore: true,
      threshold: 0.3,
      keys: [
        'productName',
        'category',
        'description.descriptionHeading',
        'description.descriptionData',
        'color.colorName',
      ],
    };

    const fuse = new Fuse(products, options);
    let result = fuse.search(query);

    if (result.length === 0) {
      options.threshold = 0.5; // Allow more leniency in spelling mistakes
      const fuzzySearch = new Fuse(products, options);
      result = fuzzySearch.search(query);
    }

    if (result.length === 0) {
      throw new Error('No products found for your query');
    }

    let formattedResult = result.map((item) => item.item);

    const exactMatches = formattedResult.filter((product) =>
      product.productName.toLowerCase().includes(query.toLowerCase())
    );

    const otherMatches = formattedResult.filter(
      (product) =>
        !product.productName.toLowerCase().includes(query.toLowerCase())
    );

    formattedResult = [...exactMatches, ...otherMatches];

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = formattedResult.slice(startIndex, endIndex);

    const totalCount = formattedResult.length;
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      products: paginatedProducts,
      currentPage: parseInt(page),
      totalPages,
      totalCount,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

searchRouter.get('/search/order', async (req, res) => {
  try {
    const { query, page = 1, limit = 8 } = req.query;

    if (!query) {
      return res
        .status(400)
        .json({ message: 'Please provide a search query!' });
    }

    const orders = await Order.find();

    // Make searchable version of orders
    const searchableOrders = orders.map((order) => ({
      _id: order._id,
      orderId: order.orderId || order._id.toString(),
      items: order.items.map((item) => item.productName).join(' '),
      original: order,
    }));

    const options = {
      includeScore: true,
      threshold: 0.3,
      keys: ['orderId', 'items'],
    };

    let fuse = new Fuse(searchableOrders, options);
    let result = fuse.search(query);

    // Try fuzzy again with looser threshold if no result
    if (result.length === 0) {
      options.threshold = 0.5;
      fuse = new Fuse(searchableOrders, options);
      result = fuse.search(query);
    }

    if (result.length === 0) {
      throw new Error('No matching orders found');
    }

    let formattedResult = result.map((item) => item.item.original);

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
