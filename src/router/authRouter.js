require('dotenv').config();
const express = require('express');
const User = require('../models/userSchema.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validateSignup = require('../helper/validateSignup.js');
const userAuth = require('../middleware/userAuth.js');

const authRouter = express.Router();
const Secret_Key = process.env.Secret_Key || 'Faiz@123';

//Signup
authRouter.post('/signup', async (req, res) => {
  try {
    validateSignup(req);

    const { firstName, lastName, emailId, password, age, gender } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashPassword,
      age,
      gender,
    });

    await user.save();
    res.send('data added Successfully');
  } catch (err) {
    res.status(400).send('ERROR : ' + err);
  }
});

//Login
authRouter.post('/login', async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId });

    if (!user) {
      throw new Error('email credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('password credentials');
    }

    const token = jwt.sign({ _id: user._id }, Secret_Key, {
      expiresIn: '1d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });
    res.json({ user, message: 'Login Successfully...' });
  } catch (err) {
    res.status(400).send('ERROR : ' + err);
  }
});

//Logout
authRouter.post('/logout', async (req, res) => {
  try {
    res.cookie('token', '', {
      expires: new Date(0),
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });
    res.send('Logout Successfully');
  } catch (err) {
    res.status(400).send('ERROR : ' + err);
  }
});

module.exports = authRouter;
