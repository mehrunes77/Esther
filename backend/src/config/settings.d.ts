/**
 * Application Settings & Configuration Schema
 * User-configurable settings for update intervals and data sources
 */
export interface AppSettings {
    planetUpdateInterval: number;
    newsUpdateInterval: number;
    asteroidUpdateInterval: number;
    dataSourcePreferences: {
        useJPLHorizons: boolean;
        useNASAFactSheets: boolean;
        useMinorPlanetCenter: boolean;
        useESAData: boolean;
    };
    newsFiltering: {
        enabled: boolean;
        keywords: string[];
        excludeKeywords: string[];
        sources: NewsSource[];
    };
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
export declare const DEFAULT_SETTINGS: AppSettings;
export declare const SETTING_RANGES: {
    planetUpdateInterval: {
        min: number;
        max: number;
        step: number;
    };
    newsUpdateInterval: {
        min: number;
        max: number;
        step: number;
    };
    asteroidUpdateInterval: {
        min: number;
        max: number;
        step: number;
    };
};
