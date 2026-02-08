const Asteroid = require("../models/asteroid");
const nasaService = require("../services/nasa.service");
const axios = require("axios");

const getThreats = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    let asteroids = await Asteroid
      .find({ closeApproachDate: today })
      .sort({ riskScore: -1 });

    if (asteroids.length === 0) {
      const freshData = await nasaService.getDailyAsteroids(today);
      asteroids = await Asteroid.insertMany(freshData);
    }

    res.json(asteroids);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching threat data",
      error: error.message,
    });
  }
};


const searchAsteroid = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ message: "Asteroid name required" });
    }

    const response = await axios.get(
      `https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=${process.env.NASA_API_KEY}`
    );

    const asteroid = response.data.near_earth_objects.find(a =>
      a.name.toLowerCase().includes(name.toLowerCase())
    );

    if (!asteroid) {
      return res.status(404).json({ message: "Asteroid not found" });
    }

    const approach = asteroid.close_approach_data[0];

    res.json({
      name: asteroid.name,
      hazardous: asteroid.is_potentially_hazardous_asteroid,
      diameterKm:
        asteroid.estimated_diameter.kilometers.estimated_diameter_max,
      closeApproachDate: approach.close_approach_date,
      distanceKm: approach.miss_distance.kilometers,
      velocityKph: approach.relative_velocity.kilometers_per_hour,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "NASA API error" });
  }
};


module.exports = {
  getThreats,
  searchAsteroid,
};
