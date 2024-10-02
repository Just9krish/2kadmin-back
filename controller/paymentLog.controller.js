const { PAYMENT_TYPE } = require('../constant');
const catchAsyncError = require('../middleware/catchAsyncError');
const paymentLogModel = require('../models/paymentLog.model');
const userModel = require('../models/user.model');
const ErrorHandler = require('../utils/errorHandler');
const sendResponse = require('../utils/sendResponse');

exports.addPayment = catchAsyncError(async (req, res, next) => {
  const { amount, paymentMode, userId } = req.body;
  if (!amount || !paymentMode || !userId) {
    return next(
      new ErrorHandler('Please provide amount, userId and payment mode', 400)
    );
  }

  if (isNaN(amount)) {
    return next(new ErrorHandler('Amount must be a number', 400));
  }

  if (amount <= 0) {
    return next(new ErrorHandler('Amount must be greater than 0', 400));
  }

  if (!PAYMENT_TYPE.includes(paymentMode)) {
    return next(new ErrorHandler('Invalid payment mode', 400));
  }

  const user = await userModel.findById(userId);

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  user.pending = user.pending - amount;

  if (user.pending < 0) {
    return next(new ErrorHandler('Pending amount cannot be negative', 400));
  }

  await user.save();

  const paymentLog = await paymentLogModel.create({
    amount,
    paymentMode,
    user: user._id,
  });

  sendResponse({
    res,
    status: true,
    code: 201,
    message: `Payment added successfully for user ${user.name}`,
    data: {
      paymentLog,
    },
  });
});

exports.getPaymentLog = catchAsyncError(async (req, res, next) => {
  const {
    userId,
    paymentMode,
    startDate,
    endDate,
    sortBy = 'createdAt',
    order = 'desc',
    limit = 10,
    page = 1,
  } = req.body;

  let filters = {};

  if (userId) {
    filters.user = userId;
  }

  if (paymentMode) {
    filters.paymentMode = paymentMode;
  }

  if (startDate || endDate) {
    filters.createdAt = {};
    if (startDate) {
      filters.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      filters.createdAt.$lte = new Date(endDate);
    }
  }

  let sortOptions = {};
  sortOptions[sortBy] = order === 'asc' ? 1 : -1;

  const skip = (page - 1) * limit;

  const paymentLogs = await paymentLogModel
    .find(filters)
    .sort(sortOptions)
    .limit(parseInt(limit))
    .skip(skip)
    .populate('user', 'name number')
    .exec();

  const total = await paymentLogModel.countDocuments(filters);

  const hasMore = page * limit < total;

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Payment logs fetched successfully',
    data: {
      list: paymentLogs,
      hasMore,
      limit,
      page,
      total,
    },
  });
});
