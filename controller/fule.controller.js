const catchAsyncError = require('../middleware/catchAsyncError');
const fuelModel = require('../models/fuel.model');
const sendResponse = require('../utils/sendResponse');

// Fule
exports.createFuel = catchAsyncError(async (req, res, next) => {
  const { vehicleNo, pumpLocation, liters, rate, amount } = req.body;
  if (!vehicleNo || !pumpLocation || !liters || !rate || !amount) {
    return next(
      new ErrorHandler(
        'Please provide vehicleNo, pumpLocation, liters, rate, and amount',
        400
      )
    );
  }

  const fuel = new fuelModel({
    vehicleNo,
    pumpLocation,
    liters,
    rate,
    amount,
  });

  await fuel.save();

  sendResponse({
    res,
    status: true,
    code: 201,
    message: 'Fuel added successfully',
  });
});

// Get all fuel
exports.getAllFuel = catchAsyncError(async (req, res, next) => {
  const {
    vehicleNo,
    pumpLocation,
    minLiters,
    maxLiters,
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

  if (pumpLocation) {
    query.pumpLocation = pumpLocation;
  }

  if (minLiters || maxLiters) {
    query.liters = {};
    if (minLiters) query.liters.$gte = parseFloat(minLiters);
    if (maxLiters) query.liters.$lte = parseFloat(maxLiters);
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

  const fuels = await fuelModel
    .find(query)
    .sort(sortOptions)
    .limit(limitValue)
    .skip(skip);

  const totalFuels = await fuelModel.countDocuments(query);

  const hasMore = pageValue * limitValue < totalFuels;

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'Fuels fetched successfully',
    data: {
      list: fuels,
      hasMore,
      limit,
      page,
      total: totalFuels,
    },
  });
});
