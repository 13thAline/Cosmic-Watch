/**
 * Cron Jobs - Scheduled Tasks
 * 
 * Automated scheduling for data ingestion, cache maintenance,
 * and alert monitoring.
 */

const cron = require('node-cron');
const dataIngestion = require('../services/dataIngestion.service');
const redisClient = require('../utils/redisClient');

// Track scheduled jobs
const scheduledJobs = {};

/**
 * Initialize all scheduled jobs
 */
function initializeCronJobs() {
    console.log('Initializing scheduled tasks...');

    // Close approach sync - every 6 hours
    scheduledJobs.closeApproachSync = cron.schedule('0 */6 * * *', async () => {
        console.log('[CRON] Running close approach sync...');
        try {
            await dataIngestion.syncCloseApproaches();
        } catch (error) {
            console.error('[CRON] Close approach sync failed:', error.message);
        }
    }, {
        scheduled: true,
        timezone: 'UTC'
    });

    // Full NEO sync - daily at 2 AM UTC
    scheduledJobs.fullNEOSync = cron.schedule('0 2 * * *', async () => {
        console.log('[CRON] Running full NEO catalog sync...');
        try {
            await dataIngestion.fullNEOSync({ limit: 5000 });
        } catch (error) {
            console.error('[CRON] Full NEO sync failed:', error.message);
        }
    }, {
        scheduled: true,
        timezone: 'UTC'
    });

    // Cache cleanup - every hour
    scheduledJobs.cacheCleanup = cron.schedule('0 * * * *', async () => {
        console.log('[CRON] Running cache cleanup...');
        try {
            // Redis handles TTL automatically, but we can log stats
            if (redisClient.isAvailable()) {
                console.log('[CRON] Redis cache active');
            }
        } catch (error) {
            console.error('[CRON] Cache cleanup failed:', error.message);
        }
    }, {
        scheduled: true,
        timezone: 'UTC'
    });

    // Health check - every 5 minutes
    scheduledJobs.healthCheck = cron.schedule('*/5 * * * *', () => {
        const stats = dataIngestion.getStats();
        if (stats.errors.length > 10) {
            console.warn(`[CRON] High error count: ${stats.errors.length} errors`);
        }
    }, {
        scheduled: true,
        timezone: 'UTC'
    });

    console.log('✓ Scheduled tasks initialized:');
    console.log('  - Close approach sync: every 6 hours');
    console.log('  - Full NEO sync: daily at 2 AM UTC');
    console.log('  - Cache cleanup: hourly');
    console.log('  - Health check: every 5 minutes');
}

/**
 * Stop all scheduled jobs
 */
function stopAllJobs() {
    Object.values(scheduledJobs).forEach(job => {
        if (job && typeof job.stop === 'function') {
            job.stop();
        }
    });
    console.log('All scheduled tasks stopped');
}

/**
 * Run a specific job immediately
 * @param {string} jobName - Name of job to run
 */
async function runJobNow(jobName) {
    console.log(`[CRON] Manually triggering ${jobName}...`);

    switch (jobName) {
        case 'closeApproachSync':
            return await dataIngestion.syncCloseApproaches();

        case 'fullNEOSync':
            return await dataIngestion.fullNEOSync({ limit: 5000 });

        case 'cacheCleanup':
            await dataIngestion.clearCaches();
            return { status: 'complete', message: 'Caches cleared' };

        default:
            throw new Error(`Unknown job: ${jobName}`);
    }
}

/**
 * Get status of all scheduled jobs
 */
function getJobStatus() {
    return Object.entries(scheduledJobs).map(([name, job]) => ({
        name,
        running: job ? true : false
    }));
}

module.exports = {
    initializeCronJobs,
    stopAllJobs,
    runJobNow,
    getJobStatus
};
