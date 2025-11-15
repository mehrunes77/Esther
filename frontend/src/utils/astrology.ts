/**
 * Tropical Astrology Calculations
 * Based on live astronomical data (RA/Dec to zodiac signs)
 */

export interface AstrologicalData {
  zodiacSign: string;
  zodiacDegree: number;
  element: string;
  modality: string;
  rulingPlanet: string;
}

const ZODIAC_SIGNS = [
  { name: 'aries', symbol: '♈', start: 0, element: 'fire', modality: 'cardinal', ruler: 'mars' },
  { name: 'taurus', symbol: '♉', start: 30, element: 'earth', modality: 'fixed', ruler: 'venus' },
  { name: 'gemini', symbol: '♊', start: 60, element: 'air', modality: 'mutable', ruler: 'mercury' },
  { name: 'cancer', symbol: '♋', start: 90, element: 'water', modality: 'cardinal', ruler: 'moon' },
  { name: 'leo', symbol: '♌', start: 120, element: 'fire', modality: 'fixed', ruler: 'sun' },
  { name: 'virgo', symbol: '♍', start: 150, element: 'earth', modality: 'mutable', ruler: 'mercury' },
  { name: 'libra', symbol: '♎', start: 180, element: 'air', modality: 'cardinal', ruler: 'venus' },
  { name: 'scorpio', symbol: '♏', start: 210, element: 'water', modality: 'fixed', ruler: 'pluto' },
  { name: 'sagittarius', symbol: '♐', start: 240, element: 'fire', modality: 'mutable', ruler: 'jupiter' },
  { name: 'capricorn', symbol: '♑', start: 270, element: 'earth', modality: 'cardinal', ruler: 'saturn' },
  { name: 'aquarius', symbol: '♒', start: 300, element: 'air', modality: 'fixed', ruler: 'uranus' },
  { name: 'pisces', symbol: '♓', start: 330, element: 'water', modality: 'mutable', ruler: 'neptune' },
];

/**
 * Convert Right Ascension to Ecliptic Longitude (tropical zodiac)
 * RA is in degrees (0-360)
 */
export function calculateZodiacSign(rightAscension: number): AstrologicalData {
  // Convert RA to ecliptic longitude (simplified tropical calculation)
  // In tropical system, 0° Aries = Spring Equinox ≈ RA 0°
  let longitude = rightAscension % 360;
  if (longitude < 0) longitude += 360;

  // Find zodiac sign
  const sign = ZODIAC_SIGNS.find((s, i) => {
    const nextStart = ZODIAC_SIGNS[(i + 1) % 12].start;
    return longitude >= s.start && longitude < (nextStart === 0 ? 360 : nextStart);
  }) || ZODIAC_SIGNS[0];

  const degreeInSign = longitude - sign.start;

  return {
    zodiacSign: `${sign.symbol} ${sign.name}`,
    zodiacDegree: parseFloat(degreeInSign.toFixed(2)),
    element: sign.element,
    modality: sign.modality,
    rulingPlanet: sign.ruler,
  };
}

/**
 * Calculate planetary aspects (angles between planets)
 */
export function calculateAspects(planets: { name: string; ra: number }[]): string[] {
  const aspects = [];
  const ASPECT_ORBS = [
    { name: 'conjunction', angle: 0, orb: 8, symbol: '☌' },
    { name: 'opposition', angle: 180, orb: 8, symbol: '☍' },
    { name: 'trine', angle: 120, orb: 8, symbol: '△' },
    { name: 'square', angle: 90, orb: 7, symbol: '□' },
    { name: 'sextile', angle: 60, orb: 6, symbol: '⚹' },
  ];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const diff = Math.abs(planets[i].ra - planets[j].ra) % 360;
      const angle = Math.min(diff, 360 - diff);

      for (const aspect of ASPECT_ORBS) {
        if (Math.abs(angle - aspect.angle) <= aspect.orb) {
          aspects.push(
            `${planets[i].name} ${aspect.symbol} ${planets[j].name} (${aspect.name})`
          );
        }
      }
    }
  }

  return aspects;
}
