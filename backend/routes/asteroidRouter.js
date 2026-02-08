const express = require('express');
const { getThreats, searchAsteroid } = require('../controller/asteroidController');
const router = express.Router();



router.get('/threats', getThreats);
router.get("/search", searchAsteroid);


module.exports = router;