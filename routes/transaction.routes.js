const {
  createTransaction,
  getAllTransactions,
  getSingleTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controller/transaction.controller');
const { isVerify } = require('../middleware/auth');

const router = require('express').Router();

router.post('/createTransaction', isVerify, createTransaction);

router.post('/getAllTransaction', isVerify, getAllTransactions);

router.post('/getSingleTransaction', isVerify, getSingleTransaction);

router.post('/updateSingleTransaction', isVerify, updateTransaction);

router.post('/deleteSingleTransaction', isVerify, deleteTransaction);

module.exports = router;
