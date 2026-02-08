/**
 * Redis Client - Caching Layer
 * 
 * Provides connection to Redis for caching asteroid data,
 * API responses, and computed trajectories.
 */

const Redis = require('ioredis');

// Redis connection configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Cache TTL defaults (in seconds)
const CACHE_TTL = {
    NEO_CATALOG: 3600,      // 1 hour - NEO list doesn't change rapidly
    ASTEROID_ELEMENTS: 86400, // 24 hours - orbital elements are stable
    TRAJECTORY: 1800,       // 30 minutes - computed trajectories
    POSITION: 300,          // 5 minutes - current positions
    CELESTIAL: 60,          // 1 minute - celestial body positions
    API_RESPONSE: 600       // 10 minutes - generic API cache
};

// Create Redis client with reconnection logic
let redis = null;
let isConnected = false;

function createClient() {
    if (redis) return redis;

    try {
        redis = new Redis(REDIS_URL, {
            retryDelayOnFailover: 1000,
            maxRetriesPerRequest: 3,
            lazyConnect: true,
            showFriendlyErrorStack: true,
            reconnectOnError: (err) => {
                const targetError = 'READONLY';
                if (err.message.includes(targetError)) {
                    return true;
                }
                return false;
            }
        });

        redis.on('connect', () => {
            console.log('✓ Redis connected');
            isConnected = true;
        });

        redis.on('error', (err) => {
            console.error('Redis error:', err.message);
            isConnected = false;
        });

        redis.on('close', () => {
            console.log('Redis connection closed');
            isConnected = false;
        });

        return redis;
    } catch (error) {
        console.error('Failed to create Redis client:', error.message);
        return null;
    }
}

/**
 * Get cached value by key
 * @param {string} key - Cache key
 * @returns {any} Parsed cached value or null
 */
async function get(key) {
    if (!isConnected) return null;

    try {
        const client = createClient();
        if (!client) return null;

        const value = await client.get(key);
        if (!value) return null;

        return JSON.parse(value);
    } catch (error) {
        console.error(`Redis GET error for key ${key}:`, error.message);
        return null;
    }
}

/**
 * Set cached value with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache (will be JSON stringified)
 * @param {number} ttl - Time to live in seconds
 */
async function set(key, value, ttl = CACHE_TTL.API_RESPONSE) {
    if (!isConnected) return false;

    try {
        const client = createClient();
        if (!client) return false;

        await client.setex(key, ttl, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Redis SET error for key ${key}:`, error.message);
        return false;
    }
}

/**
 * Delete cached value
 * @param {string} key - Cache key or pattern
 */
async function del(key) {
    if (!isConnected) return false;

    try {
        const client = createClient();
        if (!client) return false;

        await client.del(key);
        return true;
    } catch (error) {
        console.error(`Redis DEL error for key ${key}:`, error.message);
        return false;
    }
}

/**
 * Delete all keys matching pattern
 * @param {string} pattern - Key pattern (e.g., "asteroid:*")
 */
async function delPattern(pattern) {
    if (!isConnected) return false;

    try {
        const client = createClient();
        if (!client) return false;

        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(...keys);
        }
        return true;
    } catch (error) {
        console.error(`Redis DEL pattern error for ${pattern}:`, error.message);
        return false;
    }
}

/**
 * Cache wrapper - returns cached value or calls fn and caches result
 * @param {string} key - Cache key
 * @param {Function} fn - Async function to call if cache miss
 * @param {number} ttl - Time to live in seconds
 */
async function cacheOrFetch(key, fn, ttl = CACHE_TTL.API_RESPONSE) {
    // Try to get from cache first
    const cached = await get(key);
    if (cached !== null) {
        return { data: cached, fromCache: true };
    }

    // Cache miss - call function
    const result = await fn();

    // Cache the result
    await set(key, result, ttl);

    return { data: result, fromCache: false };
}

/**
 * Initialize Redis connection
 */
async function connect() {
    try {
        const client = createClient();
        if (!client) {
            console.log('Redis client not available - caching disabled');
            return false;
        }

        await client.connect();
        return true;
    } catch (error) {
        console.error('Redis connection failed:', error.message);
        console.log('Continuing without Redis caching...');
        return false;
    }
}

/**
 * Close Redis connection
 */
async function disconnect() {
    if (redis) {
        await redis.quit();
        redis = null;
        isConnected = false;
    }
}

/**
 * Check if Redis is available
 */
function isAvailable() {
    return isConnected;
}

// Cache key generators
const keys = {
    neoCatalog: (limit, phaOnly) => `neo:catalog:${limit}:${phaOnly}`,
    asteroidElements: (designation) => `asteroid:elements:${designation}`,
    asteroidPosition: (designation, date) => `asteroid:position:${designation}:${date}`,
    trajectory: (designation, start, end, steps) => `trajectory:${designation}:${start}:${end}:${steps}`,
    celestialBodies: (date) => `celestial:${date}`,
    closestApproach: (designation, start, end) => `closest:${designation}:${start}:${end}`
};

module.exports = {
    // Connection
    connect,
    disconnect,
    isAvailable,

    // Operations
    get,
    set,
    del,
    delPattern,
    cacheOrFetch,

    // Key generators
    keys,

    // TTL constants
    CACHE_TTL
};
