const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  asteroidId: String,
  asteroidName: String,
  severity: {
    type: String,
    enum: ["info", "warning", "critical"],
  },
  message: String,
  missDistanceKm: Number,
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Alert", alertSchema);
