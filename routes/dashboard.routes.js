const { dashboardStats } = require('../controller/dashboard.controller');
const { isVerify } = require('../middleware/auth');

const router = require('express').Router();

router.post('/getMonthStats', isVerify, dashboardStats);

module.exports = router;
