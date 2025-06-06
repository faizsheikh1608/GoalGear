const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        productName: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        size: {
          type: String,
        },
        mainImageUrl: {
          type: String,
        },
        price: {
          type: String,
        },
        status: {
          type: String,
          enum: ['pending', 'confirmed', 'shipped', 'delivered'],
          default: 'confirmed',
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentId: String,
    orderId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
