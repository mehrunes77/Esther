# Esther

**Esther** is an open-source desktop application (Electron + React) that bridges astrology and astronomy. It provides real-time planetary monitoring, educational content from NASA/ESA/JPL, astronomy-only news feeds, and a retro-inspired UI.

## Features

- **Real-time Planet Monitoring** — Live orbital data, positions, and ephemeris calculations
- **Configurable Update Intervals** — Choose refresh rates in Settings (1–60 minutes)
- **Educational Content** — Detailed planetary & asteroid profiles from NASA, ESA, and JPL databases
- **Astronomy-only News** — Auto-filtered space discoveries from verified scientific sources
- **Retro-inspired UI** — Clean, navigable interface with vintage aesthetic

## Architecture

```
esther/
├── frontend/src/          # Electron + React UI
│   ├── components/
│   │   ├── PlanetDashboard.tsx      # Real-time planet positions
│   │   └── SettingsPanel.tsx         # User configurable settings
│   └── styles/            # Retro CSS theme
├── backend/src/           # Node.js API server
│   ├── services/
│   │   ├── ephemeris.ts             # NASA JPL Horizons API
│   │   ├── news-filter.ts           # Astronomy-only feed filtering
│   │   ├── planetary-data.ts        # NASA/ESA/JPL data aggregation
│   │   └── scheduler.ts             # Configurable refresh jobs
│   └── config/
│       └── settings.ts              # Settings schema & defaults
├── tests/                 # Jest tests
├── .env.example           # Environment variables
├── docker-compose.yml     # Local dev (PostgreSQL, Redis optional)
└── package.json           # Monorepo
```

## Data Sources & Integration

### Real-time Ephemeris
- **NASA JPL Horizons API** — Precise planetary positions (no auth required)
- User-configurable update: 1–60 min (default 15 min)

### Planetary & Asteroid Profiles
- **NASA Planetary Fact Sheets** — https://nssdc.gsfc.nasa.gov/planetary/fact_sheet/
- **JPL Small-Body Database** — https://ssd-api.jpl.nasa.gov/sbdb/
- **Minor Planet Center** — https://www.minorplanetcenter.net/
- **ESA Solar System Resources** — https://sci.esa.int/web/solar-system/

### Astronomy News (Auto-filtered)
- **NASA News** — https://www.nasa.gov/news-and-events/feed/
- **ESA News** — https://www.esa.int/rssfeed.php
- **Space.com Astronomy** — https://www.space.com/xml/rss-feeds/astronomy.xml
- **ArXiv Astronomy** — https://arxiv.org/list/astro-ph/recent

**Auto-filter keywords**: planet, asteroid, comet, spacecraft, mission, discovery, solar system, exoplanet, moon, NASA, ESA, JPL, astronomy

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Local Development
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Start dev servers (Electron + backend)
npm run dev

# Or run individually:
npm run dev:web    # Frontend at http://localhost:3000
npm run dev:api    # Backend API at http://localhost:5000
```

### Build
```bash
npm run build       # Packages Electron app
```

### Testing
```bash
npm run test        # Run all tests
npm run test:watch  # Watch mode
```

## Development Patterns

### 1. Real-time Data Refresh
Settings control update intervals via `SettingsPanel.tsx`. The scheduler reschedules based on user input:

```typescript
// backend/src/config/settings.ts
planetUpdateInterval: 60_000 - 3_600_000 ms  // 1 min - 60 min
newsUpdateInterval: 300_000 - 3_600_000 ms   // 5 min - 60 min
```

### 2. News Filtering
Automatically filters RSS feeds for astronomy-only content via relevance scoring:

```typescript
// backend/src/services/news-filter.ts
- Title keywords: 15 points each
- Description keywords: 5 points each
- Exclusion keywords: blocks article
- Result: relevance score (0-100)
```

### 3. Planetary Data Fallback
Uses mock NASA data on startup, fetches real data asynchronously:

```typescript
// backend/src/services/planetary-data.ts
getMockNASAData()        // Instant startup
fetchNASAFactSheets()    // Async updates
fetchJPLSmallBodyData()  // Asteroid data
fetchHorizonsData()      // Real-time positions
```

## Security

- **No User Accounts** — Open-source, local-only application
- **No Credentials in Code** — API keys in `.env` (git-ignored)
- **Trusted Data Sources** — NASA, ESA, JPL only
- **Electron Hardening**:
  - `nodeIntegration: false`
  - `sandbox: true`
  - No `eval()` or dynamic code

## Adding New Features

### New News Source
1. Add to `DEFAULT_SETTINGS.newsFiltering.sources` in `backend/src/config/settings.ts`
2. Test filtering in `backend/src/services/news-filter.ts`
3. Add unit test in `tests/news-filter.test.ts`

### New Planetary Data
1. Source from NASA, ESA, or JPL (public domain)
2. Add to `getMockNASAData()` in `backend/src/services/planetary-data.ts`
3. Include source URLs and timestamps

See `CONTRIBUTING.md` for detailed guidelines.

## Contributing

Contributions welcome! Focus areas:
- Real-time data improvements
- UI/UX enhancements (retro aesthetic)
- News source expansion
- Testing & documentation
- Performance optimization

**Not accepted**: user accounts, social features, proprietary data, blockchain/crypto integrations.

## License

MIT. See `LICENSE` file.

## Questions?

Open an issue or check `CONTRIBUTING.md` for guidelines.

---

**Let's make astrology scientific and accessible.** 🌙✨
