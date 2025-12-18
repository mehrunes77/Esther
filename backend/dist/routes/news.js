"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_1 = require("../utils/validation");
const logger_1 = __importDefault(require("../logger"));
const news_filter_1 = __importDefault(require("../services/news-filter"));
const settings_1 = require("../config/settings");
const router = (0, express_1.Router)();
const newsService = new news_filter_1.default(settings_1.DEFAULT_SETTINGS);
/**
 * GET /api/news
 * Get filtered astronomy news from all sources
 * Query params:
 *   - limit: number (1-100, default 50)
 *   - offset: number (default 0)
 *   - source: string (filter by specific source)
 *   - minScore: number (minimum relevance score 0-100)
 */
router.get('/', async (req, res) => {
    try {
        const limit = (0, validation_1.validateNumberInRange)(req.query.limit || '50', 1, 100) || 50;
        const offset = (0, validation_1.validateNumberInRange)(req.query.offset || '0', 0, 10000) || 0;
        const minScore = (0, validation_1.validateNumberInRange)(req.query.minScore || '30', 0, 100) || 30;
        const sourceFilter = req.query.source ? String(req.query.source) : null;
        logger_1.default.info('Fetching filtered astronomy news', {
            limit,
            offset,
            minScore,
            source: sourceFilter,
        });
        const articles = await newsService.getFilteredNews();
        // Filter by source if specified
        const filtered = sourceFilter
            ? articles.filter((article) => article.sourceId === sourceFilter)
            : articles;
        // Filter by relevance score
        const relevant = filtered.filter((article) => article.relevanceScore >= minScore);
        // Paginate
        const paginated = relevant.slice(offset, offset + limit);
        res.json({
            articles: paginated,
            pagination: {
                limit,
                offset,
                total: relevant.length,
                pages: Math.ceil(relevant.length / limit),
            },
            filters: {
                minScore,
                source: sourceFilter || 'all',
            },
            timestamp: new Date().toISOString(),
            source: 'NASA, ESA, Space.com, ArXiv Astronomy',
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching news', {
            error: error instanceof Error ? error.message : String(error),
        });
        res.status(500).json({
            error: 'Failed to fetch news',
            message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Internal server error',
        });
    }
});
/**
 * GET /api/news/sources
 * Get list of available news sources
 */
router.get('/sources', async (req, res) => {
    try {
        logger_1.default.info('Fetching news sources');
        const sources = await newsService.getNewsSources();
        res.json({
            sources,
            count: sources.length,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching news sources', {
            error: error instanceof Error ? error.message : String(error),
        });
        res.status(500).json({
            error: 'Failed to fetch news sources',
        });
    }
});
/**
 * GET /api/news/:id
 * Get detailed information about a specific article
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        logger_1.default.info('Fetching article details', { id });
        const article = await newsService.getArticleById(id);
        if (!article) {
            logger_1.default.warn('Article not found', { id });
            return res.status(404).json({
                error: 'Article not found',
                id,
            });
        }
        res.json({
            article,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching article', {
            id: req.params.id,
            error: error instanceof Error ? error.message : String(error),
        });
        res.status(500).json({
            error: 'Failed to fetch article',
        });
    }
});
exports.default = router;
