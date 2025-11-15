<!-- .github/copilot-instructions.md -->
# Copilot / AI agent instructions for Esther

## Overview

**Esther** is an open-source web application (React + Node.js Express) that bridges astrology and astronomy. It provides real-time planetary monitoring via NASA JPL Horizons API, educational content, astronomy-only news feeds, and a retro-inspired dark UI. **No user accounts or databases**—purely educational and stateless.

## Critical Port Configuration

**NEVER change these ports without updating all references:**
- Backend API: **Port 5001** (configured in `/backend/.env.local` as `API_PORT=5001`)
- Frontend Dev Server: **Port 3001** (configured in `/frontend/vite.config.ts`)
- Frontend API Client: Hardcoded to `http://localhost:5001` in `/frontend/src/api/client.ts`

## Architecture & Key Files

### Directory Structure
```
esther/
├── frontend/src/
│   ├── components/
│   │   ├── PlanetDashboard.tsx    # Real-time planet positions & data
│   │   └── SettingsPanel.tsx       # Update interval & source configuration
│   ├── hooks/
│   ├── styles/                     # Retro CSS theme
│   └── App.tsx
├── backend/src/
│   ├── services/
│   │   ├── ephemeris.ts           # NASA JPL Horizons API integration
│   │   ├── news-filter.ts         # RSS feed filtering (astronomy-only)
│   │   ├── planetary-data.ts      # NASA/JPL/ESA data aggregation
│   │   └── scheduler.ts           # Configurable refresh jobs
│   ├── routes/
│   │   ├── planets.ts             # GET /api/planets/positions
│   │   ├── news.ts                # GET /api/news (filtered)
│   │   ├── settings.ts            # POST /api/settings
│   │   └── content.ts             # GET /api/content/{body}
│   ├── config/
│   │   └── settings.ts            # Settings schema & defaults
│   ├── models/                     # SQLite or in-memory storage
│   └── main.ts
├── tests/
├── .env.example
├── docker-compose.yml             # Local dev: PostgreSQL, Redis (optional)
├── package.json (monorepo)
└── README.md
```

## Core Services & Patterns

### 1. **Real-time Ephemeris** (`backend/src/services/ephemeris.ts`)
- **API**: NASA JPL Horizons (no auth required)
- **Data**: Planet positions (RA, Dec, distance, illumination)
- **Update Cadence**: User-configurable via Settings (1–60 min, default 15 min)
- **Pattern**: Fetch on interval, cache in memory, broadcast to frontend via IPC/WebSocket

### 2. **Astronomy News Filtering** (`backend/src/services/news-filter.ts`)
- **RSS Sources**: NASA, ESA, Space.com, ArXiv (all public, no auth)
- **Auto-filter**: Keywords (`planet`, `asteroid`, `comet`, `discovery`, etc.) + exclusion list
- **Relevance Score**: Title keywords = 15pts, description = 5pts (capped at 100)
- **Deduplication**: Hash URL to avoid duplicates across feeds
- **Update Cadence**: User-configurable (5–60 min, default 30 min)

### 3. **Planetary Data Aggregation** (`backend/src/services/planetary-data.ts`)
- **Sources**:
  - **NASA Fact Sheets** (HTML parser → structured data): https://nssdc.gsfc.nasa.gov/planetary/fact_sheet/
  - **JPL Small-Body DB** (JSON API): https://ssd-api.jpl.nasa.gov/sbdb.api (free, no auth)
  - **Minor Planet Center**: https://www.minorplanetcenter.net/ (open data)
- **Data Cached**: Mock NASA data in code for instant startup; fetch real data on schedule
- **Fallback**: If external API fails, use cached/mock data

### 4. **Settings & Configuration** (`backend/src/config/settings.ts`)
- **Stored Locally**: Electron app stores in `~/.esther/config.json` (SQLite optional for server mode)
- **Configurable Fields**:
  - `planetUpdateInterval`: 60,000–3,600,000ms (1–60 min)
  - `newsUpdateInterval`: 300,000–3,600,000ms (5–60 min)
  - `asteroidUpdateInterval`: 600,000–3,600,000ms (10–60 min)
  - `newsFiltering.enabled`: Boolean
  - `newsFiltering.sources[].enabled`: Per-source toggle
- **UI**: SettingsPanel component with sliders and checkboxes

## Security Considerations

- **No User Auth**: Open-source, no accounts → no password storage
- **No External Credentials Stored in Code**: All API keys in `.env.example` (git-ignored)
- **Content Delivery**: All data from trusted sources (NASA, ESA, JPL, ArXiv)
- **News Filtering**: Validates URLs and sanitizes RSS content before display
- **Electron Security**:
  - Preload script isolates main process from renderer
  - `nodeIntegration: false`, `sandbox: true`
  - No `eval()` or dynamic `require()`

## Development Workflow

### Starting the Application
```bash
# Option 1: Use startup script (recommended)
./start.sh

# Option 2: Manual (requires 2 terminals)
# Terminal 1 - Backend MUST start first
cd backend && node dist/main.js

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Making Code Changes

**Backend Changes:**
1. Edit files in `backend/src/`
2. Compile: `cd backend && npm run build`
3. Restart: Kill backend process and run `node dist/main.js`
4. **Important**: Backend uses CommonJS modules, not ES modules (tsconfig has `"module": "commonjs"`)

**Frontend Changes:**
- Edit files in `frontend/src/`
- Vite hot-reloads automatically (no restart needed)
- Changes appear instantly in browser

### TypeScript Configuration

**Backend (`backend/tsconfig.json`):**
- Uses `"module": "commonjs"` (NOT "ES2020")
- Uses `"type": "module"` is REMOVED from `package.json`
- Imports use NO file extensions: `import logger from './logger'` (not `'./logger.js'`)

**Frontend (`frontend/tsconfig.json`):**
- Standard React + TypeScript setup
- Uses Vite for bundling

### Build Process
```bash
# Build everything
npm run build

# Build individually
cd backend && npm run build   # Compiles TS to dist/
cd frontend && npm run build  # Vite production build
```

## Common Patterns

### Pattern 1: Fetch & Cache Cycle
```javascript
// scheduler runs every N ms (configurable)
async function refreshPlanets() {
  const data = await ephemerisService.getPlanetaryPosition('mars');
  cache.set('mars', data);
  broadcast({ type: 'PLANET_UPDATE', data }); // to frontend
}
```

### Pattern 2: Settings-Driven Updates
```javascript
// Settings panel calls this on save
async function updateSettings(newSettings) {
  config.update(newSettings);
  scheduler.reschedule(newSettings.planetUpdateInterval);
  // Trigger immediate refresh
  await refreshPlanets();
}
```

### Pattern 3: News Filtering
```javascript
const filtered = news.filter(article => {
  const text = `${article.title} ${article.description}`.toLowerCase();
  return keywords.some(k => text.includes(k)) && 
         !excludeKeywords.some(k => text.includes(k));
});
```

## Testing Guidelines

- **Unit**: Mock API calls (use `jest.mock()` for axios)
- **Integration**: Use real RSS feeds in `test` env; cache results to avoid rate limits
- **E2E**: Electron test runner to verify Settings → Refresh → Data Display flow

## Known Limitations & TODOs

- NASA Fact Sheets are HTML; consider parsing or finding their CSV/JSON exports for reliability
- JPL SBDB API has rate limits (check docs); implement request queuing if needed
- ArXiv RSS may include non-astronomy papers; consider keyword expansion
- Electron packaging for all platforms (currently tested on macOS)

## Merge & Update Guidance

When updating this file:
- Preserve data source URLs (they're accurate as of Nov 2025)
- Update API version numbers if services change
- Add new features to the Architecture section with service files and patterns
- Reference specific code files when documenting patterns
