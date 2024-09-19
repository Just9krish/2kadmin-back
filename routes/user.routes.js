const {
  createUser,
  getUser,
  deleteUser,
  updateUser,
} = require('../controller/user.controller');
const { isVerify } = require('../middleware/auth');

const router = require('express').Router();

router.post('/createUser', isVerify, createUser);

router.post('/gerSingleUserbyId', isVerify, getUser);

router.post('/deleteUserById', isVerify, deleteUser);

router.post('/updateUser', isVerify, updateUser);

module.exports = router;
