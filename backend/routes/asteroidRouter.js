const express = require('express');
const { getThreats } = require('../controller/asteroidController');
const router = express.Router();

router.get('/threats', getThreats);

module.exports = router;