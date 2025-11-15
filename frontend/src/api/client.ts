import axios, { AxiosInstance } from 'axios';

/**
 * Esther API Client
 * Handles all communication between frontend and backend
 * Uses Electron IPC when available, HTTP otherwise
 */

export interface PlanetPosition {
  name: string;
  rightAscension: number;
  declination: number;
  distance: number;
  illumination: number;
  magnitude: number;
  timestamp: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  link: string;
  source: string;
  sourceId: string;
  pubDate: string;
  description: string;
  category: string;
  relevanceScore: number;
}

export interface AppSettings {
  planetUpdateInterval: number;
  newsUpdateInterval: number;
  asteroidUpdateInterval: number;
  newsFiltering: {
    enabled: boolean;
    sources: Array<{ id: string; name: string; enabled: boolean }>;
  };
}

class EstherAPIClient {
  private httpClient: AxiosInstance;
  private useIPC: boolean = false;

  constructor() {
    // Check if Electron IPC is available
    this.useIPC = typeof window !== 'undefined' && (window as any).estherAPI !== undefined;

    // Setup HTTP client for fallback
    this.httpClient = axios.create({
      baseURL: 'http://localhost:5001',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get real-time planet positions
   */
  async getPlanetPositions(): Promise<PlanetPosition[]> {
    try {
      if (this.useIPC) {
        const positions = await (window as any).estherAPI.getPlanetPositions();
        return positions;
      }

      console.log('Making HTTP request to /api/planets/positions');
      const response = await this.httpClient.get('/api/planets/positions');
      console.log('API Response:', response.data);
      
      if (!response.data || !response.data.planets) {
        throw new Error('Invalid response format from backend');
      }
      
      // Filter out null planets
      return response.data.planets.filter((p: PlanetPosition | null) => p !== null);
    } catch (error) {
      console.error('Failed to fetch planet positions:', error);
      if (error instanceof Error) {
        throw new Error(`API Error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get detailed data for a specific planet
   */
  async getPlanetProfile(name: string): Promise<any> {
    try {
      if (this.useIPC) {
        return await (window as any).estherAPI.getPlanetProfile(name);
      }

      const response = await this.httpClient.get(`/api/planets/${encodeURIComponent(name)}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch planet profile for ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get filtered astronomy news
   */
  async getNews(options?: {
    limit?: number;
    offset?: number;
    minScore?: number;
    source?: string;
  }): Promise<{ articles: NewsArticle[]; pagination: any }> {
    try {
      if (this.useIPC) {
        return await (window as any).estherAPI.getNews();
      }

      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', String(options.limit));
      if (options?.offset) params.append('offset', String(options.offset));
      if (options?.minScore) params.append('minScore', String(options.minScore));
      if (options?.source) params.append('source', options.source);

      const response = await this.httpClient.get(`/api/news?${params.toString()}`);
      return {
        articles: response.data.articles || [],
        pagination: response.data.pagination || { limit: 0, offset: 0, total: 0, pages: 0 },
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          console.warn('Backend not available - news service offline');
        } else {
          console.warn('Failed to fetch news:', error.message);
        }
      } else {
        console.error('Failed to fetch news:', error);
      }
      // Return empty result instead of throwing
      return {
        articles: [],
        pagination: { limit: 0, offset: 0, total: 0, pages: 0 },
      };
    }
  }

  /**
   * Get application settings
   */
  async getSettings(): Promise<AppSettings> {
    try {
      if (this.useIPC) {
        return await (window as any).estherAPI.getSettings();
      }

      const response = await this.httpClient.get('/api/settings');
      return response.data.settings;
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      throw error;
    }
  }

  /**
   * Update application settings
   */
  async saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    try {
      if (this.useIPC) {
        return await (window as any).estherAPI.saveSettings(settings);
      }

      const response = await this.httpClient.post('/api/settings', settings);
      return response.data.settings;
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(): Promise<AppSettings> {
    try {
      const response = await this.httpClient.post('/api/settings/reset');
      return response.data.settings;
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    }
  }

  /**
   * Get news sources
   */
  async getNewsSources(): Promise<any[]> {
    try {
      const response = await this.httpClient.get('/api/news/sources');
      return response.data.sources;
    } catch (error) {
      console.error('Failed to fetch news sources:', error);
      throw error;
    }
  }

  /**
   * Listen for real-time updates (Electron IPC only)
   */
  onPlanetUpdate(callback: (data: any) => void): void {
    if (this.useIPC) {
      (window as any).estherAPI.onPlanetUpdate(callback);
    } else {
      console.warn('Real-time updates only available in Electron app');
    }
  }

  onNewsUpdate(callback: (data: any) => void): void {
    if (this.useIPC) {
      (window as any).estherAPI.onNewsUpdate(callback);
    } else {
      console.warn('Real-time updates only available in Electron app');
    }
  }

  /**
   * Check if backend is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.httpClient.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiClient = new EstherAPIClient();

export default EstherAPIClient;
