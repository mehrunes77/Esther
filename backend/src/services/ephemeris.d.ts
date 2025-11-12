export interface PlanetPosition {
    name: string;
    rightAscension: number;
    declination: number;
    distance: number;
    illumination: number;
    magnitude: number;
    timestamp: Date;
}
/**
 * EphemerisService - Real-time planetary position calculations
 * Uses NASA JPL Horizons API for accurate planetary ephemeris data
 */
export default class EphemerisService {
    private horizonsBase;
    private planets;
    private cache;
    private cacheTimeout;
    /**
     * Get real-time position of a single planet
     */
    getPlanetaryPosition(bodyName: string): Promise<PlanetPosition | null>;
    /**
     * Get real-time positions of all major planets
     */
    getAllPlanetPositions(): Promise<PlanetPosition[]>;
    /**
     * Fetch ephemeris data from NASA JPL Horizons API
     * Returns mock data in development or on API failure
     */
    private fetchFromHorizons;
    /**
     * Get mock ephemeris data (for development/fallback)
     */
    private getMockPosition;
    /**
     * Clear cache (useful for testing/forcing refresh)
     */
    clearCache(): void;
}
