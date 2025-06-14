const express = require('express');
const Fuse = require('fuse.js');
const { Product } = require('../models/productSchema');
const Order = require('../models/orderSchema');

const searchRouter = express.Router();

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

    let fuse = new Fuse(products, options);
    let result = fuse.search(query);

    // Loosen threshold if nothing found
    if (result.length === 0) {
      options.threshold = 0.5;
      fuse = new Fuse(products, options);
      result = fuse.search(query);
    }

    if (result.length === 0) {
      throw new Error('No products found for your query');
    }

    let formattedResult = result.map((item) => item.item);

    const exactMatches = formattedResult.filter((product) =>
      product.productName.toLowerCase().includes(query.toLowerCase())
    );

    const otherMatches = formattedResult.filter(
      (product) => !exactMatches.includes(product)
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

// SEARCH ORDERS by query string
searchRouter.get('/search/order', userAuth, async (req, res) => {
  try {
    const { query, page = 1, limit = 8 } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Please provide a search query!' });
    }

    // 🔐 Get only orders of the logged-in user
    const orders = await Order.find({ userId: req.user._id });

    const searchableOrders = orders.map((order) => ({
      _id: order._id,
      orderId: order.orderId || order._id.toString(),
      itemsString: order.items.map((item) => item.productName?.toLowerCase()).join(' '),
      items: order.items,
      original: order,
    }));

    const options = {
      includeScore: true,
      threshold: 0.4, // allows minor typos
      keys: ['orderId', 'itemsString'],
    };

    let fuse = new Fuse(searchableOrders, options);
    let result = fuse.search(query.toLowerCase());

    // Retry with looser threshold if no match
    if (result.length === 0) {
      options.threshold = 0.6;
      fuse = new Fuse(searchableOrders, options);
      result = fuse.search(query.toLowerCase());
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'No matching orders found!' });
    }

    let matchedOrders = result.map((item) => item.item.original);

    // ✅ Prioritize exact matches
    const exactMatches = matchedOrders.filter(
      (order) =>
        (order.orderId &&
          order.orderId.toLowerCase().includes(query.toLowerCase())) ||
        order.items.some(
          (item) =>
            item.productName &&
            item.productName.toLowerCase().includes(query.toLowerCase())
        )
    );

    const otherMatches = matchedOrders.filter(
      (order) => !exactMatches.includes(order)
    );

    matchedOrders = [...exactMatches, ...otherMatches];

    // 🔁 Flatten items for better pagination
    const allItems = matchedOrders.flatMap((order) =>
      order.items.map((item) => ({
        ...(item.toObject ? item.toObject() : item),
        orderCreatedAt: order.createdAt,
        orderId: order._id.toString(),
      }))
    );

    // 🔢 Pagination logic
    const totalItems = allItems.length;
    const totalPages = Math.ceil(totalItems / limit);
    const start = (page - 1) * limit;
    const paginatedItems = allItems.slice(start, start + parseInt(limit));

    res.json({
      data: paginatedItems,
      currentPage: parseInt(page),
      totalPages,
      totalItems,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


module.exports = searchRouter;
