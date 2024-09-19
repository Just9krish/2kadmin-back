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
    data: token,
  });
});
