/**
 * Data Ingestion Service
 * 
 * Automated pipeline for syncing asteroid data from NASA APIs
 * into MongoDB with Redis caching layer.
 */

const axios = require('axios');
const Asteroid = require('../models/asteroid');
const redisClient = require('../utils/redisClient');
const { fetchNEOCatalog, fetchAsteroidElements } = require('./ephemeris.service');

// NASA APIs
const NASA_NEO_API = 'https://api.nasa.gov/neo/rest/v1';
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

// Ingestion configuration
const CONFIG = {
    BATCH_SIZE: 100,           // Process asteroids in batches
    MAX_RETRIES: 3,            // Max retries for failed API calls
    RETRY_DELAY: 2000,         // Delay between retries (ms)
    RATE_LIMIT_DELAY: 100,     // Delay between API calls (ms)
    FULL_SYNC_LIMIT: 10000     // Max asteroids for full sync
};

// Ingestion stats
let ingestionStats = {
    lastRun: null,
    lastFullSync: null,
    asteroidsProcessed: 0,
    errors: [],
    isRunning: false
};

/**
 * Fetch today's close approaches from NASA NeoWs
 * @returns {Array} Close approach data
 */
async function fetchCloseApproaches() {
    const today = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
        // Check cache first
        const cacheKey = `neows:feed:${today}:${endDate}`;
        const cached = await redisClient.get(cacheKey);
        if (cached) return cached;

        const response = await axios.get(`${NASA_NEO_API}/feed`, {
            params: {
                start_date: today,
                end_date: endDate,
                api_key: NASA_API_KEY
            },
            timeout: 30000
        });

        const neos = [];
        const dateObjects = response.data.near_earth_objects || {};

        for (const [date, asteroids] of Object.entries(dateObjects)) {
            for (const neo of asteroids) {
                neos.push({
                    nasaId: neo.id,
                    name: neo.name,
                    absoluteMagnitude: neo.absolute_magnitude_h,
                    diameter: neo.estimated_diameter?.kilometers?.estimated_diameter_max || null,
                    isPHA: neo.is_potentially_hazardous_asteroid,
                    closeApproachDate: date,
                    closeApproachData: neo.close_approach_data?.[0] || null
                });
            }
        }

        // Cache for 1 hour
        await redisClient.set(cacheKey, neos, redisClient.CACHE_TTL.NEO_CATALOG);

        return neos;
    } catch (error) {
        console.error('Failed to fetch close approaches:', error.message);
        throw error;
    }
}

/**
 * Sync close approach asteroids to MongoDB
 */
async function syncCloseApproaches() {
    console.log('Starting close approach sync...');

    try {
        const closeApproaches = await fetchCloseApproaches();
        let updated = 0;
        let created = 0;

        for (const neo of closeApproaches) {
            try {
                const existing = await Asteroid.findOne({ nasaId: neo.nasaId });

                if (existing) {
                    // Update existing asteroid
                    existing.isHazardous = neo.isPHA;
                    existing.absoluteMagnitude = neo.absoluteMagnitude;
                    if (neo.diameter) existing.diameter = neo.diameter;
                    if (neo.closeApproachData) {
                        existing.missDistanceKm = parseFloat(neo.closeApproachData.miss_distance?.kilometers) || null;
                        existing.relativeVelocity = parseFloat(neo.closeApproachData.relative_velocity?.kilometers_per_second) || null;
                    }
                    await existing.save();
                    updated++;
                } else {
                    // Create new asteroid
                    await Asteroid.create({
                        nasaId: neo.nasaId,
                        name: neo.name.replace(/[()]/g, '').trim(),
                        diameter: neo.diameter,
                        isHazardous: neo.isPHA,
                        absoluteMagnitude: neo.absoluteMagnitude,
                        missDistanceKm: neo.closeApproachData ? parseFloat(neo.closeApproachData.miss_distance?.kilometers) : null
                    });
                    created++;
                }
            } catch (err) {
                console.error(`Error syncing ${neo.name}:`, err.message);
            }
        }

        console.log(`Close approach sync complete: ${created} created, ${updated} updated`);
        return { created, updated, total: closeApproaches.length };
    } catch (error) {
        console.error('Close approach sync failed:', error.message);
        throw error;
    }
}

/**
 * Full sync of NEO catalog with orbital elements
 * @param {Object} options - Sync options
 */
async function fullNEOSync({ limit = CONFIG.FULL_SYNC_LIMIT, phaOnly = false } = {}) {
    if (ingestionStats.isRunning) {
        console.log('Sync already in progress, skipping...');
        return { status: 'skipped', reason: 'already_running' };
    }

    ingestionStats.isRunning = true;
    ingestionStats.asteroidsProcessed = 0;
    ingestionStats.errors = [];

    console.log(`Starting full NEO sync (limit: ${limit}, PHA only: ${phaOnly})...`);

    try {
        // Fetch from SBDB
        const catalog = await fetchNEOCatalog({ limit, phaOnly });
        console.log(`Fetched ${catalog.length} NEOs from SBDB`);

        let created = 0;
        let updated = 0;

        // Process in batches
        for (let i = 0; i < catalog.length; i += CONFIG.BATCH_SIZE) {
            const batch = catalog.slice(i, i + CONFIG.BATCH_SIZE);

            await Promise.all(batch.map(async (neo) => {
                try {
                    const existing = await Asteroid.findOne({ spkId: neo.spkId });

                    if (existing) {
                        // Update orbital elements
                        existing.orbitalElements = neo.orbitalElements;
                        existing.isPHA = neo.isPHA;
                        existing.absoluteMagnitude = neo.absoluteMagnitude;
                        if (neo.diameter) existing.diameter = neo.diameter;
                        await existing.save();
                        updated++;
                    } else {
                        // Create new
                        await Asteroid.create({
                            name: neo.name,
                            spkId: neo.spkId,
                            isHazardous: neo.isPHA,
                            isPHA: neo.isPHA,
                            absoluteMagnitude: neo.absoluteMagnitude,
                            diameter: neo.diameter,
                            orbitalElements: neo.orbitalElements,
                            orbitClass: 'NEO'
                        });
                        created++;
                    }

                    ingestionStats.asteroidsProcessed++;
                } catch (err) {
                    ingestionStats.errors.push({ spkId: neo.spkId, error: err.message });
                }
            }));

            // Progress log
            console.log(`Processed ${Math.min(i + CONFIG.BATCH_SIZE, catalog.length)}/${catalog.length} asteroids`);

            // Rate limit protection
            await sleep(CONFIG.RATE_LIMIT_DELAY);
        }

        // Clear catalog cache to force refresh
        await redisClient.delPattern('neo:catalog:*');

        ingestionStats.lastFullSync = new Date();
        ingestionStats.isRunning = false;

        console.log(`Full NEO sync complete: ${created} created, ${updated} updated, ${ingestionStats.errors.length} errors`);

        return {
            status: 'complete',
            created,
            updated,
            errors: ingestionStats.errors.length,
            total: catalog.length
        };
    } catch (error) {
        ingestionStats.isRunning = false;
        console.error('Full NEO sync failed:', error.message);
        throw error;
    }
}

/**
 * Fetch detailed elements for a specific asteroid and cache
 * @param {string} designation - Asteroid designation
 */
async function fetchAndCacheAsteroid(designation) {
    const cacheKey = redisClient.keys.asteroidElements(designation);

    // Check cache
    const cached = await redisClient.get(cacheKey);
    if (cached) return cached;

    // Fetch from SBDB
    const elements = await fetchAsteroidElements(designation);

    // Cache for 24 hours
    await redisClient.set(cacheKey, elements, redisClient.CACHE_TTL.ASTEROID_ELEMENTS);

    // Also update MongoDB
    await Asteroid.findOneAndUpdate(
        { $or: [{ spkId: designation }, { nasaId: designation }, { name: new RegExp(designation, 'i') }] },
        {
            $set: {
                orbitalElements: elements.orbitalElements,
                isPHA: elements.isPHA,
                absoluteMagnitude: elements.absoluteMagnitude
            }
        },
        { upsert: false }
    );

    return elements;
}

/**
 * Get ingestion statistics
 */
function getStats() {
    return { ...ingestionStats };
}

/**
 * Clear all caches
 */
async function clearCaches() {
    await redisClient.delPattern('neo:*');
    await redisClient.delPattern('asteroid:*');
    await redisClient.delPattern('trajectory:*');
    await redisClient.delPattern('celestial:*');
    await redisClient.delPattern('neows:*');
    console.log('All caches cleared');
}

// Helper
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    fetchCloseApproaches,
    syncCloseApproaches,
    fullNEOSync,
    fetchAndCacheAsteroid,
    getStats,
    clearCaches
};
