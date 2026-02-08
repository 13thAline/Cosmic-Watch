const axios = require("axios");
const { calculateRiskScore } = require("../utils/riskEngine");
const redisClient = require("../utils/redisClient");

const NASA_BASE_URL = "https://api.nasa.gov/neo/rest/v1";

/**
 * Get daily asteroids with caching
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Array} Processed asteroid data
 */
const getDailyAsteroids = async (date) => {
  // Try cache first
  const cacheKey = `nasa:daily:${date}`;
  const cached = await redisClient.get(cacheKey);

  if (cached) {
    console.log(`Cache hit for daily asteroids: ${date}`);
    return cached;
  }

  console.log(`Cache miss for daily asteroids: ${date}, fetching from NASA...`);

  const response = await axios.get(`${NASA_BASE_URL}/feed`, {
    params: {
      start_date: date,
      end_date: date,
      api_key: process.env.NASA_API_KEY || 'DEMO_KEY'
    },
    timeout: 30000
  });

  const rawAsteroids = response.data.near_earth_objects[date] || [];

  const processed = rawAsteroids.map(asteroid => {
    const diameter = asteroid.estimated_diameter?.meters?.estimated_diameter_max || 0;
    const distance = parseFloat(asteroid.close_approach_data?.[0]?.miss_distance?.kilometers || 0);

    return {
      nasaId: asteroid.id,
      name: asteroid.name,
      diameterMeters: diameter,
      missDistanceKm: distance,
      isHazardous: asteroid.is_potentially_hazardous_asteroid,
      riskScore: calculateRiskScore(asteroid.is_potentially_hazardous_asteroid, diameter, distance),
      closeApproachDate: asteroid.close_approach_data?.[0]?.close_approach_date,
      relativeVelocity: parseFloat(asteroid.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second || 0),
      absoluteMagnitude: asteroid.absolute_magnitude_h
    };
  });

  // Cache for 1 hour
  await redisClient.set(cacheKey, processed, redisClient.CACHE_TTL.NEO_CATALOG);

  return processed;
};

/**
 * Get asteroids for a date range with caching
 * @param {string} startDate - Start date YYYY-MM-DD
 * @param {string} endDate - End date YYYY-MM-DD
 * @returns {Array} All asteroids in range
 */
const getAsteroidsInRange = async (startDate, endDate) => {
  const cacheKey = `nasa:range:${startDate}:${endDate}`;
  const cached = await redisClient.get(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await axios.get(`${NASA_BASE_URL}/feed`, {
    params: {
      start_date: startDate,
      end_date: endDate,
      api_key: process.env.NASA_API_KEY || 'DEMO_KEY'
    },
    timeout: 30000
  });

  const allAsteroids = [];
  const dateObjects = response.data.near_earth_objects || {};

  for (const [date, asteroids] of Object.entries(dateObjects)) {
    for (const asteroid of asteroids) {
      const diameter = asteroid.estimated_diameter?.meters?.estimated_diameter_max || 0;
      const distance = parseFloat(asteroid.close_approach_data?.[0]?.miss_distance?.kilometers || 0);

      allAsteroids.push({
        nasaId: asteroid.id,
        name: asteroid.name,
        diameterMeters: diameter,
        missDistanceKm: distance,
        isHazardous: asteroid.is_potentially_hazardous_asteroid,
        riskScore: calculateRiskScore(asteroid.is_potentially_hazardous_asteroid, diameter, distance),
        closeApproachDate: date,
        relativeVelocity: parseFloat(asteroid.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second || 0)
      });
    }
  }

  // Cache for 30 minutes
  await redisClient.set(cacheKey, allAsteroids, 1800);

  return allAsteroids;
};

/**
 * Lookup specific asteroid by ID
 * @param {string} asteroidId - NASA asteroid ID
 * @returns {Object} Asteroid details
 */
const lookupAsteroid = async (asteroidId) => {
  const cacheKey = `nasa:lookup:${asteroidId}`;
  const cached = await redisClient.get(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await axios.get(`${NASA_BASE_URL}/neo/${asteroidId}`, {
    params: {
      api_key: process.env.NASA_API_KEY || 'DEMO_KEY'
    },
    timeout: 15000
  });

  const asteroid = response.data;

  const result = {
    nasaId: asteroid.id,
    name: asteroid.name,
    designation: asteroid.designation,
    absoluteMagnitude: asteroid.absolute_magnitude_h,
    diameterMin: asteroid.estimated_diameter?.kilometers?.estimated_diameter_min,
    diameterMax: asteroid.estimated_diameter?.kilometers?.estimated_diameter_max,
    isHazardous: asteroid.is_potentially_hazardous_asteroid,
    isSentryObject: asteroid.is_sentry_object,
    closeApproaches: asteroid.close_approach_data?.slice(0, 10).map(ca => ({
      date: ca.close_approach_date_full,
      velocity: parseFloat(ca.relative_velocity?.kilometers_per_second),
      distance: parseFloat(ca.miss_distance?.kilometers),
      orbitingBody: ca.orbiting_body
    })),
    orbitalData: asteroid.orbital_data
  };

  // Cache for 24 hours
  await redisClient.set(cacheKey, result, redisClient.CACHE_TTL.ASTEROID_ELEMENTS);

  return result;
};

module.exports = {
  getDailyAsteroids,
  getAsteroidsInRange,
  lookupAsteroid
};