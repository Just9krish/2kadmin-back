const {
  adminLogin,
  forgotPassword,
  verifyOtp,
} = require('../controller/admin.controller');

const router = require('express').Router();

router.post('/login', adminLogin);

router.post('/forgotPassword', forgotPassword);

router.post('/verifyOtp', verifyOtp);

module.exports = router;
