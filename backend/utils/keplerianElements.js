/**
 * Keplerian Orbital Elements Utilities
 * 
 * Mathematical utilities for computing asteroid positions from orbital elements.
 * Uses Keplerian mechanics with numerical integration for accurate ephemeris.
 */

// Astronomical constants
const AU_TO_KM = 149597870.7; // 1 AU in kilometers
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const GRAVITATIONAL_PARAMETER = 1.32712440018e20; // GM of Sun in m³/s²
const SECONDS_PER_DAY = 86400;

/**
 * Solve Kepler's equation using Newton-Raphson iteration
 * E - e*sin(E) = M
 * 
 * @param {number} M - Mean anomaly (radians)
 * @param {number} e - Eccentricity
 * @param {number} tolerance - Convergence tolerance (default 1e-10)
 * @param {number} maxIterations - Maximum iterations (default 50)
 * @returns {number} Eccentric anomaly E (radians)
 */
function solveKeplerEquation(M, e, tolerance = 1e-10, maxIterations = 50) {
  // Initial guess: E = M for low eccentricity, E = π for high eccentricity
  let E = e < 0.8 ? M : Math.PI;
  
  for (let i = 0; i < maxIterations; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    
    if (Math.abs(dE) < tolerance) {
      return E;
    }
  }
  
  // Return best estimate if didn't converge
  console.warn(`Kepler equation didn't converge after ${maxIterations} iterations`);
  return E;
}

/**
 * Calculate true anomaly from eccentric anomaly
 * 
 * @param {number} E - Eccentric anomaly (radians)
 * @param {number} e - Eccentricity
 * @returns {number} True anomaly (radians)
 */
function eccentricToTrueAnomaly(E, e) {
  const beta = e / (1 + Math.sqrt(1 - e * e));
  return E + 2 * Math.atan2(beta * Math.sin(E), 1 - beta * Math.cos(E));
}

/**
 * Calculate orbital radius from true anomaly
 * 
 * @param {number} a - Semi-major axis (AU)
 * @param {number} e - Eccentricity
 * @param {number} nu - True anomaly (radians)
 * @returns {number} Radius (AU)
 */
function orbitalRadius(a, e, nu) {
  return (a * (1 - e * e)) / (1 + e * Math.cos(nu));
}

/**
 * Calculate mean motion (radians per day)
 * 
 * @param {number} a - Semi-major axis (AU)
 * @returns {number} Mean motion (radians/day)
 */
function meanMotion(a) {
  // n = sqrt(GM/a³) converted to AU and days
  const aMeters = a * AU_TO_KM * 1000;
  const nRadPerSec = Math.sqrt(GRAVITATIONAL_PARAMETER / (aMeters * aMeters * aMeters));
  return nRadPerSec * SECONDS_PER_DAY;
}

/**
 * Propagate mean anomaly to a new epoch
 * 
 * @param {number} M0 - Mean anomaly at epoch (degrees)
 * @param {number} n - Mean motion (radians/day)
 * @param {number} dt - Time difference from epoch (days)
 * @returns {number} New mean anomaly (radians), normalized to [0, 2π]
 */
function propagateMeanAnomaly(M0, n, dt) {
  let M = (M0 * DEG_TO_RAD + n * dt) % (2 * Math.PI);
  if (M < 0) M += 2 * Math.PI;
  return M;
}

/**
 * Convert Keplerian orbital elements to Cartesian coordinates (heliocentric ecliptic)
 * 
 * @param {Object} elements - Orbital elements
 * @param {number} elements.semiMajorAxis - Semi-major axis a (AU)
 * @param {number} elements.eccentricity - Eccentricity e
 * @param {number} elements.inclination - Inclination i (degrees)
 * @param {number} elements.longitudeAscNode - Longitude of ascending node Ω (degrees)
 * @param {number} elements.argPerihelion - Argument of perihelion ω (degrees)
 * @param {number} elements.meanAnomaly - Mean anomaly M (degrees)
 * @param {number} elements.epoch - Epoch as Julian Date
 * @param {number} targetJD - Target Julian Date for position calculation
 * @returns {Object} Cartesian position {x, y, z} in AU (heliocentric ecliptic)
 */
function keplerToCartesian(elements, targetJD) {
  const { semiMajorAxis: a, eccentricity: e, inclination, 
          longitudeAscNode, argPerihelion, meanAnomaly: M0, epoch } = elements;
  
  // Convert angles to radians
  const i = inclination * DEG_TO_RAD;
  const omega = longitudeAscNode * DEG_TO_RAD;  // Ω - longitude of ascending node
  const w = argPerihelion * DEG_TO_RAD;          // ω - argument of perihelion
  
  // Calculate mean motion and propagate mean anomaly
  const n = meanMotion(a);
  const dt = targetJD - epoch;
  const M = propagateMeanAnomaly(M0, n, dt);
  
  // Solve Kepler's equation for eccentric anomaly
  const E = solveKeplerEquation(M, e);
  
  // Calculate true anomaly
  const nu = eccentricToTrueAnomaly(E, e);
  
  // Calculate radius
  const r = orbitalRadius(a, e, nu);
  
  // Position in orbital plane
  const xOrbital = r * Math.cos(nu);
  const yOrbital = r * Math.sin(nu);
  
  // Rotation matrices to transform from orbital plane to ecliptic coordinates
  // First rotate by ω (argument of perihelion)
  // Then rotate by i (inclination)
  // Finally rotate by Ω (longitude of ascending node)
  
  const cosOmega = Math.cos(omega);
  const sinOmega = Math.sin(omega);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);
  const cosW = Math.cos(w);
  const sinW = Math.sin(w);
  
  // Combined rotation matrix elements
  const Px = cosOmega * cosW - sinOmega * sinW * cosI;
  const Py = sinOmega * cosW + cosOmega * sinW * cosI;
  const Pz = sinW * sinI;
  
  const Qx = -cosOmega * sinW - sinOmega * cosW * cosI;
  const Qy = -sinOmega * sinW + cosOmega * cosW * cosI;
  const Qz = cosW * sinI;
  
  // Heliocentric ecliptic coordinates
  const x = xOrbital * Px + yOrbital * Qx;
  const y = xOrbital * Py + yOrbital * Qy;
  const z = xOrbital * Pz + yOrbital * Qz;
  
  return { x, y, z };
}

/**
 * Calculate orbital velocity vector at a given position
 * 
 * @param {Object} elements - Orbital elements
 * @param {number} targetJD - Target Julian Date
 * @returns {Object} Velocity vector {vx, vy, vz} in AU/day
 */
function calculateVelocity(elements, targetJD) {
  const { semiMajorAxis: a, eccentricity: e, inclination,
          longitudeAscNode, argPerihelion, meanAnomaly: M0, epoch } = elements;
  
  // Convert angles to radians
  const i = inclination * DEG_TO_RAD;
  const omega = longitudeAscNode * DEG_TO_RAD;
  const w = argPerihelion * DEG_TO_RAD;
  
  // Calculate mean motion and propagate
  const n = meanMotion(a);
  const dt = targetJD - epoch;
  const M = propagateMeanAnomaly(M0, n, dt);
  const E = solveKeplerEquation(M, e);
  const nu = eccentricToTrueAnomaly(E, e);
  
  // Semi-latus rectum
  const p = a * (1 - e * e);
  
  // Velocity magnitude components in orbital plane
  const h = Math.sqrt(GRAVITATIONAL_PARAMETER * p) / (AU_TO_KM * 1000) * SECONDS_PER_DAY; // AU/day
  const vxOrbital = -h / p * Math.sin(nu);
  const vyOrbital = h / p * (e + Math.cos(nu));
  
  // Rotation matrices
  const cosOmega = Math.cos(omega);
  const sinOmega = Math.sin(omega);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);
  const cosW = Math.cos(w);
  const sinW = Math.sin(w);
  
  const Px = cosOmega * cosW - sinOmega * sinW * cosI;
  const Py = sinOmega * cosW + cosOmega * sinW * cosI;
  const Pz = sinW * sinI;
  
  const Qx = -cosOmega * sinW - sinOmega * cosW * cosI;
  const Qy = -sinOmega * sinW + cosOmega * cosW * cosI;
  const Qz = cosW * sinI;
  
  const vx = vxOrbital * Px + vyOrbital * Qx;
  const vy = vxOrbital * Py + vyOrbital * Qy;
  const vz = vxOrbital * Pz + vyOrbital * Qz;
  
  return { vx, vy, vz };
}

/**
 * Convert a JavaScript Date to Julian Date
 * 
 * @param {Date} date - JavaScript Date object
 * @returns {number} Julian Date
 */
function dateToJulianDate(date) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const h = date.getUTCHours();
  const min = date.getUTCMinutes();
  const s = date.getUTCSeconds();
  
  const dayFraction = (h + min / 60 + s / 3600) / 24;
  
  // Algorithm from Astronomical Algorithms by Jean Meeus
  let year = y;
  let month = m;
  if (m <= 2) {
    year -= 1;
    month += 12;
  }
  
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  
  const JD = Math.floor(365.25 * (year + 4716)) + 
             Math.floor(30.6001 * (month + 1)) + 
             d + dayFraction + B - 1524.5;
  
  return JD;
}

/**
 * Convert Julian Date to JavaScript Date
 * 
 * @param {number} jd - Julian Date
 * @returns {Date} JavaScript Date object
 */
function julianDateToDate(jd) {
  const Z = Math.floor(jd + 0.5);
  const F = jd + 0.5 - Z;
  
  let A;
  if (Z < 2299161) {
    A = Z;
  } else {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }
  
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  
  const day = B - D - Math.floor(30.6001 * E) + F;
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  
  const dayInt = Math.floor(day);
  const dayFrac = day - dayInt;
  const hours = Math.floor(dayFrac * 24);
  const minutes = Math.floor((dayFrac * 24 - hours) * 60);
  const seconds = Math.floor(((dayFrac * 24 - hours) * 60 - minutes) * 60);
  
  return new Date(Date.UTC(year, month - 1, dayInt, hours, minutes, seconds));
}

/**
 * Get Earth's orbital elements (simplified, for approximate Earth position)
 * 
 * @returns {Object} Earth's orbital elements
 */
function getEarthElements() {
  return {
    semiMajorAxis: 1.00000261,      // AU
    eccentricity: 0.01671123,
    inclination: 0.00005,            // degrees (relative to ecliptic)
    longitudeAscNode: -11.26064,     // degrees
    argPerihelion: 102.93768,        // degrees
    meanAnomaly: 100.46457,          // degrees at J2000
    epoch: 2451545.0                 // J2000.0
  };
}

/**
 * Get Moon's position relative to Earth (simplified model)
 * 
 * @param {number} jd - Julian Date
 * @returns {Object} Moon position {x, y, z} in AU relative to Earth
 */
function getMoonPosition(jd) {
  // Simplified lunar model
  const d = jd - 2451545.0; // Days from J2000.0
  
  // Mean elements
  const L = (218.316 + 13.176396 * d) % 360 * DEG_TO_RAD;  // Mean longitude
  const M = (134.963 + 13.064993 * d) % 360 * DEG_TO_RAD;  // Mean anomaly
  const F = (93.272 + 13.229350 * d) % 360 * DEG_TO_RAD;   // Argument of latitude
  
  // Ecliptic longitude and latitude
  const lon = L + 6.289 * DEG_TO_RAD * Math.sin(M);
  const lat = 5.128 * DEG_TO_RAD * Math.sin(F);
  const dist = 385001 / AU_TO_KM; // Average distance in AU
  
  // Convert to Cartesian
  const x = dist * Math.cos(lat) * Math.cos(lon);
  const y = dist * Math.cos(lat) * Math.sin(lon);
  const z = dist * Math.sin(lat);
  
  return { x, y, z };
}

/**
 * Calculate gravitational perturbation from a massive body (simplified)
 * 
 * @param {Object} asteroidPos - Asteroid position {x, y, z} in AU
 * @param {Object} bodyPos - Perturbing body position {x, y, z} in AU
 * @param {number} bodyMass - Mass of perturbing body relative to Sun
 * @returns {Object} Acceleration perturbation {ax, ay, az} in AU/day²
 */
function calculatePerturbation(asteroidPos, bodyPos, bodyMass) {
  const dx = bodyPos.x - asteroidPos.x;
  const dy = bodyPos.y - asteroidPos.y;
  const dz = bodyPos.z - asteroidPos.z;
  
  const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const r3 = r * r * r;
  
  // GM in AU³/day² units
  const GMsun = 0.000295912208; // AU³/day²
  const GM = GMsun * bodyMass;
  
  return {
    ax: GM * dx / r3,
    ay: GM * dy / r3,
    az: GM * dz / r3
  };
}

// Jupiter's approximate position (simplified)
function getJupiterElements() {
  return {
    semiMajorAxis: 5.20288700,
    eccentricity: 0.04838624,
    inclination: 1.30439695,
    longitudeAscNode: 100.47390909,
    argPerihelion: 14.72847983,
    meanAnomaly: 34.39644051,
    epoch: 2451545.0
  };
}

// Relative masses (to Sun = 1)
const JUPITER_MASS_RATIO = 9.54791938e-4;
const EARTH_MASS_RATIO = 3.00273e-6;
const MOON_MASS_RATIO = 3.69396e-8;

module.exports = {
  // Core orbital mechanics
  solveKeplerEquation,
  eccentricToTrueAnomaly,
  orbitalRadius,
  meanMotion,
  propagateMeanAnomaly,
  keplerToCartesian,
  calculateVelocity,
  
  // Date utilities
  dateToJulianDate,
  julianDateToDate,
  
  // Celestial body helpers
  getEarthElements,
  getMoonPosition,
  getJupiterElements,
  calculatePerturbation,
  
  // Constants
  AU_TO_KM,
  DEG_TO_RAD,
  RAD_TO_DEG,
  JUPITER_MASS_RATIO,
  EARTH_MASS_RATIO,
  MOON_MASS_RATIO
};
