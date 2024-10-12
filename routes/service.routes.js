const {
  addService,
  getAllServices,
} = require('../controller/service.controller');
const { isVerify } = require('../middleware/auth');

const router = require('express').Router();

router.post('/addService', isVerify, addService);

router.post('/getServices', isVerify, getAllServices);

module.exports = router;
