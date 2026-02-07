const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  watchedAsteroids: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Watchlist",
    },
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model("User", userSchema);