/**
 * Astronomy News Aggregation & Filtering Service
 * Fetches RSS feeds and auto-filters for astronomy/space content only
 */
import { AppSettings, NewsSource } from '../config/settings';
export interface NewsArticle {
    id: string;
    title: string;
    link: string;
    source: string;
    sourceId: string;
    pubDate: Date;
    description: string;
    category: string;
    relevanceScore: number;
}
declare class AstronomyNewsService {
    private settings;
    constructor(settings: AppSettings);
    /**
     * Determine if article is astronomy-related based on keywords
     */
    private isAstronomyContent;
    /**
     * Calculate relevance score based on keyword density
     */
    private calculateRelevance;
    /**
     * Fetch and filter news from all enabled sources
     */
    fetchFilteredNews(): Promise<NewsArticle[]>;
    /**
     * Create unique ID from URL
     */
    private hashUrl;
    /**
     * Get news sources
     */
    getNewsSources(): Promise<NewsSource[]>;
    /**
     * Get article by ID
     */
    getArticleById(id: string): Promise<NewsArticle | null>;
    /**
     * Get filtered news (alias for fetchFilteredNews)
     */
    getFilteredNews(): Promise<NewsArticle[]>;
    /**
     * Update settings at runtime
     */
    updateSettings(newSettings: Partial<AppSettings>): void;
}
export declare function getNewsService(settings: AppSettings): AstronomyNewsService;
export default AstronomyNewsService;
