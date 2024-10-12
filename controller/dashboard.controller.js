const catchAsyncError = require('../middleware/catchAsyncError');
const userModel = require('../models/user.model');
const sendResponse = require('../utils/sendResponse');

// Dashboard API
exports.dashboardStats = catchAsyncError(async (req, res) => {
  // 1. Count total unique customers (users with type 'customer')
  const customerCount = await userModel.countDocuments({ type: 'customer' });

  // 2. Count total unique suppliers (users with type 'supplier')
  const supplierCount = await userModel.countDocuments({ type: 'supplier' });

  // 3. Calculate total pending amounts for customers
  const totalCustomerPending = await userModel.aggregate([
    {
      $match: { type: 'customer' },
    },
    {
      $group: {
        _id: null,
        totalPendingAmount: { $sum: '$pending' }, // Sum the 'pending' field for customers
      },
    },
  ]);

  // 4. Calculate total pending amounts for suppliers
  const totalSupplierPending = await userModel.aggregate([
    {
      $match: { type: 'supplier' },
    },
    {
      $group: {
        _id: null,
        totalPendingAmount: { $sum: '$pending' }, // Sum the 'pending' field for suppliers
      },
    },
  ]);

  // Extract total pending amounts from the aggregation results
  const totalCustomerPendingAmount =
    totalCustomerPending.length > 0
      ? totalCustomerPending[0].totalPendingAmount
      : 0;
  const totalSupplierPendingAmount =
    totalSupplierPending.length > 0
      ? totalSupplierPending[0].totalPendingAmount
      : 0;

  // Send the response
  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Dashboard stats fetched successfully',
    data: {
      customerCount,
      supplierCount,
      totalCustomerPendingAmount,
      totalSupplierPendingAmount,
    },
  });
});
