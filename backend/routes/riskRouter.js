/**
 * Risk Router - API Endpoints for Risk Assessment
 * 
 * Provides endpoints for asteroid risk analysis using
 * Monte Carlo simulations and Torino Scale calculations.
 */

const express = require('express');
const router = express.Router();
const { assessRisk, batchAssessRisk, calculateRiskScore } = require('../utils/riskEngine');
const { getAllScaleLevels } = require('../utils/torinoScale');
const { fetchAsteroidElements } = require('../services/ephemeris.service');

/**
 * GET /api/risk/assess/:designation
 * Comprehensive risk assessment for a specific asteroid
 */
router.get('/assess/:designation', async (req, res) => {
    try {
        const { designation } = req.params;
        const { encounterDate, simulations = 5000 } = req.query;

        // Fetch asteroid data
        const asteroidData = await fetchAsteroidElements(designation);

        // Calculate encounter date (default: closest known approach or 1 year from now)
        const encounterDateObj = encounterDate
            ? new Date(encounterDate)
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

        // Run risk assessment
        const assessment = await assessRisk({
            asteroid: asteroidData,
            encounterDate: encounterDateObj,
            numSimulations: parseInt(simulations)
        });

        res.json({
            success: true,
            designation,
            assessment
        });
    } catch (error) {
        console.error('Risk assessment error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/risk/batch
 * Batch risk assessment for multiple asteroids
 */
router.post('/batch', async (req, res) => {
    try {
        const { asteroids } = req.body;

        if (!Array.isArray(asteroids) || asteroids.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Request must include an array of asteroids'
            });
        }

        // Limit batch size
        const limitedAsteroids = asteroids.slice(0, 100);

        const assessments = await batchAssessRisk(limitedAsteroids);

        res.json({
            success: true,
            count: assessments.length,
            assessments
        });
    } catch (error) {
        console.error('Batch risk assessment error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/risk/quick
 * Quick risk score calculation (no Monte Carlo)
 */
router.get('/quick', async (req, res) => {
    try {
        const {
            isHazardous = 'false',
            diameter = 100,
            distance = 1000000
        } = req.query;

        const score = calculateRiskScore(
            isHazardous === 'true',
            parseFloat(diameter),
            parseFloat(distance)
        );

        res.json({
            success: true,
            score,
            inputs: {
                isHazardous: isHazardous === 'true',
                diameterMeters: parseFloat(diameter),
                distanceKm: parseFloat(distance)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/risk/torino-scale
 * Get Torino Scale reference information
 */
router.get('/torino-scale', (req, res) => {
    res.json({
        success: true,
        scale: getAllScaleLevels()
    });
});

/**
 * GET /api/risk/stats
 * Get risk assessment statistics
 */
router.get('/stats', async (req, res) => {
    try {
        // This would typically pull from database
        res.json({
            success: true,
            stats: {
                totalAssessments: 0,
                highRiskCount: 0,
                lastAssessment: null,
                averageSimulationTime: 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
