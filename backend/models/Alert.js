const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    asteroidId: {
      type: String,
      required: true,
    },
    asteroidName: {
      type: String,
      required: true,
    },
    missDistanceKm: Number,

    triggerAt: {
      type: Date,
      required: true,
    },

    severity: {
      type: String,
      enum: ["early", "monitor", "critical"],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    isSent: {
      type: Boolean,
      default: false,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);
