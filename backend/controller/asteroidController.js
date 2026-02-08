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

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Asteroid name required" });
    }

    const query = name.trim();
    const ephemerisService = require('../services/ephemeris.service');

    // Use NASA SBDB API which has the complete catalog of 35,000+ NEOs
    const asteroidData = await ephemerisService.fetchAsteroidElements(query);

    if (!asteroidData) {
      return res.status(404).json({ message: "Asteroid not found" });
    }

    // Calculate close approach using orbital elements
    const now = new Date();
    const futureDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year ahead

    let closestApproach = null;
    try {
      closestApproach = ephemerisService.findClosestApproach(
        asteroidData.orbitalElements,
        now,
        futureDate
      );
    } catch (e) {
      console.log('Could not calculate close approach:', e.message);
    }

    // Estimate diameter from absolute magnitude if not directly available
    let diameterKm = asteroidData.diameter;
    if (!diameterKm && asteroidData.absoluteMagnitude) {
      // Approximation: D = 1329 * 10^(-H/5) / sqrt(albedo)
      // Assuming average albedo of 0.14 for asteroids
      const H = asteroidData.absoluteMagnitude;
      diameterKm = (1329 / Math.sqrt(0.14)) * Math.pow(10, -H / 5);
    }

    res.json({
      name: asteroidData.name,
      designation: asteroidData.designation,
      hazardous: asteroidData.isPHA || false,
      isNEO: asteroidData.isNEO || false,
      diameterKm: diameterKm ? parseFloat(diameterKm.toFixed(3)) : null,
      absoluteMagnitude: asteroidData.absoluteMagnitude,
      orbitClass: asteroidData.orbitClass || null,
      closeApproachDate: closestApproach?.date?.toISOString().split('T')[0] || null,
      distanceKm: closestApproach?.distanceKm ? Math.round(closestApproach.distanceKm) : null,
      distanceAU: closestApproach?.distanceAU ? parseFloat(closestApproach.distanceAU.toFixed(4)) : null,
      velocityKph: closestApproach?.velocity?.relative
        ? Math.round(Math.sqrt(
          closestApproach.velocity.relative.vx ** 2 +
          closestApproach.velocity.relative.vy ** 2 +
          closestApproach.velocity.relative.vz ** 2
        ) * 149597870.7 / 24) // AU/day to km/h
        : null,
      orbitalElements: asteroidData.orbitalElements
    });
  } catch (err) {
    console.error('Search error:', err.message);
    if (err.response?.status === 404 || err.message.includes('No orbital data')) {
      return res.status(404).json({ message: "Asteroid not found in NASA database" });
    }
    res.status(500).json({ message: "Error searching asteroid database" });
  }
};


module.exports = {
  getThreats,
  searchAsteroid,
};
