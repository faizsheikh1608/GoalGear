const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true,
  },

  address: {
    area: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    pincode: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isPostalCode(value)) {
          throw new Error('Please Enter the correct PINcode ......');
        }
      },
    },
  },
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
