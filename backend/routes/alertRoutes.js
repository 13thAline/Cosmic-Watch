const express = require("express");
const path = require("path");
const router = express.Router();

const {
  trackAsteroid,
  getAlerts,
  markAsRead,
} = require(path.join(__dirname, "../controller/alertController"));

router.post("/track", trackAsteroid);
router.get("/", getAlerts);
router.patch("/:id/read", markAsRead);

module.exports = router;
