/**
 * PlanetDashboard - Real-time planet position display
 * 
 * Features:
 * - Fetches live planet positions from NASA JPL Horizons API
 * - Auto-refreshes based on user settings
 * - Planet cards with key data
 * - Click to open 3D viewer
 * - Loading and error states
 */

import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import PlanetViewer3D from './PlanetViewer3D';
import { calculateZodiacSign, calculateAspects } from '../utils/astrology';
import styles from './PlanetDashboard.module.css';

export interface PlanetPosition {
  name: string;
  rightAscension: number;
  declination: number;
  distance: number;
  illumination: number;
  magnitude: number;
  timestamp: string | Date;
}

export interface PlanetProfile {
  name: string;
  diameter: number;
  mass: string | number;
  orbitalPeriod: number;
  avgDistance: number;
  composition: string[];
  atmosphereComposition?: string[];
  temperature: { min: number; avg: number; max: number };
  moons?: string[];
  sourceUrl: string;
}

export function PlanetDashboard() {
  const [planets, setPlanets] = useState<PlanetPosition[]>([]);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [planetProfile, setPlanetProfile] = useState<PlanetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [aspects, setAspects] = useState<string[]>([]);

  // Fetch planet positions
  const fetchPlanets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching planets from API...');
      const positions = await apiClient.getPlanetPositions();
      console.log('Received planet positions:', positions);
      
      setPlanets(positions);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch planets:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to fetch planet data: ${errorMessage}. Check if backend is running on port 5001.`);
      setLoading(false);
    }
  };

  // Fetch planet profile when selected
  const fetchPlanetProfile = async (planetName: string) => {
    try {
      const profile = await apiClient.getPlanetProfile(planetName);
      setPlanetProfile(profile.profile);
    } catch (err) {
      console.error('Failed to fetch planet profile:', err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPlanets();

    // Auto-refresh every 15 minutes (900000ms)
    const interval = setInterval(fetchPlanets, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch profile when planet selected
  useEffect(() => {
    if (selectedPlanet) {
      fetchPlanetProfile(selectedPlanet);
    }
  }, [selectedPlanet]);

  const handlePlanetClick = (planetName: string) => {
    setSelectedPlanet(planetName);
  };

  const handleClose3D = () => {
    setSelectedPlanet(null);
    setPlanetProfile(null);
  };

  if (loading && planets.length === 0) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>loading planetary data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>connection error</h2>
        <p>{error}</p>
        <button onClick={fetchPlanets} className={styles.retryBtn}>
          retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <h1>planetary monitor</h1>
        <div className={styles.status}>
          <span className={styles.indicator}></span>
          <span>
            {lastUpdate
              ? `${lastUpdate.toLocaleTimeString()}`
              : 'connecting...'}
          </span>
          <button onClick={fetchPlanets} className={styles.refreshBtn}>
            refresh
          </button>
        </div>
      </div>

      {/* 3D Viewer Modal */}
      {selectedPlanet && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button onClick={handleClose3D} className={styles.closeBtn}>
              ✕
            </button>
            <PlanetViewer3D
              planetName={selectedPlanet}
              planetData={
                planetProfile
                  ? {
                      diameter: planetProfile.diameter,
                      distance: planetProfile.avgDistance,
                      temperature: planetProfile.temperature,
                      moons: planetProfile.moons,
                    }
                  : undefined
              }
              autoRotate={true}
            />
          </div>
        </div>
      )}

      {/* Planet Cards Grid */}
      <div className={styles.planetsGrid}>
        {planets.map((planet) => (
          <div
            key={planet.name}
            className={styles.card}
            onClick={() => handlePlanetClick(planet.name)}
          >
            <div className={styles.cardHeader}>
              <span className={styles.planetName}>{planet.name.toLowerCase()}</span>
              <span className={styles.planetType}>planet</span>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.dataRow}>
                <span className={styles.label}>ra</span>
                <span className={styles.value}>
                  {planet.rightAscension.toFixed(2)}°
                </span>
              </div>

              <div className={styles.dataRow}>
                <span className={styles.label}>dec</span>
                <span className={styles.value}>
                  {planet.declination.toFixed(2)}°
                </span>
              </div>

              <div className={styles.dataRow}>
                <span className={styles.label}>distance</span>
                <span className={styles.value}>
                  {planet.distance.toFixed(3)} au
                </span>
              </div>

              <div className={styles.dataRow}>
                <span className={styles.label}>zodiac</span>
                <span className={styles.value}>
                  {calculateZodiacSign(planet.rightAscension).zodiacSign}
                </span>
              </div>

              <div className={styles.dataRow}>
                <span className={styles.label}>element</span>
                <span className={styles.value}>
                  {calculateZodiacSign(planet.rightAscension).element}
                </span>
              </div>

              <div className={styles.dataRow}>
                <span className={styles.label}>magnitude</span>
                <span className={styles.value}>
                  {planet.magnitude.toFixed(1)}
                </span>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <button className={styles.view3DBtn}>
                view 3d
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className={styles.instructions}>
        <p>
          click any planet to view in 3d
        </p>
        <p>
          data updates every 15 minutes from nasa jpl horizons
        </p>
      </div>
    </div>
  );
}

export default PlanetDashboard;
