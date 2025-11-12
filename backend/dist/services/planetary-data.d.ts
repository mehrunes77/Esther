/**
 * Planetary & Asteroid Data Service
 * Aggregates data from NASA, ESA, JPL, and Minor Planet Center (all open-source)
 */
export interface PlanetaryData {
    name: string;
    type: 'planet' | 'dwarf-planet' | 'moon' | 'asteroid';
    diameter: number;
    mass: string | number;
    orbitalPeriod: number;
    avgDistance: number;
    composition: string[];
    atmosphereComposition?: string[];
    temperature: {
        min: number;
        avg: number;
        max: number;
    };
    moons?: string[];
    discoveryDate?: string;
    imageUrl?: string;
    sourceUrl: string;
    lastUpdated: Date;
}
declare class PlanetaryDataService {
    private nasaFactSheetBase;
    private jplSbdbBase;
    private horizonsApi;
    /**
     * Fetch planetary data from NASA Fact Sheets (public domain)
     * Parser for: https://nssdc.gsfc.nasa.gov/planetary/fact_sheet/
     */
    fetchNASAFactSheets(): Promise<Record<string, PlanetaryData>>;
    /**
     * Fetch asteroid/small-body data from JPL Small-Body Database
     * https://ssd-api.jpl.nasa.gov/sbdb_query.html (free, no auth)
     */
    fetchJPLSmallBodyData(bodyName: string): Promise<PlanetaryData | null>;
    /**
     * Fetch real-time ephemeris (planet positions) from NASA JPL Horizons
     */
    fetchHorizonsData(bodyId: number): Promise<{
        ra: string;
        dec: string;
        distance: number;
        illumination: number;
    } | null>;
    /**
     * Mock NASA data for development (public domain, from NASA Fact Sheets)
     * In production, parse actual NASA Fact Sheet PDFs or use their official APIs
     */
    private getMockNASAData;
    /**
     * Get planet profile by name
     */
    getPlanetProfile(name: string): Promise<PlanetaryData | null>;
    /**
     * Get planets by category
     */
    getPlanetsByCategory(category: string): Promise<PlanetaryData[]>;
}
export default PlanetaryDataService;
