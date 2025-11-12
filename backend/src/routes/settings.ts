import { Router, Request, Response } from 'express';
import { validateNumberInRange } from '../utils/validation';
import logger from '../logger';
import { AppSettings, SETTING_RANGES, DEFAULT_SETTINGS } from '../config/settings';

const router = Router();

// In-memory storage (replace with database in production)
let currentSettings: AppSettings = { ...DEFAULT_SETTINGS };

/**
 * GET /api/settings
 * Get current application settings
 */
router.get('/', (req: Request, res: Response) => {
  try {
    logger.info('Fetching settings');

    res.json({
      settings: currentSettings,
      ranges: SETTING_RANGES,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching settings', {
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
router.post('/', (req: Request, res: Response) => {
  try {
    const newSettings = req.body as Partial<AppSettings>;

    logger.info('Updating settings', { changes: Object.keys(newSettings) });

    // Validate all provided settings
    const validated = validateSettings(newSettings);

    // Merge with existing settings
    currentSettings = { ...currentSettings, ...validated };

    logger.info('Settings updated successfully');

    res.json({
      settings: currentSettings,
      message: 'Settings updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.warn('Settings validation failed', {
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
router.get('/ranges', (req: Request, res: Response) => {
  try {
    logger.info('Fetching setting ranges');

    res.json({
      ranges: SETTING_RANGES,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching setting ranges', {
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
router.post('/reset', (req: Request, res: Response) => {
  try {
    logger.info('Resetting settings to defaults');

    currentSettings = { ...DEFAULT_SETTINGS };

    res.json({
      settings: currentSettings,
      message: 'Settings reset to defaults',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error resetting settings', {
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
function validateSettings(settings: Partial<AppSettings>): Partial<AppSettings> {
  const validated: Partial<AppSettings> = {};

  // Validate planetUpdateInterval
  if (settings.planetUpdateInterval !== undefined) {
    const val = validateNumberInRange(
      settings.planetUpdateInterval,
      SETTING_RANGES.planetUpdateInterval.min,
      SETTING_RANGES.planetUpdateInterval.max
    );
    if (val === null) {
      throw new Error(
        `planetUpdateInterval must be between ${SETTING_RANGES.planetUpdateInterval.min} and ${SETTING_RANGES.planetUpdateInterval.max}ms`
      );
    }
    validated.planetUpdateInterval = val;
  }

  // Validate newsUpdateInterval
  if (settings.newsUpdateInterval !== undefined) {
    const val = validateNumberInRange(
      settings.newsUpdateInterval,
      SETTING_RANGES.newsUpdateInterval.min,
      SETTING_RANGES.newsUpdateInterval.max
    );
    if (val === null) {
      throw new Error(
        `newsUpdateInterval must be between ${SETTING_RANGES.newsUpdateInterval.min} and ${SETTING_RANGES.newsUpdateInterval.max}ms`
      );
    }
    validated.newsUpdateInterval = val;
  }

  // Validate asteroidUpdateInterval
  if (settings.asteroidUpdateInterval !== undefined) {
    const val = validateNumberInRange(
      settings.asteroidUpdateInterval,
      SETTING_RANGES.asteroidUpdateInterval.min,
      SETTING_RANGES.asteroidUpdateInterval.max
    );
    if (val === null) {
      throw new Error(
        `asteroidUpdateInterval must be between ${SETTING_RANGES.asteroidUpdateInterval.min} and ${SETTING_RANGES.asteroidUpdateInterval.max}ms`
      );
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

export default router;
