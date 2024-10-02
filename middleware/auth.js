const adminModel = require('../models/admin.model');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('./catchAsyncError');
const jwt = require('jsonwebtoken');

exports.isVerify = catchAsyncError(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new ErrorHandler('Please login to continue', 400));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded) {
    return next(new ErrorHandler('Invalid token', 403));
  }

  req.user = decoded;

  next();
});
