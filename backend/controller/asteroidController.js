const Asteroid = require("../models/asteroid");
const nasaService = require("../services/nasa.service");

const getThreats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    let asteroids = await Asteroid.find({ closeApproachDate: today }).sort({ riskScore: -1 });

    if (asteroids.length === 0) {
      const freshData = await nasaService.getDailyAsteroids(today);
      asteroids = await Asteroid.insertMany(freshData);
    }

    res.json(asteroids);
  } catch (error) {
    res.status(500).json({ message: "Error fetching threat data", error: error.message });
  }
};

module.exports = { getThreats };