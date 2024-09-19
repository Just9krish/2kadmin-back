const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// Hash password before saving
adminSchema.pre('save', async function (next) {
  const admin = this;
  if (!admin.isModified('password')) return next();
  admin.password = await bcrypt.hash(admin.password, 10);
  next();
});

// Compare password
adminSchema.methods.comparePassword = async function (candidatePassword) {
  const admin = this;
  return await bcrypt.compare(candidatePassword, admin.password);
};

// Generate JWT token
adminSchema.methods.generateJWT = function () {
  const admin = this;
  const token = jwt.sign({ _id: admin._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
  return token;
};

module.exports = mongoose.model('Admin', adminSchema);
