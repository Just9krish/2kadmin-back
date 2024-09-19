const { adminLogin } = require('../controller/admin.controller');

const router = require('express').Router();

router.post('/login', adminLogin);

module.exports = router;
