"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_1 = require("../utils/validation");
const logger_1 = __importDefault(require("../logger"));
const settings_1 = require("../config/settings");
const router = (0, express_1.Router)();
// In-memory storage (replace with database in production)
let currentSettings = { ...settings_1.DEFAULT_SETTINGS };
/**
 * GET /api/settings
 * Get current application settings
 */
router.get('/', (req, res) => {
    try {
        logger_1.default.info('Fetching settings');
        res.json({
            settings: currentSettings,
            ranges: settings_1.SETTING_RANGES,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching settings', {
            error: error instanceof Error ? error.message : String(error),
        });
        res.status(500).json({
            error: 'Failed to fetch settings',
        });
    }
});
/**
 * POST /api/settings
 * Update application settings with validation
 */
router.post('/', (req, res) => {
    try {
        const newSettings = req.body;
        logger_1.default.info('Updating settings', { changes: Object.keys(newSettings) });
        // Validate all provided settings
        const validated = validateSettings(newSettings);
        // Merge with existing settings
        currentSettings = { ...currentSettings, ...validated };
        logger_1.default.info('Settings updated successfully');
        res.json({
            settings: currentSettings,
            message: 'Settings updated successfully',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.default.warn('Settings validation failed', {
            error: error instanceof Error ? error.message : String(error),
        });
        res.status(400).json({
            error: 'Invalid settings',
            message: error instanceof Error ? error.message : 'Validation failed',
        });
    }
});
/**
 * GET /api/settings/ranges
 * Get valid ranges for numeric settings
 */
router.get('/ranges', (req, res) => {
    try {
        logger_1.default.info('Fetching setting ranges');
        res.json({
            ranges: settings_1.SETTING_RANGES,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching setting ranges', {
            error: error instanceof Error ? error.message : String(error),
        });
        res.status(500).json({
            error: 'Failed to fetch setting ranges',
        });
    }
});
/**
 * POST /api/settings/reset
 * Reset settings to defaults
 */
router.post('/reset', (req, res) => {
    try {
        logger_1.default.info('Resetting settings to defaults');
        currentSettings = { ...settings_1.DEFAULT_SETTINGS };
        res.json({
            settings: currentSettings,
            message: 'Settings reset to defaults',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.default.error('Error resetting settings', {
            error: error instanceof Error ? error.message : String(error),
        });
        res.status(500).json({
            error: 'Failed to reset settings',
        });
    }
});
/**
 * Validate settings object
 */
function validateSettings(settings) {
    const validated = {};
    // Validate planetUpdateInterval
    if (settings.planetUpdateInterval !== undefined) {
        const val = (0, validation_1.validateNumberInRange)(settings.planetUpdateInterval, settings_1.SETTING_RANGES.planetUpdateInterval.min, settings_1.SETTING_RANGES.planetUpdateInterval.max);
        if (val === null) {
            throw new Error(`planetUpdateInterval must be between ${settings_1.SETTING_RANGES.planetUpdateInterval.min} and ${settings_1.SETTING_RANGES.planetUpdateInterval.max}ms`);
        }
        validated.planetUpdateInterval = val;
    }
    // Validate newsUpdateInterval
    if (settings.newsUpdateInterval !== undefined) {
        const val = (0, validation_1.validateNumberInRange)(settings.newsUpdateInterval, settings_1.SETTING_RANGES.newsUpdateInterval.min, settings_1.SETTING_RANGES.newsUpdateInterval.max);
        if (val === null) {
            throw new Error(`newsUpdateInterval must be between ${settings_1.SETTING_RANGES.newsUpdateInterval.min} and ${settings_1.SETTING_RANGES.newsUpdateInterval.max}ms`);
        }
        validated.newsUpdateInterval = val;
    }
    // Validate asteroidUpdateInterval
    if (settings.asteroidUpdateInterval !== undefined) {
        const val = (0, validation_1.validateNumberInRange)(settings.asteroidUpdateInterval, settings_1.SETTING_RANGES.asteroidUpdateInterval.min, settings_1.SETTING_RANGES.asteroidUpdateInterval.max);
        if (val === null) {
            throw new Error(`asteroidUpdateInterval must be between ${settings_1.SETTING_RANGES.asteroidUpdateInterval.min} and ${settings_1.SETTING_RANGES.asteroidUpdateInterval.max}ms`);
        }
        validated.asteroidUpdateInterval = val;
    }
    // Validate newsFiltering
    if (settings.newsFiltering !== undefined) {
        if (typeof settings.newsFiltering.enabled !== 'boolean') {
            throw new Error('newsFiltering.enabled must be a boolean');
        }
        validated.newsFiltering = settings.newsFiltering;
    }
    return validated;
}
exports.default = router;
