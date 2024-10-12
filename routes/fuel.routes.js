const { createFuel, getAllFuel } = require('../controller/fule.controller');
const { isVerify } = require('../middleware/auth');

const router = require('express').Router();

router.post('/addFuel', isVerify, createFuel);

router.post('/getFuels', isVerify, getAllFuel);

module.exports = router;
