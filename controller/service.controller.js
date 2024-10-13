const catchAsyncError = require('../middleware/catchAsyncError');
const serviceModel = require('../models/service.model');
const ErrorHandler = require('../utils/errorHandler');
const sendResponse = require('../utils/sendResponse');

// Add service
exports.addService = catchAsyncError(async (req, res, next) => {
  const { vehicleNo, garage, amount, note } = req.body;

  if (!vehicleNo || !garage || !amount) {
    return next(
      new ErrorHandler('Please provide vehicleNo, garage, and amount', 400)
    );
  }

  const service = new serviceModel({
    vehicleNo,
    garage,
    amount,
    note,
  });

  await service.save();

  sendResponse({
    res,
    status: true,
    code: 201,
    message: 'Service added successfully',
  });
});

// Get all services
exports.getAllServices = catchAsyncError(async (req, res, next) => {
  const {
    vehicleNo,
    garage,
    minAmount,
    maxAmount,
    sortBy = 'createdAt',
    order = 'desc',
    limit = 10,
    page = 1,
  } = req.body;

  let query = {};

  if (vehicleNo) {
    query.vehicleNo = vehicleNo;
  }

  if (garage) {
    query.garage = garage;
  }

  if (minAmount || maxAmount) {
    query.amount = {};
    if (minAmount) query.amount.$gte = parseFloat(minAmount);
    if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
  }

  let sortOptions = {};
  sortOptions[sortBy] = order === 'asc' ? 1 : -1;

  const limitValue = parseInt(limit);
  const pageValue = parseInt(page);
  const skip = (pageValue - 1) * limitValue;

  const services = await serviceModel
    .find(query)
    .sort(sortOptions)
    .limit(limitValue)
    .skip(skip);

  const totalServices = await serviceModel.countDocuments(query);

  const hasMore = pageValue * limitValue < totalServices;

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Services fetched successfully',
    data: {
      list: services,
      hasMore,
      limit,
      page,
      total: totalServices,
    },
  });
});
