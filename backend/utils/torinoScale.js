/**
 * Torino Scale Calculator
 * 
 * Calculates the Torino Impact Hazard Scale (0-10) based on:
 * - Impact probability
 * - Kinetic energy (related to size and velocity)
 * 
 * The Torino Scale is designed to categorize the impact hazard
 * associated with near-Earth objects.
 */

// Torino Scale definitions
const TORINO_SCALE = {
    0: {
        level: 0,
        color: 'white',
        zone: 'No Hazard',
        description: 'The likelihood of a collision is zero, or is so low as to be effectively zero. Also applies to small objects that would disintegrate in the atmosphere.'
    },
    1: {
        level: 1,
        color: 'green',
        zone: 'Normal',
        description: 'A routine discovery in which a pass near Earth is predicted that poses no unusual level of danger. New observations very likely will lead to re-assignment to Level 0.'
    },
    2: {
        level: 2,
        color: 'yellow',
        zone: 'Meriting Attention',
        description: 'A discovery which may become routine with further observations. An encounter is possible that would cause localized damage.'
    },
    3: {
        level: 3,
        color: 'yellow',
        zone: 'Meriting Attention',
        description: 'A close encounter, meriting attention by astronomers. Current calculations give a 1% or greater chance of collision capable of localized destruction.'
    },
    4: {
        level: 4,
        color: 'yellow',
        zone: 'Meriting Attention',
        description: 'A close encounter, meriting attention by astronomers. A >1% chance of collision capable of regional devastation.'
    },
    5: {
        level: 5,
        color: 'orange',
        zone: 'Threatening',
        description: 'A close encounter posing a serious, but still uncertain threat of regional devastation. Attention by astronomers is required.'
    },
    6: {
        level: 6,
        color: 'orange',
        zone: 'Threatening',
        description: 'A close encounter by a large object posing a serious but still uncertain threat of a global catastrophe. Attention by astronomers is warranted.'
    },
    7: {
        level: 7,
        color: 'orange',
        zone: 'Threatening',
        description: 'A very close encounter by a large object, posing an unprecedented but still uncertain threat of a global catastrophe.'
    },
    8: {
        level: 8,
        color: 'red',
        zone: 'Certain Collision',
        description: 'A collision is certain, capable of causing localized destruction for an impact over land or a tsunami if close offshore.'
    },
    9: {
        level: 9,
        color: 'red',
        zone: 'Certain Collision',
        description: 'A collision is certain, capable of causing unprecedented regional devastation or a major tsunami if impacting ocean.'
    },
    10: {
        level: 10,
        color: 'red',
        zone: 'Certain Collision',
        description: 'A collision is certain, capable of causing global climatic catastrophe that may threaten civilization as we know it.'
    }
};

// Energy thresholds in megatons TNT
const ENERGY_THRESHOLDS = {
    LOCAL: 0.001,        // <1 kiloton - local damage
    REGIONAL: 1,         // 1 MT - regional devastation  
    GLOBAL: 1000         // 1000 MT - global catastrophe
};

/**
 * Calculate Torino Scale level
 * 
 * @param {number} impactProbability - Probability of impact (0-1)
 * @param {number} energyMT - Kinetic energy in megatons TNT
 * @returns {Object} Torino scale result
 */
function calculateTorinoScale(impactProbability, energyMT) {
    // Validate inputs
    if (impactProbability < 0 || impactProbability > 1) {
        throw new Error('Impact probability must be between 0 and 1');
    }

    if (energyMT < 0) {
        throw new Error('Energy must be non-negative');
    }

    let level = 0;

    // Objects too small to cause significant damage
    if (energyMT < ENERGY_THRESHOLDS.LOCAL) {
        level = 0;
    }
    // Certain collision cases (probability >= 99%)
    else if (impactProbability >= 0.99) {
        if (energyMT >= ENERGY_THRESHOLDS.GLOBAL) {
            level = 10;
        } else if (energyMT >= ENERGY_THRESHOLDS.REGIONAL) {
            level = 9;
        } else {
            level = 8;
        }
    }
    // Threatening cases (significant probability)
    else if (impactProbability >= 0.01) {
        if (energyMT >= ENERGY_THRESHOLDS.GLOBAL) {
            if (impactProbability >= 0.5) {
                level = 7;
            } else {
                level = 6;
            }
        } else if (energyMT >= ENERGY_THRESHOLDS.REGIONAL) {
            level = 5;
        } else {
            level = 4;
        }
    }
    // Lower probability cases
    else if (impactProbability >= 0.001) {
        if (energyMT >= ENERGY_THRESHOLDS.REGIONAL) {
            level = 4;
        } else {
            level = 3;
        }
    }
    // Very low probability
    else if (impactProbability >= 0.0001) {
        if (energyMT >= ENERGY_THRESHOLDS.REGIONAL) {
            level = 3;
        } else if (energyMT >= ENERGY_THRESHOLDS.LOCAL) {
            level = 2;
        } else {
            level = 1;
        }
    }
    // Negligible probability
    else if (impactProbability > 0 && energyMT >= ENERGY_THRESHOLDS.LOCAL) {
        level = 1;
    }
    // No hazard
    else {
        level = 0;
    }

    return {
        level,
        ...TORINO_SCALE[level],
        impactProbability,
        energyMT,
        recommendation: getRecommendation(level)
    };
}

/**
 * Calculate Torino Scale from asteroid parameters
 * 
 * @param {Object} params - Asteroid parameters
 * @param {number} params.impactProbability - Impact probability (0-1)
 * @param {number} params.diameter - Diameter in km
 * @param {number} params.velocity - Relative velocity in km/s
 * @param {number} params.density - Density in kg/m³ (default 2500)
 * @returns {Object} Torino scale result with energy calculation
 */
function calculateFromParameters({ impactProbability, diameter, velocity, density = 2500 }) {
    // Calculate kinetic energy
    const radiusM = (diameter * 1000) / 2;
    const volume = (4 / 3) * Math.PI * Math.pow(radiusM, 3);
    const mass = volume * density;
    const velocityMs = velocity * 1000;
    const energyJoules = 0.5 * mass * Math.pow(velocityMs, 2);
    const energyMT = energyJoules / 4.184e15;

    const result = calculateTorinoScale(impactProbability, energyMT);

    return {
        ...result,
        diameter,
        velocity,
        mass,
        energyJoules
    };
}

/**
 * Get action recommendation based on Torino level
 */
function getRecommendation(level) {
    switch (level) {
        case 0:
            return 'No action required. Object poses no threat.';
        case 1:
            return 'Continue routine observations. Object will likely be downgraded to level 0.';
        case 2:
        case 3:
        case 4:
            return 'Monitor closely. Additional observations needed to refine orbital parameters.';
        case 5:
        case 6:
        case 7:
            return 'URGENT: Government agencies should be notified. Continuous monitoring required. Begin contingency planning.';
        case 8:
        case 9:
        case 10:
            return 'CRITICAL: Collision is certain. Immediate government action required for civil defense and possible deflection mission.';
        default:
            return 'Unknown classification.';
    }
}

/**
 * Get color for UI display
 */
function getScaleColor(level) {
    const info = TORINO_SCALE[level];
    const colorMap = {
        white: '#FFFFFF',
        green: '#00FF00',
        yellow: '#FFFF00',
        orange: '#FFA500',
        red: '#FF0000'
    };
    return colorMap[info.color] || '#FFFFFF';
}

/**
 * Get all scale levels for reference
 */
function getAllScaleLevels() {
    return Object.values(TORINO_SCALE);
}

module.exports = {
    calculateTorinoScale,
    calculateFromParameters,
    getRecommendation,
    getScaleColor,
    getAllScaleLevels,
    TORINO_SCALE,
    ENERGY_THRESHOLDS
};
