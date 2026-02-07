const axios = require("axios");
const { calculateRiskScore } = require("../utils/riskEngine");

const NASA_BASE_URL = "https://api.nasa.gov/neo/rest/v1";

const getDailyAsteroids = async (date) => {
  const response = await axios.get(`${NASA_BASE_URL}/feed`, {
    params: {
      start_date: date,
      end_date: date,
      api_key: process.env.NASA_API_KEY
    }
  });

  const rawAsteroids = response.data.near_earth_objects[date];

  return rawAsteroids.map(asteroid => {
    const diameter = asteroid.estimated_diameter.meters.estimated_diameter_max;
    const distance = parseFloat(asteroid.close_approach_data[0].miss_distance.kilometers);
    
    return {
      nasaId: asteroid.id,
      name: asteroid.name,
      diameterMeters: diameter,
      missDistanceKm: distance,
      isHazardous: asteroid.is_potentially_hazardous_asteroid,
      riskScore: calculateRiskScore(asteroid.is_potentially_hazardous_asteroid, diameter, distance),
      closeApproachDate: asteroid.close_approach_data[0].close_approach_date
    };
  });
};

module.exports = { getDailyAsteroids };