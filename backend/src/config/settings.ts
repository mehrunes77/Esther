/**
 * Application Settings & Configuration Schema
 * User-configurable settings for update intervals and data sources
 */

export interface AppSettings {
  // Update intervals (milliseconds)
  planetUpdateInterval: number; // 60,000 - 3,600,000 (1 min - 60 min)
  newsUpdateInterval: number; // 300,000 - 3,600,000 (5 min - 60 min)
  asteroidUpdateInterval: number; // 600,000 - 3,600,000 (10 min - 60 min)

  // Data sources
  dataSourcePreferences: {
    useJPLHorizons: boolean;
    useNASAFactSheets: boolean;
    useMinorPlanetCenter: boolean;
    useESAData: boolean;
  };

  // News filtering
  newsFiltering: {
    enabled: boolean;
    keywords: string[]; // Auto-filter: planet, asteroid, comet, etc.
    excludeKeywords: string[];
    sources: NewsSource[];
  };

  // UI preferences
  ui: {
    theme: 'retro-dark' | 'retro-light';
    updateNotifications: boolean;
    autoRefresh: boolean;
  };
}

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  category: 'astronomy' | 'space-missions' | 'exoplanets' | 'solar-system';
  enabled: boolean;
}

// Default configuration
export const DEFAULT_SETTINGS: AppSettings = {
  planetUpdateInterval: 15 * 60 * 1000, // 15 minutes
  newsUpdateInterval: 30 * 60 * 1000, // 30 minutes
  asteroidUpdateInterval: 60 * 60 * 1000, // 60 minutes

  dataSourcePreferences: {
    useJPLHorizons: true,
    useNASAFactSheets: true,
    useMinorPlanetCenter: true,
    useESAData: true,
  },

  newsFiltering: {
    enabled: true,
    keywords: [
      'planet',
      'asteroid',
      'comet',
      'spacecraft',
      'mission',
      'discovery',
      'solar system',
      'exoplanet',
      'moon',
      'nasa',
      'esa',
      'jpl',
      'astronomy',
    ],
    excludeKeywords: ['finance', 'stock', 'crypto', 'politics'],
    sources: [
      {
        id: 'nasa-news',
        name: 'NASA News',
        url: 'https://www.nasa.gov/news-and-events/feed/',
        category: 'astronomy',
        enabled: true,
      },
      {
        id: 'esa-news',
        name: 'ESA News',
        url: 'https://www.esa.int/rssfeed.php',
        category: 'space-missions',
        enabled: true,
      },
      {
        id: 'space-astronomy',
        name: 'Space.com Astronomy',
        url: 'https://www.space.com/xml/rss-feeds/astronomy.xml',
        category: 'astronomy',
        enabled: true,
      },
      {
        id: 'arxiv-astro',
        name: 'ArXiv Astronomy',
        url: 'https://arxiv.org/list/astro-ph/recent?skip=0&size=100',
        category: 'astronomy',
        enabled: true,
      },
    ],
  },

  ui: {
    theme: 'retro-dark',
    updateNotifications: true,
    autoRefresh: true,
  },
};

// Validation ranges
export const SETTING_RANGES = {
  planetUpdateInterval: { min: 60000, max: 3600000, step: 60000 }, // 1 min - 60 min
  newsUpdateInterval: { min: 300000, max: 3600000, step: 300000 }, // 5 min - 60 min
  asteroidUpdateInterval: { min: 600000, max: 3600000, step: 600000 }, // 10 min - 60 min
};
