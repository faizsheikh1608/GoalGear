require('dotenv').config({ path: 'key.env' });
const express = require('express');
const Razorpay = require('razorpay');
const User = require('../models/userSchema');
const userAuth = require('../middleware/userAuth');
const Payment = require('../models/paymentSchema');
const {
  validateWebhookSignature,
} = require('razorpay/dist/utils/razorpay-utils');
const Storecart = require('../models/cartSchema');
const Order = require('../models/orderSchema');

const paymentRouter = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

paymentRouter.post('/create-order', userAuth, async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const user = req.user;

    if (!amount || !currency) {
      return res
        .status(400)
        .json({ error: 'Amount and currency are required.' });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        name: user.firstName + ' ' + user.lastName,
        emailId: user.emailId,
        mobile_no: user.mobileNo,
      },
    });

    //save in dataBase

    const payment = new Payment({
      userId: req.user._id,
      status: order.status,
      amount: order.amount / 100,
      orderId: order.id,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const data = await payment.save();

    res.json({ data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//Payment webhook
paymentRouter.post('/payment/webhook', async (req, res) => {
  try {
    //web hook signatue comes is req header
    const webhookSignature = req.get('X-Razorpay-Signature');

    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      'Faiz@123'
    );

    if (!isWebhookValid) {
      throw new Error('Invalid Web hooks signature');
    }

    //seting Status
    const paymentData = req.body.payload.payment.entity;

    const payment = await Payment.findOne({ orderId: paymentData.order_id });
    payment.status = paymentData.status;
    await payment.save();

    const event = req.body.event;

    //payment Success
    if (event === 'payment.captured') {
      const paymentData = req.body.payload.payment.entity;

      // Example: extract order_id, email, amount, etc.
      const { id, order_id, notes, amount, status } = paymentData;

      const { emailId } = notes;

      const user = await User.findOne({ emailId });

      if (!user) throw new Error('User not found');

      //cart items
      const cartItems = await Storecart.find({ userId: user._id })
        .populate('productId', 'productName price')
        .lean();

      const formattedItems = cartItems.map((item) => ({
        productId: item.productId._id,
        productName: item.productId.productName,
        quantity: item.quantity,
        size: item.size,
        price: item.productId.price,
      }));

      const order = new Order({
        userId: user._id,
        items: formattedItems,
        totalAmount: amount / 100,
        paymentId: id,
        orderId: order_id,
      });

      const orderData = await order.save();

      await Storecart.deleteMany({ userId: user._id });

      console.log(
        `Payment captured for order ${order_id} with amount ${amount / 100} INR`
      );

      return res.status(200).json({ success: true });
    }

    //payment Failed
    if (event === 'payment.failed') {
      const failedPayment = req.body.payload.payment.entity;
      const { id, order_id, notes, error_reason, amount } = failedPayment;
      const { emailId } = notes;

      console.log(
        `Payment failed for order ${order_id}, email: ${emailId}, reason: ${error_reason}`
      );

      return res
        .status(200)
        .json({ success: false, message: 'Payment failed event handled' });
    }

    res
      .status(200)
      .json({ success: true, message: `Unhandled event: ${event}` });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

paymentRouter.get('/payment/status', userAuth, async (req, res) => {
  try {
    const { orderId } = req.query;

    if (!orderId) {
      return res.status(400).json({ message: 'Payment ID is required' });
    }

    const payment = await Payment.findOne({ orderId });

    if (payment?.status === 'captured') {
      return res.json({ payment: true });
    }

    res.json({ payment: false });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = paymentRouter;
