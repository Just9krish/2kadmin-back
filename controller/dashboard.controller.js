const catchAsyncError = require('../middleware/catchAsyncError');
const transactionModel = require('../models/transaction.model');
const sendResponse = require('../utils/sendResponse');

// Utility function to get the first and last day of the current month
const getMonthDateRange = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of the month
  return { firstDay, lastDay };
};

// Dashboard API
exports.dashboardStats = catchAsyncError(async (req, res) => {
  const { firstDay, lastDay } = getMonthDateRange();

  // 1. Count unique customers who made SELL transactions this month
  const customerCount = await transactionModel
    .distinct('customer', {
      transactionType: 'SELL',
      createdAt: { $gte: firstDay, $lte: lastDay },
    })
    .countDocuments();

  // 2. Count unique suppliers who made BUY transactions this month
  const supplierCount = await transactionModel
    .distinct('supplier', {
      transactionType: 'BUY',
      createdAt: { $gte: firstDay, $lte: lastDay },
    })
    .countDocuments();

  // 3. Calculate profit/loss
  const sellTransactions = await transactionModel.aggregate([
    {
      $match: {
        transactionType: 'SELL',
        createdAt: { $gte: firstDay, $lte: lastDay },
      },
    },
    {
      $group: {
        _id: null,
        totalSellAmount: { $sum: '$amountPaid' }, // Sum the amountPaid for SELL transactions
      },
    },
  ]);

  const buyTransactions = await transactionModel.aggregate([
    {
      $match: {
        transactionType: 'BUY',
        createdAt: { $gte: firstDay, $lte: lastDay },
      },
    },
    {
      $group: {
        _id: null,
        totalBuyAmount: { $sum: '$amountPaid' },
      },
    },
  ]);

  const totalSellAmount =
    sellTransactions.length > 0 ? sellTransactions[0].totalSellAmount : 0;
  const totalBuyAmount =
    buyTransactions.length > 0 ? buyTransactions[0].totalBuyAmount : 0;

  const profitLoss = totalSellAmount - totalBuyAmount;

  // Send the response
  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Dashboard stats fetched successfully',
    data: {
      customerCount,
      supplierCount,
      profitLoss,
    },
  });
});
