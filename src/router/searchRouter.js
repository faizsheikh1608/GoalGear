const express = require('express');
const Fuse = require('fuse.js');
const { Product } = require('../models/productSchema');

const searchRouter = express.Router();

//Searching
searchRouter.get('/search/product', async (req, res) => {
  try {
    const { query } = req.query;

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
        'color.colorName'
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

    const exactMatches = formattedResult.filter(product =>
      product.productName.toLowerCase().includes(query.toLowerCase())
    );

    const otherMatches = formattedResult.filter(product =>
      !product.productName.toLowerCase().includes(query.toLowerCase())
    );

    formattedResult = [...exactMatches, ...otherMatches];

    res.json({ products: formattedResult });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = searchRouter;
