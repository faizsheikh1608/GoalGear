require('dotenv').config({ path: 'key.env' });
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const userAuth = require('../middleware/userAuth');
const Payment = require('../models/paymentSchema');

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
