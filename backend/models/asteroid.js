const mongoose = require('mongoose');

const asteroidSchema = new mongoose.Schema({
  nasaId: { type: String, required: true, unique: true, index: true },
  spkId: { type: String, index: true },  // SPK-ID for SBDB lookups
  name: String,

  diameterMetersMax: Number,
  velocityKph: Number,
  missDistanceKm: Number,

  closeApproachDate: Date,
  isHazardous: { type: Boolean, default: false },

  riskScore: { type: Number, index: true, default: 0 },

  // Keplerian Orbital Elements for ephemeris calculations
  orbitalElements: {
    semiMajorAxis: Number,      // a - Semi-major axis (AU)
    eccentricity: Number,       // e - Eccentricity
    inclination: Number,        // i - Inclination (degrees)
    longitudeAscNode: Number,   // Ω - Longitude of ascending node (degrees)
    argPerihelion: Number,      // ω - Argument of perihelion (degrees)
    meanAnomaly: Number,        // M - Mean anomaly at epoch (degrees)
    epoch: Number               // Epoch as Julian Date
  },

  // Additional orbital parameters
  orbitClass: String,           // Orbit classification (Apollo, Aten, Amor, etc.)
  absoluteMagnitude: Number,    // H - Absolute magnitude
  isPHA: { type: Boolean, default: false }, // Potentially Hazardous Asteroid

  sourceTimestamp: Number,
  cachedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Asteroid", asteroidSchema);