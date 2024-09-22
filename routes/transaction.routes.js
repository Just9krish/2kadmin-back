const {
  createTransaction,
  getAllTransactions,
  getSingleTransaction,
} = require('../controller/transaction.controller');
const { isVerify } = require('../middleware/auth');

const router = require('express').Router();

router.post('/createTransaction', isVerify, createTransaction);

router.post('/getAllTransaction', isVerify, getAllTransactions);

router.post('/getSingleTransaction', isVerify, getSingleTransaction);

module.exports = router;
