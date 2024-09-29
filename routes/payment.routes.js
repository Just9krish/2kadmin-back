const {
  addPayment,
  getPaymentLog,
} = require('../controller/paymentLog.controller');
const { isVerify } = require('../middleware/auth');

const router = require('express').Router();

router.post('/addPayment', isVerify, addPayment);

router.post('/getPayments', isVerify, getPaymentLog);

module.exports = router;
