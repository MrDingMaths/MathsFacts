/**
 * Configuration Utilities Module
 * Provides utility functions to derive level metadata from CONFIG
 * Uses lazy initialization with caching for optimal performance
 */

import { CONFIG } from './config.js';

/**
 * Lazy-initialized caches for performance
 * Maps are built on first access, then reused for O(1) lookups
 */
let keyToNameCache = null;
let keyToCategoryCache = null;

/**
 * Build key-to-name lookup from CONFIG.LEVEL_GROUPS
 * Iterates through all level groups and creates a flat map
 * @returns {Object} Map of levelKey -> levelName
 */
function buildKeyToNameMap() {
    if (keyToNameCache) return keyToNameCache;

    keyToNameCache = {};
    Object.values(CONFIG.LEVEL_GROUPS).forEach(group => {
        group.forEach(level => {
            keyToNameCache[level.key] = level.name;
        });
    });

    return keyToNameCache;
}

/**
 * Build key-to-category lookup from CONFIG.LEVEL_GROUPS and CONFIG.CATEGORY_MAP
 * Maps each level key to its parent group's category
 * @returns {Object} Map of levelKey -> category
 */
function buildKeyToCategoryMap() {
    if (keyToCategoryCache) return keyToCategoryCache;

    keyToCategoryCache = {};
    Object.entries(CONFIG.LEVEL_GROUPS).forEach(([groupName, levels]) => {
        const category = CONFIG.CATEGORY_MAP[groupName] || 'other';
        levels.forEach(level => {
            keyToCategoryCache[level.key] = category;
        });
    });

    return keyToCategoryCache;
}

/**
 * Get level display name from key
 * @param {string} key - Level key (e.g., 'bonds10', 'multiplyDivideBy100')
 * @returns {string} Level display name (e.g., 'Bonds to 10', '×÷ 100')
 */
export function getLevelNameFromKey(key) {
    const map = buildKeyToNameMap();
    return map[key] || key; // Fallback to key if not found
}

/**
 * Get level abbreviation from name for skill path display
 * @param {string} levelName - Level display name
 * @returns {Object} {text: string, useKaTeX: boolean}
 */
export function getLevelAbbreviation(levelName) {
    return CONFIG.LEVEL_ABBREVIATIONS[levelName] ||
           { text: levelName.charAt(0), useKaTeX: false }; // Fallback to first character
}

/**
 * Get drill category from key for filtering
 * @param {string} key - Level key
 * @returns {string} Category identifier ('bonds', 'multiplication', 'fractions', or 'other')
 */
export function getDrillCategory(key) {
    const map = buildKeyToCategoryMap();
    return map[key] || 'other';
}

/**
 * Reset all caches - useful for testing or if CONFIG changes at runtime
 */
export function resetConfigCaches() {
    keyToNameCache = null;
    keyToCategoryCache = null;
}
