const mongoose = require('mongoose');

const asteroidSchema = new mongoose.Schema({
  nasaId: { type: String, required: true, unique: true, index: true },
  name: String,

  diameterMetersMax: Number, 
  velocityKph: Number,
  missDistanceKm: Number,

  closeApproachDate: Date,
  isHazardous: { type: Boolean, default: false },

  riskScore: { type: Number, index: true, default: 0 },

  sourceTimestamp: Number, 
  cachedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Asteroid", asteroidSchema);