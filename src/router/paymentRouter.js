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
const { OrderedBulkOperation } = require('mongodb');

const paymentRouter = express.Router();

console.log('Razorpay Key ID:', process.env.RAZORPAY_KEY_ID);
console.log('Razorpay Key Secret:', process.env.RAZORPAY_KEY_SECRET);

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

    const event = req.body.event;

    if (event === 'payment.captured') {
      console.log('Body : ', req.body);
      const paymentData = req.body.payload.payment.entity;

      console.log('paymentData :', paymentData);

      // Example: extract order_id, email, amount, etc.
      const { id, order_id, notes, amount, status } = paymentData;

      const { emailId } = notes;

      console.log('Email from Notes:', emailId);

      const user = await User.findOne({ emailId });

      console.log('User :', user);

      if (!user) throw new Error('User not found');

      //cart items
      const cartItems = await Storecart.find({ userId: user._id }).lean();

      console.log('cartItems :', cartItems);

      const formattedItems = cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        size: item.size,
        price: item.price,
      }));

      console.log('formattedItems :', formattedItems);

      const order = new OrderedBulkOperation({
        userId: user._id,
        items: formattedItems,
        totalAmount: amount / 100,
        paymentId: id,
        orderId: order_id,
      });

      const orderData = await order.save();

      console.log('Order : ', orderData);

      console.log(
        `Payment captured for order ${order_id} with amount ${amount / 100} INR`
      );

      res.status(200).json({ success: true });
    } else {
      res
        .status(200)
        .json({ success: true, message: `Unhandled event: ${event}` });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
/*
// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order API
paymentRouter.post('/create-order', async (req, res) => {
  try {
    const { amount, currency } = req.body; // Amount in smallest currency unit (INR: paise)

    const options = {
      amount: amount * 100, // Convert INR to paisa (1 INR = 100 paisa)
      currency: currency || 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Payment Signature
paymentRouter.post('/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res
        .status(400)
        .json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

*/

module.exports = paymentRouter;
