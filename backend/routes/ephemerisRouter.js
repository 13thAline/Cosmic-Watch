/**
 * Ephemeris Routes
 * 
 * API endpoints for asteroid position calculations and ephemeris data.
 */

const express = require('express');
const router = express.Router();
const ephemerisService = require('../services/ephemeris.service');

/**
 * GET /api/ephemeris/position/:designation
 * Calculate current position of a specific asteroid
 */
router.get('/position/:designation', async (req, res) => {
    try {
        const { designation } = req.params;
        const { date, includeVelocity } = req.query;

        // Fetch orbital elements from NASA SBDB
        const asteroidData = await ephemerisService.fetchAsteroidElements(designation);

        // Calculate position at specified date or now
        const targetDate = date ? new Date(date) : new Date();
        const position = ephemerisService.calculatePosition(
            asteroidData.orbitalElements,
            targetDate,
            includeVelocity === 'true'
        );

        res.json({
            asteroid: {
                designation: asteroidData.designation,
                name: asteroidData.name,
                orbitClass: asteroidData.orbitClass,
                isNEO: asteroidData.isNEO,
                isPHA: asteroidData.isPHA
            },
            position,
            orbitalElements: asteroidData.orbitalElements
        });
    } catch (error) {
        console.error('Error calculating position:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/ephemeris/trajectory/:designation
 * Get trajectory points for an asteroid over a time range
 */
router.get('/trajectory/:designation', async (req, res) => {
    try {
        const { designation } = req.params;
        const { startDate, endDate, steps = 100, perturbations = false } = req.query;

        const asteroidData = await ephemerisService.fetchAsteroidElements(designation);

        const start = startDate ? new Date(startDate) : new Date();
        const end = endDate ? new Date(endDate) : new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000);

        const trajectory = ephemerisService.propagateTrajectory(
            asteroidData.orbitalElements,
            start,
            end,
            parseInt(steps),
            perturbations === 'true'
        );

        res.json({
            asteroid: asteroidData.name,
            orbitalElements: asteroidData.orbitalElements,
            trajectory
        });
    } catch (error) {
        console.error('Error calculating trajectory:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/ephemeris/closest-approach/:designation
 * Find closest approach to Earth within a date range
 */
router.get('/closest-approach/:designation', async (req, res) => {
    try {
        const { designation } = req.params;
        const { startDate, endDate } = req.query;

        const asteroidData = await ephemerisService.fetchAsteroidElements(designation);

        const start = startDate ? new Date(startDate) : new Date();
        const end = endDate ? new Date(endDate) : new Date(start.getTime() + 10 * 365 * 24 * 60 * 60 * 1000);

        const closestApproach = ephemerisService.findClosestApproach(
            asteroidData.orbitalElements,
            start,
            end
        );

        res.json({
            asteroid: asteroidData.name,
            isPHA: asteroidData.isPHA,
            closestApproach
        });
    } catch (error) {
        console.error('Error finding closest approach:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/ephemeris/neo-catalog
 * Fetch all NEOs with orbital elements (for batch visualization)
 */
router.get('/neo-catalog', async (req, res) => {
    try {
        const { limit = 1000, phaOnly = false } = req.query;

        const catalog = await ephemerisService.fetchNEOCatalog({
            limit: parseInt(limit),
            phaOnly: phaOnly === 'true'
        });

        res.json({
            count: catalog.length,
            asteroids: catalog
        });
    } catch (error) {
        console.error('Error fetching NEO catalog:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/ephemeris/batch-positions
 * Calculate positions for multiple asteroids at a specific time
 * Body: { asteroids: [...], date: "ISO date string" }
 */
router.post('/batch-positions', async (req, res) => {
    try {
        const { asteroids, date } = req.body;
        const targetDate = date ? new Date(date) : new Date();

        // Calculate positions as Float32Array (base64 encoded for efficiency)
        const positions = ephemerisService.calculateBatchPositions(asteroids, targetDate);

        // Convert to base64 for JSON transport
        const buffer = Buffer.from(positions.buffer);
        const base64 = buffer.toString('base64');

        res.json({
            count: asteroids.length,
            date: targetDate.toISOString(),
            positionsBase64: base64,
            format: 'Float32Array, packed xyz triplets'
        });
    } catch (error) {
        console.error('Error calculating batch positions:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/ephemeris/celestial-bodies
 * Get positions of Sun, Earth, Moon at a specific time
 */
router.get('/celestial-bodies', (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();

        const bodies = ephemerisService.getCelestialBodies(targetDate);

        res.json(bodies);
    } catch (error) {
        console.error('Error getting celestial bodies:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
