const {
  createUser,
  getUser,
  deleteUser,
  updateUser,
  getAllUsers,
} = require('../controller/user.controller');
const { isVerify } = require('../middleware/auth');

const router = require('express').Router();

router.post('/createUser', isVerify, createUser);

router.post('/gerSingleUserbyId', isVerify, getUser);

router.post('/deleteUserById', isVerify, deleteUser);

router.post('/updateUser', isVerify, updateUser);

router.post('/getAllUser', isVerify, getAllUsers);

module.exports = router;
