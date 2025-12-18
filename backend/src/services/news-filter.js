/**
 * Astronomy News Aggregation & Filtering Service
 * Fetches RSS feeds and auto-filters for astronomy/space content only
 */
import Parser from 'rss-parser';
const parser = new Parser({ timeout: 10000 });
class AstronomyNewsService {
    constructor(settings) {
        this.settings = settings;
    }
    /**
     * Determine if article is astronomy-related based on keywords
     */
    isAstronomyContent(title, description) {
        if (!this.settings.newsFiltering.enabled)
            return true;
        const text = `${title} ${description}`.toLowerCase();
        // Check for include keywords
        const hasKeyword = this.settings.newsFiltering.keywords.some((keyword) => text.includes(keyword.toLowerCase()));
        // Check for exclude keywords
        const hasExcluded = this.settings.newsFiltering.excludeKeywords.some((keyword) => text.includes(keyword.toLowerCase()));
        return hasKeyword && !hasExcluded;
    }
    /**
     * Calculate relevance score based on keyword density
     */
    calculateRelevance(title, description) {
        const text = `${title} ${description}`.toLowerCase();
        let score = 0;
        // Higher weight for title keywords
        const titleKeywords = this.settings.newsFiltering.keywords.filter((k) => title.toLowerCase().includes(k.toLowerCase())).length;
        score += titleKeywords * 15;
        // Lower weight for description keywords
        const descKeywords = this.settings.newsFiltering.keywords.filter((k) => description.toLowerCase().includes(k.toLowerCase())).length;
        score += Math.min(descKeywords * 5, 50);
        return Math.min(score, 100);
    }
    /**
     * Fetch and filter news from all enabled sources
     */
    async fetchFilteredNews() {
        const articles = [];
        const seenUrls = new Set();
        const enabledSources = this.settings.newsFiltering.sources.filter((s) => s.enabled);
        for (const source of enabledSources) {
            try {
                console.log(`Fetching from ${source.name}...`);
                const feed = await parser.parseURL(source.url);
                (feed.items || []).slice(0, 10).forEach((item) => {
                    const title = item.title || '';
                    const description = item.contentSnippet || item.description || '';
                    // Skip if already seen
                    if (seenUrls.has(item.link))
                        return;
                    // Filter for astronomy content
                    if (!this.isAstronomyContent(title, description)) {
                        console.log(`Filtered out: ${title}`);
                        return;
                    }
                    seenUrls.add(item.link);
                    const relevance = this.calculateRelevance(title, description);
                    articles.push({
                        id: this.hashUrl(item.link),
                        title,
                        link: item.link,
                        source: source.name,
                        sourceId: source.id,
                        pubDate: new Date(item.pubDate || Date.now()),
                        description,
                        category: source.category,
                        relevanceScore: relevance,
                    });
                });
            }
            catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.error(`Failed to fetch from ${source.name}:`, errorMsg);
            }
        }
        // Sort by relevance, then by date
        return articles.sort((a, b) => b.relevanceScore - a.relevanceScore ||
            b.pubDate.getTime() - a.pubDate.getTime());
    }
    /**
     * Create unique ID from URL
     */
    hashUrl(url) {
        // Simple hash function for URL
        let hash = 0;
        for (let i = 0; i < url.length; i++) {
            const char = url.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return `article_${Math.abs(hash)}`;
    }
    /**
     * Update settings at runtime
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}
export default AstronomyNewsService;
