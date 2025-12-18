import { Router } from 'express';
import { validateNumberInRange } from '../utils/validation.js';
import AstronomyNewsService from '../services/news-filter.js';
import { DEFAULT_SETTINGS } from '../config/settings.js';
const router = Router();
const newsService = new AstronomyNewsService(DEFAULT_SETTINGS);
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
        const limit = validateNumberInRange(req.query.limit || '50', 1, 100) || 50;
        const offset = validateNumberInRange(req.query.offset || '0', 0, 10000) || 0;
        const minScore = validateNumberInRange(req.query.minScore || '30', 0, 100) || 30;
        const sourceFilter = req.query.source ? String(req.query.source) : null;
        console.info('Fetching filtered astronomy news', {
            limit,
            offset,
            minScore,
            source: sourceFilter,
        });
        const articles = await newsService.fetchFilteredNews();
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
        console.error('Error fetching news', {
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
        console.info('Fetching news sources');
        const sources = DEFAULT_SETTINGS.newsFiltering.sources;
        res.json({
            sources,
            count: sources.length,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error fetching news sources', {
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
        console.info('Fetching article details', { id });
        // Return mock article for now
        res.json({
            article: {
                id,
                title: 'Article details not available',
                description: 'Please use the main /api/news endpoint to browse articles',
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error fetching article', {
            id: req.params.id,
            error: error instanceof Error ? error.message : String(error),
        });
        res.status(500).json({
            error: 'Failed to fetch article',
        });
    }
});
export default router;
