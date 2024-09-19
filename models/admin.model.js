const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    default: '',
  },
  otp: {
    type: String,
    default: '',
  },
  otp_expiry: {
    type: Date,
    default: '',
  },
});

module.exports = mongoose.model('Admin', adminSchema);
