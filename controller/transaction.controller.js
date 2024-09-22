const sendResponse = require('../utils/sendResponse');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middleware/catchAsyncError');
const transactionModel = require('../models/transaction.model');

// Create a new Transaction (Buy or Sell)
exports.createTransaction = catchAsyncError(async (req, res, next) => {
  const {
    supplier,
    customer,
    material,
    quantity,
    rate,
    passNumber,
    vehicleNumber,
    location,
    amountPaid,
    pendingAmount,
  } = req.body;

  if (
    !supplier ||
    !customer ||
    !material ||
    !quantity ||
    !rate ||
    !passNumber ||
    !vehicleNumber ||
    !location
  ) {
    return next(new ErrorHandler('Please provide all required fields', 400));
  }

  const transaction = new transactionModel({
    supplier: supplier || null,
    customer: customer || null,
    material,
    quantity,
    rate,
    passNumber,
    vehicleNumber,
    location,
    amountPaid,
    pendingAmount,
    transactionType: req.body.transactionType || 'BUY',
    crusherNo: req.body.crusherNo || null,
  });

  await transaction.save();

  // Update customer or supplier balance based on the transaction
  if (customer) {
    await User.findByIdAndUpdate(customer, {
      $inc: { balance: amountPaid, pending: pendingAmount },
    });
  } else if (supplier) {
    await User.findByIdAndUpdate(supplier, {
      $inc: { balance: -amountPaid, pending: pendingAmount },
    });
  }

  sendResponse(res, 201, 'Transaction created successfully', {
    transaction,
  });
});

// Get Single Transaction by Id
exports.getSingleTransaction = catchAsyncError(async (req, res, next) => {
  const { transactionId } = req.body;

  if (!transactionId) {
    return next(new ErrorHandler('Please provide transaction Id', 400));
  }

  const transaction = await transactionModel.findById(transactionId);

  if (!transaction) {
    return next(new ErrorHandler('Transaction not found', 404));
  }

  sendResponse(res, 200, 'Transaction found', { transaction });
});

// Get All Transactions
exports.getAllTransactions = catchAsyncError(async (req, res, next) => {
  const { userId, type, limit = 10, page = 1 } = req.body;

  let query = {};

  // If transaction type is provided, filter by it
  if (type) {
    query.transactionType = type;
  }

  // If userId is provided, fetch only transactions related to that user
  if (userId) {
    query.$or = [{ customer: userId }, { supplier: userId }];
  }

  // Execute the query with pagination
  const transactions = await transactionModel
    .find(query)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  // Count total documents that match the query
  const count = await transactionModel.countDocuments(query);

  // Determine if more pages exist
  const hasMore = page * limit < count;

  // Send the response with transaction data
  sendResponse({
    res,
    statusCode: 200,
    message: 'Transactions fetched successfully',
    data: {
      list: transactions,
      hasMore,
      limit,
      page,
      total: count,
    },
  });
});
