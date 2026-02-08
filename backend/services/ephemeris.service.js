/**
 * Ephemeris Service
 * 
 * High-level service for asteroid position calculations and NASA SBDB integration.
 * Provides trajectory propagation, batch position calculations, and N-body corrections.
 */

const axios = require('axios');
const {
    keplerToCartesian,
    calculateVelocity,
    dateToJulianDate,
    julianDateToDate,
    getEarthElements,
    getMoonPosition,
    getJupiterElements,
    calculatePerturbation,
    AU_TO_KM,
    JUPITER_MASS_RATIO,
    EARTH_MASS_RATIO,
    MOON_MASS_RATIO
} = require('../utils/keplerianElements');

// NASA Small-Body Database API
const SBDB_API_URL = 'https://ssd-api.jpl.nasa.gov/sbdb.api';
const SBDB_QUERY_URL = 'https://ssd-api.jpl.nasa.gov/sbdb_query.api';

/**
 * Fetch orbital elements for a specific asteroid from NASA SBDB
 * 
 * @param {string} designation - Asteroid designation (e.g., "99942" for Apophis)
 * @returns {Object} Orbital elements and metadata
 */
async function fetchAsteroidElements(designation) {
    try {
        const response = await axios.get(SBDB_API_URL, {
            params: {
                sstr: designation,
                'orbit-fmt': 'json'
            },
            timeout: 10000
        });

        const data = response.data;

        if (!data.orbit || !data.orbit.elements) {
            throw new Error(`No orbital data found for ${designation}`);
        }

        const elements = data.orbit.elements;
        const findElement = (name) => {
            const el = elements.find(e => e.name === name);
            return el ? parseFloat(el.value) : null;
        };

        return {
            designation: data.object?.des || designation,
            name: data.object?.fullname || designation,
            orbitalElements: {
                semiMajorAxis: findElement('a'),      // AU
                eccentricity: findElement('e'),
                inclination: findElement('i'),         // degrees
                longitudeAscNode: findElement('om'),   // degrees (Ω)
                argPerihelion: findElement('w'),       // degrees (ω)
                meanAnomaly: findElement('ma'),        // degrees
                epoch: parseFloat(data.orbit.epoch)    // Julian Date
            },
            orbitClass: data.object?.orbit_class?.name,
            isNEO: data.object?.neo === true,
            isPHA: data.object?.pha === true,
            absoluteMagnitude: data.object?.h ? parseFloat(data.object.h) : null,
            diameter: data.object?.diameter ? parseFloat(data.object.diameter) : null
        };
    } catch (error) {
        console.error(`Error fetching orbital elements for ${designation}:`, error.message);
        throw error;
    }
}

/**
 * Fetch all NEOs from NASA SBDB (paginated)
 * 
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum results to return
 * @param {boolean} options.phaOnly - Only potentially hazardous asteroids
 * @returns {Array} Array of asteroid objects with orbital elements
 */
async function fetchNEOCatalog({ limit = 1000, phaOnly = false } = {}) {
    try {
        // Query for NEOs with orbital elements
        // Using sb-group=neo for Near-Earth Objects or sb-group=pha for Potentially Hazardous
        const fields = 'spkid,full_name,neo,pha,H,diameter,a,e,i,om,w,ma,epoch';

        const params = {
            fields,
            'sb-kind': 'a',     // asteroids only
            'sb-group': phaOnly ? 'pha' : 'neo',  // NEOs or PHAs
            'full-prec': true,
            limit: Math.min(limit, 10000) // API limit
        };

        console.log('Fetching NEO catalog with params:', params);

        const response = await axios.get(SBDB_QUERY_URL, {
            params,
            timeout: 30000
        });

        const { fields: fieldNames, data } = response.data;

        if (!data || !Array.isArray(data)) {
            console.log('No data received from SBDB API');
            return [];
        }

        console.log(`Received ${data.length} asteroids from NASA SBDB`);

        const fieldIndex = (name) => fieldNames.indexOf(name);

        return data.map(row => {
            const getValue = (name) => {
                const idx = fieldIndex(name);
                return idx >= 0 ? row[idx] : null;
            };

            const a = parseFloat(getValue('a'));
            const e = parseFloat(getValue('e'));
            const i = parseFloat(getValue('i'));
            const om = parseFloat(getValue('om'));
            const w = parseFloat(getValue('w'));
            const ma = parseFloat(getValue('ma'));
            const epoch = parseFloat(getValue('epoch'));

            // Skip if missing critical orbital elements
            if (isNaN(a) || isNaN(e) || isNaN(epoch)) {
                return null;
            }

            return {
                spkId: getValue('spkid'),
                name: getValue('full_name')?.trim() || `SPK${getValue('spkid')}`,
                isNEO: getValue('neo') === 'Y',
                isPHA: getValue('pha') === 'Y',
                absoluteMagnitude: parseFloat(getValue('H')) || null,
                diameter: parseFloat(getValue('diameter')) || null,
                orbitalElements: {
                    semiMajorAxis: a,
                    eccentricity: e,
                    inclination: i || 0,
                    longitudeAscNode: om || 0,
                    argPerihelion: w || 0,
                    meanAnomaly: ma || 0,
                    epoch
                }
            };
        }).filter(Boolean);
    } catch (error) {
        console.error('Error fetching NEO catalog:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Calculate asteroid position at a specific date/time
 * 
 * @param {Object} orbitalElements - Keplerian orbital elements
 * @param {Date|number} targetDate - JavaScript Date or Julian Date
 * @param {boolean} includeVelocity - Whether to calculate velocity vector
 * @returns {Object} Position (and optionally velocity) in heliocentric and Earth-relative frames
 */
function calculatePosition(orbitalElements, targetDate, includeVelocity = false) {
    const jd = typeof targetDate === 'number' ? targetDate : dateToJulianDate(targetDate);

    // Heliocentric position
    const helioPos = keplerToCartesian(orbitalElements, jd);

    // Earth position for relative calculations
    const earthElements = getEarthElements();
    const earthPos = keplerToCartesian(earthElements, jd);

    // Earth-relative position
    const relativePos = {
        x: helioPos.x - earthPos.x,
        y: helioPos.y - earthPos.y,
        z: helioPos.z - earthPos.z
    };

    // Calculate distance from Earth in km
    const distanceAU = Math.sqrt(
        relativePos.x ** 2 + relativePos.y ** 2 + relativePos.z ** 2
    );
    const distanceKm = distanceAU * AU_TO_KM;

    const result = {
        julianDate: jd,
        date: julianDateToDate(jd),
        heliocentric: helioPos,
        geocentric: relativePos,
        distanceAU,
        distanceKm
    };

    if (includeVelocity) {
        const helioVel = calculateVelocity(orbitalElements, jd);
        const earthVel = calculateVelocity(earthElements, jd);

        result.velocity = {
            heliocentric: helioVel,
            relative: {
                vx: helioVel.vx - earthVel.vx,
                vy: helioVel.vy - earthVel.vy,
                vz: helioVel.vz - earthVel.vz
            }
        };

        // Relative speed in km/s
        const relVelAUDay = Math.sqrt(
            result.velocity.relative.vx ** 2 +
            result.velocity.relative.vy ** 2 +
            result.velocity.relative.vz ** 2
        );
        result.relativeSpeedKmS = relVelAUDay * AU_TO_KM / 86400;
    }

    return result;
}

/**
 * Calculate positions for a batch of asteroids at a specific time
 * Optimized for rendering 30,000+ asteroids
 * 
 * @param {Array} asteroids - Array of asteroid objects with orbital elements
 * @param {Date|number} targetDate - JavaScript Date or Julian Date
 * @returns {Float32Array} Packed position data [x1,y1,z1, x2,y2,z2, ...]
 */
function calculateBatchPositions(asteroids, targetDate) {
    const jd = typeof targetDate === 'number' ? targetDate : dateToJulianDate(targetDate);

    // Pre-calculate Earth position
    const earthElements = getEarthElements();
    const earthPos = keplerToCartesian(earthElements, jd);

    // Packed array for GPU upload optimization
    const positions = new Float32Array(asteroids.length * 3);

    for (let i = 0; i < asteroids.length; i++) {
        const asteroid = asteroids[i];
        if (!asteroid.orbitalElements) continue;

        try {
            const pos = keplerToCartesian(asteroid.orbitalElements, jd);

            // Store Earth-relative positions (better for visualization scale)
            positions[i * 3] = pos.x - earthPos.x;
            positions[i * 3 + 1] = pos.y - earthPos.y;
            positions[i * 3 + 2] = pos.z - earthPos.z;
        } catch (error) {
            // Default to origin if calculation fails
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;
        }
    }

    return positions;
}

/**
 * Propagate asteroid trajectory over a time range
 * 
 * @param {Object} orbitalElements - Orbital elements
 * @param {Date} startDate - Start of trajectory
 * @param {Date} endDate - End of trajectory
 * @param {number} steps - Number of points in trajectory
 * @param {boolean} applyPerturbations - Apply N-body corrections
 * @returns {Array} Array of position objects along trajectory
 */
function propagateTrajectory(orbitalElements, startDate, endDate, steps = 100, applyPerturbations = false) {
    const startJD = dateToJulianDate(startDate);
    const endJD = dateToJulianDate(endDate);
    const dt = (endJD - startJD) / (steps - 1);

    const trajectory = [];

    for (let i = 0; i < steps; i++) {
        const jd = startJD + i * dt;
        const position = calculatePosition(orbitalElements, jd, true);

        if (applyPerturbations) {
            // Apply N-body perturbations from Jupiter and Moon
            const jupiterElements = getJupiterElements();
            const jupiterPos = keplerToCartesian(jupiterElements, jd);
            const moonOffset = getMoonPosition(jd);
            const earthPos = keplerToCartesian(getEarthElements(), jd);

            const moonPos = {
                x: earthPos.x + moonOffset.x,
                y: earthPos.y + moonOffset.y,
                z: earthPos.z + moonOffset.z
            };

            // Calculate perturbations (simplified - actual integration would be more complex)
            const jupiterPert = calculatePerturbation(position.heliocentric, jupiterPos, JUPITER_MASS_RATIO);
            const moonPert = calculatePerturbation(position.heliocentric, moonPos, MOON_MASS_RATIO);

            position.perturbations = {
                jupiter: jupiterPert,
                moon: moonPert,
                total: {
                    ax: jupiterPert.ax + moonPert.ax,
                    ay: jupiterPert.ay + moonPert.ay,
                    az: jupiterPert.az + moonPert.az
                }
            };
        }

        trajectory.push(position);
    }

    return trajectory;
}

/**
 * Find closest approach between an asteroid and Earth within a date range
 * 
 * @param {Object} orbitalElements - Orbital elements
 * @param {Date} startDate - Start of search range
 * @param {Date} endDate - End of search range
 * @returns {Object} Closest approach data
 */
function findClosestApproach(orbitalElements, startDate, endDate) {
    const trajectory = propagateTrajectory(orbitalElements, startDate, endDate, 365);

    let minDistance = Infinity;
    let closestApproach = null;

    for (const point of trajectory) {
        if (point.distanceKm < minDistance) {
            minDistance = point.distanceKm;
            closestApproach = point;
        }
    }

    // Refine with higher resolution around the minimum
    if (closestApproach) {
        const refinedStart = new Date(closestApproach.date.getTime() - 7 * 24 * 60 * 60 * 1000);
        const refinedEnd = new Date(closestApproach.date.getTime() + 7 * 24 * 60 * 60 * 1000);

        const refined = propagateTrajectory(orbitalElements, refinedStart, refinedEnd, 200);

        for (const point of refined) {
            if (point.distanceKm < minDistance) {
                minDistance = point.distanceKm;
                closestApproach = point;
            }
        }
    }

    return {
        date: closestApproach?.date,
        julianDate: closestApproach?.julianDate,
        distanceKm: minDistance,
        distanceAU: minDistance / AU_TO_KM,
        position: closestApproach?.geocentric,
        velocity: closestApproach?.velocity
    };
}

/**
 * Get current positions of all major celestial bodies
 * 
 * @param {Date|number} targetDate - Target date
 * @returns {Object} Positions of Earth, Moon, and scaling info
 */
function getCelestialBodies(targetDate) {
    const jd = typeof targetDate === 'number' ? targetDate : dateToJulianDate(targetDate);

    const earthPos = keplerToCartesian(getEarthElements(), jd);
    const moonOffset = getMoonPosition(jd);
    const sunPos = { x: 0, y: 0, z: 0 }; // Sun at origin in heliocentric coords

    return {
        julianDate: jd,
        date: julianDateToDate(jd),
        sun: sunPos,
        earth: earthPos,
        moon: {
            heliocentric: {
                x: earthPos.x + moonOffset.x,
                y: earthPos.y + moonOffset.y,
                z: earthPos.z + moonOffset.z
            },
            geocentric: moonOffset
        }
    };
}

module.exports = {
    // NASA API functions
    fetchAsteroidElements,
    fetchNEOCatalog,

    // Position calculations
    calculatePosition,
    calculateBatchPositions,
    propagateTrajectory,
    findClosestApproach,
    getCelestialBodies,

    // Utilities (re-exported)
    dateToJulianDate,
    julianDateToDate,
    AU_TO_KM
};
