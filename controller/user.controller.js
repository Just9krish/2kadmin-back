const catchAsyncError = require('../middleware/catchAsyncError');

const { USER_TYPE } = require('../constant');
const userModel = require('../models/user.model');
const sendResponse = require('../utils/sendResponse');

exports.createUser = catchAsyncError(async (req, res, next) => {
  const { name, email, type } = req.body;

  // Validate input data
  if (!name || !email || !type) {
    return res
      .status(400)
      .json({ error: 'Please provide name, email, and type' });
  }

  // check valid type
  if (!USER_TYPE.includes(type.toString().trim())) {
    return res.status(400).json({ error: 'Invalid user type' });
  }

  const user = await userModel.create({
    name,
    email,
    type: type.toString().trim(),
  });

  sendResponse({
    res,
    status: true,
    code: 201,
    data: user,
    message: 'User created successfully',
  });
});

exports.updateUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, type } = req.body;

  // Validate input data
  if (!name || !email || !type) {
    return res
      .status(400)
      .json({ error: 'Please provide name, email, and type' });
  }

  // check valid type
  if (!USER_TYPE.includes(type.toString().trim())) {
    return res.status(400).json({ error: 'Invalid user type' });
  }

  const user = await userModel.findByIdAndUpdate(
    id,
    {
      name,
      email,
      type: type.toString().trim(),
    },
    { new: true }
  );

  sendResponse({
    res,
    status: true,
    code: 200,
    data: user,
    message: 'User updated successfully',
  });
});

exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  await userModel.findByIdAndDelete(id);

  sendResponse({
    res,
    status: true,
    code: 200,
    message: 'User deleted successfully',
  });
});

exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await userModel.find();

  sendResponse({
    res,
    status: true,
    code: 200,
    data: users,
    message: 'Users fetched successfully',
  });
});

exports.getUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

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
