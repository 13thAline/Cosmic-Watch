/**
 * Monte Carlo Simulator - Impact Probability Calculator
 * 
 * Performs Monte Carlo simulations to estimate impact probability
 * by sampling from orbital element uncertainty distributions.
 */

const { keplerToCartesian, dateToJulianDate, AU_TO_KM } = require('./keplerianElements');

// Physical constants
const EARTH_RADIUS_KM = 6371;
const EARTH_CAPTURE_RADIUS_KM = 6500; // Slightly larger for atmospheric entry
const MOON_DISTANCE_KM = 384400;

// Simulation defaults
const DEFAULT_SIMULATIONS = 10000;
const DEFAULT_UNCERTAINTY = {
    semiMajorAxis: 0.0001,      // AU - typical uncertainty
    eccentricity: 0.00001,
    inclination: 0.01,          // degrees
    longitudeAscNode: 0.01,     // degrees
    argPerihelion: 0.01,        // degrees
    meanAnomaly: 0.1            // degrees
};

/**
 * Generate random number from normal distribution (Box-Muller transform)
 */
function randomNormal(mean = 0, stdDev = 1) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * stdDev;
}

/**
 * Sample orbital elements with uncertainties
 * @param {Object} elements - Nominal orbital elements
 * @param {Object} uncertainties - Standard deviations for each element
 * @returns {Object} Sampled orbital elements
 */
function sampleOrbitalElements(elements, uncertainties = DEFAULT_UNCERTAINTY) {
    return {
        semiMajorAxis: elements.semiMajorAxis + randomNormal(0, uncertainties.semiMajorAxis),
        eccentricity: Math.max(0, Math.min(0.999,
            elements.eccentricity + randomNormal(0, uncertainties.eccentricity))),
        inclination: elements.inclination + randomNormal(0, uncertainties.inclination),
        longitudeAscNode: elements.longitudeAscNode + randomNormal(0, uncertainties.longitudeAscNode),
        argPerihelion: elements.argPerihelion + randomNormal(0, uncertainties.argPerihelion),
        meanAnomaly: elements.meanAnomaly + randomNormal(0, uncertainties.meanAnomaly),
        epoch: elements.epoch
    };
}

/**
 * Calculate minimum distance to Earth at a specific date
 * @param {Object} asteroidElements - Asteroid orbital elements
 * @param {Date} targetDate - Target date
 * @returns {number} Distance in km
 */
function calculateMinDistance(asteroidElements, targetDate) {
    const jd = dateToJulianDate(targetDate);

    // Asteroid position
    const asteroidPos = keplerToCartesian(asteroidElements, jd);

    // Earth position (simplified - assumes circular orbit at 1 AU)
    const earthAngle = (jd - 2451545.0) * 0.01720279; // Mean motion of Earth
    const earthPos = {
        x: Math.cos(earthAngle),
        y: Math.sin(earthAngle),
        z: 0
    };

    // Distance in AU, convert to km
    const dx = asteroidPos.x - earthPos.x;
    const dy = asteroidPos.y - earthPos.y;
    const dz = asteroidPos.z - earthPos.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz) * AU_TO_KM;
}

/**
 * Run Monte Carlo simulation for impact probability
 * 
 * @param {Object} options - Simulation options
 * @param {Object} options.orbitalElements - Nominal orbital elements
 * @param {Date} options.encounterDate - Close approach date
 * @param {number} options.numSimulations - Number of simulations (default 10000)
 * @param {Object} options.uncertainties - Element uncertainties (optional)
 * @returns {Object} Simulation results
 */
function runSimulation({
    orbitalElements,
    encounterDate,
    numSimulations = DEFAULT_SIMULATIONS,
    uncertainties = DEFAULT_UNCERTAINTY
}) {
    console.log(`Running Monte Carlo simulation with ${numSimulations} samples...`);

    const startTime = Date.now();

    // Track results
    let impacts = 0;
    let closeApproaches = 0; // Within lunar distance
    let veryClose = 0;       // Within 50,000 km
    const distances = [];
    let minDistance = Infinity;
    let maxDistance = 0;

    // Run simulations
    for (let i = 0; i < numSimulations; i++) {
        // Sample elements with uncertainty
        const sampledElements = sampleOrbitalElements(orbitalElements, uncertainties);

        // Calculate distance at encounter
        const distance = calculateMinDistance(sampledElements, encounterDate);
        distances.push(distance);

        // Track statistics
        if (distance < minDistance) minDistance = distance;
        if (distance > maxDistance) maxDistance = distance;

        if (distance < EARTH_CAPTURE_RADIUS_KM) {
            impacts++;
        }
        if (distance < MOON_DISTANCE_KM) {
            closeApproaches++;
        }
        if (distance < 50000) {
            veryClose++;
        }
    }

    // Calculate statistics
    distances.sort((a, b) => a - b);
    const meanDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    const medianDistance = distances[Math.floor(distances.length / 2)];
    const stdDevDistance = Math.sqrt(
        distances.reduce((acc, d) => acc + Math.pow(d - meanDistance, 2), 0) / distances.length
    );

    // Percentiles
    const p5 = distances[Math.floor(distances.length * 0.05)];
    const p95 = distances[Math.floor(distances.length * 0.95)];

    const elapsedMs = Date.now() - startTime;

    return {
        // Probabilities
        impactProbability: impacts / numSimulations,
        closeApproachProbability: closeApproaches / numSimulations,
        veryCloseProbability: veryClose / numSimulations,

        // Statistics
        statistics: {
            minDistance,
            maxDistance,
            meanDistance,
            medianDistance,
            stdDevDistance,
            percentile5: p5,
            percentile95: p95
        },

        // Counts
        counts: {
            impacts,
            closeApproaches,
            veryClose,
            total: numSimulations
        },

        // Metadata
        simulationTime: elapsedMs,
        encounterDate: encounterDate.toISOString()
    };
}

/**
 * Calculate impact probability with extended encounter window
 * Searches around encounter date for minimum distance
 * 
 * @param {Object} orbitalElements - Orbital elements
 * @param {Date} centerDate - Center of encounter window
 * @param {number} windowDays - Days before/after to search
 * @param {number} numSimulations - Simulations per date
 * @returns {Object} Best (highest probability) result
 */
function runExtendedSimulation({
    orbitalElements,
    centerDate,
    windowDays = 7,
    numSimulations = 1000
}) {
    let bestResult = null;
    let highestProbability = 0;

    // Search window for closest approach
    for (let offset = -windowDays; offset <= windowDays; offset++) {
        const testDate = new Date(centerDate.getTime() + offset * 24 * 60 * 60 * 1000);

        const result = runSimulation({
            orbitalElements,
            encounterDate: testDate,
            numSimulations,
            uncertainties: DEFAULT_UNCERTAINTY
        });

        if (result.impactProbability > highestProbability ||
            (result.impactProbability === highestProbability &&
                result.statistics.minDistance < (bestResult?.statistics?.minDistance || Infinity))) {
            highestProbability = result.impactProbability;
            bestResult = result;
        }
    }

    return bestResult;
}

/**
 * Estimate kinetic energy of impact
 * @param {number} diameter - Asteroid diameter in km
 * @param {number} velocity - Impact velocity in km/s
 * @param {number} density - Asteroid density in kg/m³ (default 2500)
 * @returns {Object} Energy in various units
 */
function estimateImpactEnergy(diameter, velocity, density = 2500) {
    // Volume in m³
    const radiusM = (diameter * 1000) / 2;
    const volume = (4 / 3) * Math.PI * Math.pow(radiusM, 3);

    // Mass in kg
    const mass = volume * density;

    // Kinetic energy in Joules (0.5 * m * v²)
    const velocityMs = velocity * 1000;
    const energyJoules = 0.5 * mass * Math.pow(velocityMs, 2);

    // Convert to megatons TNT (1 MT = 4.184e15 J)
    const energyMT = energyJoules / 4.184e15;

    // Hiroshima bomb equivalent (~15 kilotons)
    const hiroshimaEquivalent = energyMT * 1000 / 15;

    return {
        energyJoules,
        energyMegatons: energyMT,
        hiroshimaEquivalent: Math.round(hiroshimaEquivalent),
        mass,
        description: getEnergyDescription(energyMT)
    };
}

/**
 * Get human-readable description of impact energy
 */
function getEnergyDescription(energyMT) {
    if (energyMT < 0.001) return 'Local damage (meteor-class)';
    if (energyMT < 0.1) return 'City destroyer (Tunguska-class)';
    if (energyMT < 10) return 'Regional devastation';
    if (energyMT < 1000) return 'Continental-scale damage';
    if (energyMT < 100000) return 'Mass extinction event';
    return 'Planet-sterilizing impact';
}

module.exports = {
    runSimulation,
    runExtendedSimulation,
    estimateImpactEnergy,
    sampleOrbitalElements,
    calculateMinDistance,
    DEFAULT_UNCERTAINTY
};
