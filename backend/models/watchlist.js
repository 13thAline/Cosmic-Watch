const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  asteroidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Asteroid",
    required: true,
    index: true,
  },

  alertEnabled: {
    type: Boolean,
    default: true,
  },

  lastAlertSent: Date,
}, {
  timestamps: true,
});

watchlistSchema.index({ userId: 1, asteroidId: 1 }, { unique: true });

module.exports= mongoose.model("Watchlist", watchlistSchema);