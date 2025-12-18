"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_1 = require("../utils/validation");
const logger_1 = __importDefault(require("../logger"));
const planetary_data_1 = __importDefault(require("../services/planetary-data"));
const ephemeris_1 = __importDefault(require("../services/ephemeris"));
const router = (0, express_1.Router)();
const planetaryDataService = new planetary_data_1.default();
const ephemerisService = new ephemeris_1.default();
/**
 * GET /api/planets/positions
 * Get real-time positions of all planets
 */
router.get('/positions', async (req, res) => {
    try {
        logger_1.default.info('Fetching planet positions');
        const positions = await ephemerisService.getAllPlanetPositions();
        if (!positions || positions.length === 0) {
            logger_1.default.warn('No planet positions found, returning empty array');
            return res.json({ planets: [] });
        }
        res.json({
            planets: positions,
            timestamp: new Date().toISOString(),
            source: 'NASA JPL Horizons API',
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching planet positions', {
            error: error instanceof Error ? error.message : String(error),
        });
        res.status(500).json({
            error: 'Failed to fetch planet positions',
            message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Internal server error',
        });
    }
});
/**
 * GET /api/planets/:name
 * Get detailed profile and current position of a specific planet/body
 */
router.get('/:name', async (req, res) => {
    try {
        const { name } = req.params;
        // Validate input
        if (!name || !(0, validation_1.validateBodyName)(name)) {
            logger_1.default.warn('Invalid body name requested', { name });
            return res.status(400).json({
                error: 'Invalid body name',
                message: 'Body name must contain only letters, numbers, spaces, hyphens, and parentheses',
            });
        }
        logger_1.default.info('Fetching planet data', { body: name });
        // Get real-time position
        const position = await ephemerisService.getPlanetaryPosition(name);
        // Get profile data
        const profile = await planetaryDataService.getPlanetProfile(name);
        if (!position && !profile) {
            logger_1.default.warn('Planet data not found', { body: name });
            return res.status(404).json({
                error: 'Planet not found',
                message: `No data available for ${name}`,
            });
        }
        res.json({
            name,
            position: position || null,
            profile: profile || null,
            timestamp: new Date().toISOString(),
            source: 'NASA JPL Horizons + NASA Fact Sheets',
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching planet data', {
            body: req.params.name,
            error: error instanceof Error ? error.message : String(error),
        });
        res.status(500).json({
            error: 'Failed to fetch planet data',
            message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Internal server error',
        });
    }
});
/**
 * GET /api/planets/category/:category
 * Get planets by category (terrestrial, gas_giant, ice_giant, etc)
 */
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const validCategories = ['terrestrial', 'gas_giant', 'ice_giant', 'dwarf', 'moon', 'asteroid'];
        if (!validCategories.includes(category.toLowerCase())) {
            return res.status(400).json({
                error: 'Invalid category',
                validCategories,
            });
        }
        logger_1.default.info('Fetching planets by category', { category });
        const planets = await planetaryDataService.getPlanetsByCategory(category);
        res.json({
            category,
            planets,
            count: planets.length,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching planets by category', {
            category: req.params.category,
            error: error instanceof Error ? error.message : String(error),
        });
        res.status(500).json({
            error: 'Failed to fetch planets by category',
        });
    }
});
exports.default = router;
