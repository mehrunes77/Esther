import { Router, Request, Response } from 'express';
import { validateNumberInRange } from '../utils/validation';
import logger from '../logger';
import AstronomyNewsService from '../services/news-filter';
import { DEFAULT_SETTINGS } from '../config/settings';

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
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = validateNumberInRange(req.query.limit || '50', 1, 100) || 50;
    const offset = validateNumberInRange(req.query.offset || '0', 0, 10000) || 0;
    const minScore = validateNumberInRange(req.query.minScore || '30', 0, 100) || 30;
    const sourceFilter = req.query.source ? String(req.query.source) : null;

    logger.info('Fetching filtered astronomy news', {
      limit,
      offset,
      minScore,
      source: sourceFilter,
    });

    const articles = await newsService.getFilteredNews();

    // Filter by source if specified
    const filtered = sourceFilter
      ? articles.filter((article: any) => article.sourceId === sourceFilter)
      : articles;

    // Filter by relevance score
    const relevant = filtered.filter((article: any) => article.relevanceScore >= minScore);

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
  } catch (error) {
    logger.error('Error fetching news', {
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
router.get('/sources', async (req: Request, res: Response) => {
  try {
    logger.info('Fetching news sources');

    const sources = await newsService.getNewsSources();

    res.json({
      sources,
      count: sources.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching news sources', {
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
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    logger.info('Fetching article details', { id });

    const article = await newsService.getArticleById(id);

    if (!article) {
      logger.warn('Article not found', { id });
      return res.status(404).json({
        error: 'Article not found',
        id,
      });
    }

    res.json({
      article,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching article', {
      id: req.params.id,
      error: error instanceof Error ? error.message : String(error),
    });

    res.status(500).json({
      error: 'Failed to fetch article',
    });
  }
});

export default router;
