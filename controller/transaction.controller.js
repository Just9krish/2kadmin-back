const sendResponse = require('../utils/sendResponse');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middleware/catchAsyncError');
const transactionModel = require('../models/transaction.model');
const userModel = require('../models/user.model');

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
    transactionType,
    crusherNo,
    totalAmount,
    pendingAmount,
  } = req.body;

  if (!['BUY', 'SELL'].includes(transactionType)) {
    return next(new ErrorHandler('Invalid transaction type', 400));
  }

  if (transactionType === 'BUY' && !supplier) {
    return next(
      new ErrorHandler('Supplier is required for BUY transactions', 400)
    );
  }

  // Validate customer for SELL transactions
  if (transactionType === 'SELL' && !customer) {
    return next(
      new ErrorHandler('Customer is required for SELL transactions', 400)
    );
  }

  // Calculate totalAmount from rate * quantity
  const calculatedTotalAmount = parseFloat(rate) * parseFloat(quantity);

  // Check if totalAmount is negative
  if (calculatedTotalAmount <= 0) {
    return next(
      new ErrorHandler('Total amount should be a positive number', 400)
    );
  }

  // Check if provided totalAmount matches the calculated value
  if (calculatedTotalAmount !== totalAmount) {
    return next(
      new ErrorHandler(
        'Provided total amount does not match the calculated total amount',
        400
      )
    );
  }

  // Calculate pendingAmount as totalAmount - amountPaid
  const calculatedPendingAmount = totalAmount - amountPaid;

  // Check if pendingAmount is negative
  if (calculatedPendingAmount < 0) {
    return next(new ErrorHandler('Pending amount cannot be negative', 400));
  }

  // Check if provided pendingAmount matches the calculated value
  if (calculatedPendingAmount !== pendingAmount) {
    return next(
      new ErrorHandler(
        'Provided pending amount does not match the calculated pending amount',
        400
      )
    );
  }

  // Create the transaction object
  const transaction = new transactionModel({
    supplier: transactionType === 'BUY' ? supplier : null,
    customer: transactionType === 'SELL' ? customer : null,
    crusherNo: transactionType === 'BUY' ? crusherNo : null,
    material,
    quantity,
    rate,
    passNumber,
    vehicleNumber,
    location,
    amountPaid,
    pendingAmount: calculatedPendingAmount,
    totalAmount: calculatedTotalAmount,
    transactionType: transactionType === 'BUY' ? 'BUY' : 'SELL',
  });

  await transaction.save();

  if (transactionType === 'SELL' && customer) {
    await userModel.findByIdAndUpdate(customer, {
      $inc: { pending: calculatedPendingAmount },
    });
  } else if (transactionType === 'BUY' && supplier) {
    await userModel.findByIdAndUpdate(supplier, {
      $inc: { pending: calculatedPendingAmount },
    });
  }

  sendResponse({
    res,
    status: true,
    code: 200,
    message: `Transaction ${transactionType}ED successfully`,
    data: {
      transaction,
    },
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

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Transaction fetched successfully',
    data: {
      transaction,
    },
  });
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
    status: true,
    code: 200,
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

// update transaction
exports.updateTransaction = catchAsyncError(async (req, res, next) => {
  const { transactionId, updateData } = req.body;

  if (!transactionId) {
    return next(new ErrorHandler('Please provide transaction Id', 400));
  }

  if (
    !updateData ||
    typeof updateData !== 'object' ||
    Object.keys(updateData).length === 0
  ) {
    return next(new ErrorHandler('No fields provided to update', 400));
  }

  const transaction = await transactionModel.findById(transactionId);
  if (!transaction) {
    return next(new ErrorHandler('Transaction not found', 404));
  }

  Object.keys(updateData).forEach((key) => {
    if (updateData[key] !== undefined && updateData[key] !== null) {
      transaction[key] = updateData[key];
    }
  });

  await transaction.save();

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Transaction updated successfully',
    data: {
      transaction,
    },
  });
});

// Delete Transction by id
exports.deleteTransaction = catchAsyncError(async (req, res, next) => {
  const { transactionId } = req.body;
  if (!transactionId) {
    return next(new ErrorHandler('Please provide transaction Id', 400));
  }
  const transaction = await transactionModel.findByIdAndDelete(transactionId);
  if (!transaction) {
    return next(new ErrorHandler('Transaction not found', 404));
  }

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Transaction deleted successfully',
  });
});
