const mongoose = require('mongoose');

const asteroidSchema = new mongoose.Schema({
  nasaId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  name: String,

  diameterMeters: Number,
  velocityKph: Number,
  missDistanceKm: Number,

  closeApproachDate: Date,

  isHazardous: Boolean,

  riskScore: {
    type: Number,
    index: true,
  },

  sourceTimestamp: Date, // NASA timestamp
  cachedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

module.exports= mongoose.model("Asteroid", asteroidSchema);