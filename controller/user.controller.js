const catchAsyncError = require('../middleware/catchAsyncError');
const { USER_TYPE } = require('../constant');
const userModel = require('../models/user.model');
const sendResponse = require('../utils/sendResponse');
const ErrorHandler = require('../utils/errorHandler');

// create user
exports.createUser = catchAsyncError(async (req, res, next) => {
  const { name, number, type } = req.body;

  // Validate input data
  if (!name || !number || !type) {
    return next(new ErrorHandler('Please provide name, number, and type', 400));
  }

  // check valid type
  if (!USER_TYPE.includes(type.toString().trim())) {
    return next(new ErrorHandler('Invalid user type', 400));
  }

  // check if user already exists
  const userExists = await userModel.findOne({
    number,
  });

  if (userExists) {
    return next(new ErrorHandler('User already exists', 400));
  }

  const user = await userModel.create({
    name,
    number,
    type: type.toString().trim(),
  });

  sendResponse({
    res,
    status: true,
    code: 201,
    data: { user },
    message: `${type} created successfully`,
  });
});

// update user
exports.updateUser = catchAsyncError(async (req, res, next) => {
  const { name, number, type, userId: id } = req.body;

  // Validate input data
  if (!name || !number || !type || !id) {
    return next(
      new ErrorHandler('Please provide name, number, type, and user id', 400)
    );
  }

  // check valid type
  if (!USER_TYPE.includes(type.toString().trim())) {
    return next(new ErrorHandler('Invalid user type', 400));
  }

  const user = await userModel.findByIdAndUpdate(
    id,
    {
      name,
      number,
      type: type.toString().trim(),
    },
    { new: true }
  );

  sendResponse({
    res,
    status: true,
    code: 201,
    data: { user },
    message: `${type} updated successfully`,
  });
});

// delete user
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const { userId: id } = req.body;

  // Validate input data
  if (!id) {
    return next(new ErrorHandler('Please provide user id', 400));
  }

  await userModel.findByIdAndDelete(id);

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'User deleted successfully',
  });
});

// get all users
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const {
    type,
    limit = 10,
    page = 1,
    searchInput,
    sortOrder = 'desc',
  } = req.body;

  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;

  if (type && !USER_TYPE.includes(type.toString().trim())) {
    return next(new ErrorHandler('Invalid user type', 400));
  }

  let query = {};

  if (searchInput?.trim()) {
    query = {
      $or: [
        { name: { $regex: searchInput, $options: 'i' } },
        { number: { $regex: searchInput, $options: 'i' } },
      ],
    };
  }

  if (type) {
    query = { ...query, type: type.toString().trim() };
  }

  const sortOptions = { createdAt: sortOrder === 'asc' ? 1 : -1 };

  const userCount = await userModel.countDocuments(query);

  const users = await userModel
    .find(query)
    .sort(sortOptions)
    .limit(limitNum)
    .skip(limitNum * (pageNum - 1));

  const hasMore = userCount > limitNum * pageNum;

  // Send response
  sendResponse({
    res,
    status: true,
    code: 200,
    data: {
      list: users,
      total: userCount,
      hasMore,
      page: pageNum,
      limit: limitNum,
    },
    message: `${type ? type + ' users' : 'Users'} fetched successfully`,
  });
});

// get user
exports.getUser = catchAsyncError(async (req, res, next) => {
  const { userId: id } = req.body;

  const user = await userModel.findById(id);

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  sendResponse({
    res,
    status: true,
    code: 200,
    data: user,
    message: 'User fetched successfully',
  });
});
