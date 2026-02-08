/**
 * Risk Engine - Advanced Impact Risk Assessment
 * 
 * Integrates Monte Carlo probability simulations, Torino Scale calculations,
 * and multi-factor risk scoring for comprehensive asteroid threat assessment.
 */

const { runSimulation, runExtendedSimulation, estimateImpactEnergy } = require('./monteCarloSimulator');
const { calculateTorinoScale, calculateFromParameters, getScaleColor } = require('./torinoScale');

// Risk score weights
const WEIGHTS = {
  PHA_STATUS: 25,         // Potentially Hazardous Asteroid designation
  PROXIMITY: 30,          // How close the approach is
  SIZE: 25,               // Asteroid size/energy
  VELOCITY: 10,           // Relative velocity
  PROBABILITY: 10         // Monte Carlo impact probability
};

// Distance thresholds in km
const DISTANCE_THRESHOLDS = {
  LUNAR: 384400,          // 1 lunar distance
  CLOSE: 1000000,         // 1 million km
  MODERATE: 5000000,      // 5 million km
  SAFE: 7500000           // 7.5 million km
};

/**
 * Calculate basic risk score (fast, for listing)
 * Maintains backward compatibility with original function signature
 * 
 * @param {boolean} isHazardous - PHA flag
 * @param {number} diameterMax - Maximum diameter in meters
 * @param {number} missDistanceKm - Miss distance in km
 * @returns {number} Risk score 0-100
 */
const calculateRiskScore = (isHazardous, diameterMax, missDistanceKm) => {
  let score = 0;

  // PHA status contribution
  if (isHazardous) score += WEIGHTS.PHA_STATUS;

  // Size contribution (capped at weight)
  const diameterKm = diameterMax / 1000;
  const sizeScore = Math.min(diameterKm * 10, WEIGHTS.SIZE);
  score += sizeScore;

  // Proximity contribution (closer = higher risk)
  const proximityScore = calculateProximityScore(missDistanceKm);
  score += proximityScore * (WEIGHTS.PROXIMITY / 100);

  return Math.round(Math.min(100, Math.max(0, score)));
};

/**
 * Calculate proximity score based on distance
 * @param {number} distanceKm - Distance in km
 * @returns {number} Score 0-100
 */
function calculateProximityScore(distanceKm) {
  if (distanceKm < DISTANCE_THRESHOLDS.LUNAR) {
    return 100; // Within lunar orbit - maximum concern
  } else if (distanceKm < DISTANCE_THRESHOLDS.CLOSE) {
    return 80 + 20 * (1 - distanceKm / DISTANCE_THRESHOLDS.LUNAR);
  } else if (distanceKm < DISTANCE_THRESHOLDS.MODERATE) {
    return 40 + 40 * (1 - distanceKm / DISTANCE_THRESHOLDS.CLOSE);
  } else if (distanceKm < DISTANCE_THRESHOLDS.SAFE) {
    return 40 * (1 - distanceKm / DISTANCE_THRESHOLDS.MODERATE);
  }
  return 0;
}

/**
 * Comprehensive risk assessment with Monte Carlo simulation
 * 
 * @param {Object} options - Assessment options
 * @param {Object} options.asteroid - Asteroid data with orbital elements
 * @param {Date} options.encounterDate - Close approach date
 * @param {number} options.numSimulations - Monte Carlo iterations (default 5000)
 * @returns {Object} Complete risk assessment
 */
async function assessRisk({ asteroid, encounterDate, numSimulations = 5000 }) {
  const startTime = Date.now();

  // Extract data
  const {
    isHazardous = false,
    isPHA = false,
    diameter,
    absoluteMagnitude,
    orbitalElements,
    missDistanceKm,
    relativeVelocity = 15 // Default relative velocity km/s
  } = asteroid;

  // Estimate diameter from absolute magnitude if not provided
  const estimatedDiameter = diameter || estimateDiameter(absoluteMagnitude);

  // Basic risk score
  const basicScore = calculateRiskScore(isHazardous || isPHA, estimatedDiameter * 1000, missDistanceKm || 1e9);

  // Monte Carlo simulation (if orbital elements available)
  let monteCarloResult = null;
  if (orbitalElements && encounterDate) {
    try {
      monteCarloResult = runSimulation({
        orbitalElements,
        encounterDate,
        numSimulations
      });
    } catch (error) {
      console.error('Monte Carlo simulation failed:', error.message);
    }
  }

  // Impact energy estimation
  const energyEstimate = estimateImpactEnergy(
    estimatedDiameter,
    relativeVelocity
  );

  // Torino Scale calculation
  const impactProbability = monteCarloResult?.impactProbability || 0;
  const torinoResult = calculateFromParameters({
    impactProbability,
    diameter: estimatedDiameter,
    velocity: relativeVelocity
  });

  // Calculate comprehensive risk score
  const comprehensiveScore = calculateComprehensiveScore({
    isPHA: isHazardous || isPHA,
    proximityScore: calculateProximityScore(missDistanceKm || 1e9),
    sizeScore: Math.min(100, estimatedDiameter * 50),
    velocityScore: Math.min(100, relativeVelocity * 3),
    probabilityScore: impactProbability * 100000 // Scale up for small probabilities
  });

  const elapsedTime = Date.now() - startTime;

  return {
    // Basic Info
    asteroidName: asteroid.name || asteroid.designation,
    assessmentDate: new Date().toISOString(),

    // Risk Scores
    basicScore,
    comprehensiveScore,

    // Torino Scale
    torinoScale: {
      level: torinoResult.level,
      color: getScaleColor(torinoResult.level),
      zone: torinoResult.zone,
      description: torinoResult.description,
      recommendation: torinoResult.recommendation
    },

    // Monte Carlo Results
    monteCarlo: monteCarloResult ? {
      impactProbability: monteCarloResult.impactProbability,
      closeApproachProbability: monteCarloResult.closeApproachProbability,
      statistics: monteCarloResult.statistics,
      simulations: numSimulations,
      simulationTime: monteCarloResult.simulationTime
    } : null,

    // Energy Estimate
    impactEnergy: {
      megatons: energyEstimate.energyMegatons,
      hiroshimaEquivalent: energyEstimate.hiroshimaEquivalent,
      description: energyEstimate.description
    },

    // Physical Properties
    estimatedDiameter,
    relativeVelocity,
    missDistanceKm,

    // Risk Classification
    classification: classifyRisk(comprehensiveScore, torinoResult.level),

    // Metadata
    analysisTime: elapsedTime
  };
}

/**
 * Calculate comprehensive weighted score
 */
function calculateComprehensiveScore({ isPHA, proximityScore, sizeScore, velocityScore, probabilityScore }) {
  let score = 0;

  if (isPHA) score += WEIGHTS.PHA_STATUS;
  score += (proximityScore / 100) * WEIGHTS.PROXIMITY;
  score += (sizeScore / 100) * WEIGHTS.SIZE;
  score += (velocityScore / 100) * WEIGHTS.VELOCITY;
  score += Math.min((probabilityScore / 100) * WEIGHTS.PROBABILITY, WEIGHTS.PROBABILITY);

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Classify risk based on score and Torino level
 */
function classifyRisk(score, torinoLevel) {
  if (torinoLevel >= 8) return 'CRITICAL';
  if (torinoLevel >= 5) return 'SEVERE';
  if (torinoLevel >= 3) return 'HIGH';
  if (score >= 70 || torinoLevel >= 2) return 'ELEVATED';
  if (score >= 40 || torinoLevel >= 1) return 'MODERATE';
  if (score >= 20) return 'LOW';
  return 'MINIMAL';
}

/**
 * Estimate diameter from absolute magnitude
 * Using formula: D = 1329 / sqrt(albedo) * 10^(-H/5)
 * Assumes albedo of 0.14 (typical for C-type asteroids)
 */
function estimateDiameter(absoluteMagnitude) {
  if (!absoluteMagnitude) return 0.1; // Default 100m
  const albedo = 0.14;
  return (1329 / Math.sqrt(albedo)) * Math.pow(10, -absoluteMagnitude / 5);
}

/**
 * Batch risk assessment for multiple asteroids
 * @param {Array} asteroids - Array of asteroid objects
 * @returns {Array} Risk assessments sorted by score
 */
async function batchAssessRisk(asteroids) {
  const assessments = await Promise.all(
    asteroids.map(async (asteroid) => {
      try {
        return await assessRisk({
          asteroid,
          encounterDate: asteroid.closeApproachDate ? new Date(asteroid.closeApproachDate) : new Date(),
          numSimulations: 1000 // Lower for batch
        });
      } catch (error) {
        return {
          asteroidName: asteroid.name,
          error: error.message,
          basicScore: calculateRiskScore(asteroid.isHazardous, asteroid.diameter * 1000, asteroid.missDistanceKm)
        };
      }
    })
  );

  // Sort by comprehensive score (highest first)
  return assessments.sort((a, b) => (b.comprehensiveScore || b.basicScore) - (a.comprehensiveScore || a.basicScore));
}

module.exports = {
  // Basic (backward compatible)
  calculateRiskScore,

  // Advanced
  assessRisk,
  batchAssessRisk,

  // Utilities
  calculateProximityScore,
  classifyRisk,
  estimateDiameter,

  // Constants
  WEIGHTS,
  DISTANCE_THRESHOLDS
};