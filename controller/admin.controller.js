const catchAsyncError = require('../middleware/catchAsyncError');
const adminModel = require('../models/admin.model');
const ErrorHandler = require('../utils/errorHandler');
const sendResponse = require('../utils/sendResponse');

exports.adminLogin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler('Please enter email and password', 400));
  }

  if (!checkValidEmail(email)) {
    return next(new ErrorHandler('Please enter a valid email', 400));
  }

  const admin = adminModel.findOne({ email });

  if (!admin) {
    return next(new ErrorHandler('Invalid email or password', 400));
  }

  if (!admin.password) {
    return next(
      new ErrorHandler('Please set your password using forgot password', 400)
    );
  }

  const isMatch = await admin.comparePassword(password);

  if (!isMatch) {
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  // Generate JWT token
  const token = admin.generateJWT();

  sendResponse({
    res,
    code: 200,
    status: true,
    message: 'Admin logged in successfully',
    data: { token },
  });
});

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler('Please enter email', 400));
  }

  if (!checkValidEmail(email)) {
    return next(new ErrorHandler('Please enter a valid email', 400));
  }

  const admin = adminModel.findOne({ email });

  if (!admin) {
    return next(new ErrorHandler('Invalid email', 400));
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  admin.otp = otp;
  admin.otp_expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  await admin.save();

  // ## TODO: Send OTP to email

  sendResponse({
    res,
    code: 200,
    status: true,
    message: 'Password reset link sent to your email',
  });
});

exports.verifyOtp = catchAsyncError(async (req, res, next) => {
  const { email, otp, password } = req.body;

  if (!email || !otp || !password) {
    return next(new ErrorHandler('Please enter email, otp and password', 400));
  }

  if (!checkValidEmail(email)) {
    return next(new ErrorHandler('Please enter a valid email', 400));
  }

  const admin = adminModel.findOne({ email });

  if (!admin) {
    return next(new ErrorHandler('Invalid email', 400));
  }

  if (admin.otp !== otp || new Date() > admin.otp_expiry) {
    return next(new ErrorHandler('Invalid OTP', 400));
  }

  admin.otp = null;
  admin.otp_expiry = null;
  admin.password = password;
  await admin.save();

  sendResponse({
    res,
    code: 200,
    status: true,
    message: 'Password reset successful',
  });
});
