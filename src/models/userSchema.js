const mongoose = require('mongoose');
const validator = require('validator');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      maxLength: 50,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    emailId: {
      type: String,
      unique: true,
      trim: true,
      required: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Please Enter Valid Email Id .....');
        }
      },
    },
    mobileNo: {
      type: String,
      validate(value) {
        if (!validator.isMobilePhone(value)) {
          throw new Error('Please Enter valid mobile number......');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 8,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error('Please Enter Strong Password....');
        }
      },
    },
    age: {
      type: Number,
      trim: true,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!['male', 'female', 'other'].includes(value)) {
          throw new Error('Please Enter Valid Gender ......');
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
