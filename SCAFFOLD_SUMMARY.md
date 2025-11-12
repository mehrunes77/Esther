# Esther Project Scaffold — Summary

## What Was Created

This scaffold establishes the complete architecture for **Esther**, an open-source desktop app bridging astrology and astronomy with real-time planet monitoring, astronomy-only news, and a retro UI.

### 📁 Directory Structure
```
esther/
├── frontend/src/              # React/Electron UI (retro-aesthetic)
├── backend/src/               # Node.js API (ephemeris, news, data)
├── .github/copilot-instructions.md  # AI agent guidance
├── README.md                  # Updated with new architecture
├── CONTRIBUTING.md            # Contributor guidelines
├── .env.example               # Environment configuration
├── frontend/package.json      # Frontend dependencies
├── backend/package.json       # Backend dependencies
└── package.json               # Monorepo root
```

## 🔑 Key Files & Their Purpose

### Backend Services
- **`backend/src/config/settings.ts`** — User-configurable update intervals (1–60 min) and data source preferences
- **`backend/src/services/news-filter.ts`** — Astronomy-only RSS feed filtering with relevance scoring
- **`backend/src/services/planetary-data.ts`** — Aggregates NASA/ESA/JPL data; includes mock data for instant startup
- **`backend/src/services/ephemeris.ts`** — Real-time planet positions via NASA JPL Horizons API

### Frontend Components
- **`frontend/src/components/SettingsPanel.tsx`** — Interactive settings panel with sliders for update intervals
- **`frontend/src/components/SettingsPanel.module.css`** — Retro-themed CSS (neon green on dark backgrounds)
- **`frontend/src/components/PlanetDashboard.tsx`** — Real-time planet position display

### Documentation
- **`.github/copilot-instructions.md`** — Complete AI agent guidance with architecture, patterns, data sources
- **`README.md`** — User-facing documentation with quick-start, architecture overview, development patterns
- **`CONTRIBUTING.md`** — Guidelines for adding news sources, planetary data, and new features

## 🎯 Key Design Decisions

### 1. **User-Configurable Update Intervals**
Settings are stored in `backend/src/config/settings.ts` with configurable ranges:
- **Planet positions**: 1–60 min (default 15 min)
- **News feeds**: 5–60 min (default 30 min)
- **Asteroid data**: 10–60 min (default 60 min)

The `SettingsPanel` component provides sliders in the UI.

### 2. **Astronomy-Only News Filtering**
`news-filter.ts` implements:
- **Keyword matching**: Titles (15 pts), descriptions (5 pts)
- **Exclusion list**: Blocks non-astronomy articles
- **Relevance scoring**: 0–100, sorts by score then date
- **Deduplication**: Hashes URLs to avoid duplicates

Keywords include: `planet`, `asteroid`, `comet`, `spacecraft`, `mission`, `discovery`, `exoplanet`, etc.

### 3. **Planetary Data from Public Sources**
No proprietary data. All sources are open/free:
- **NASA Planetary Fact Sheets** — https://nssdc.gsfc.nasa.gov/planetary/fact_sheet/
- **JPL Small-Body Database API** — https://ssd-api.jpl.nasa.gov/sbdb/
- **Minor Planet Center** — https://www.minorplanetcenter.net/
- **ESA Solar System Resources** — https://sci.esa.int/web/solar-system/

Mock NASA data in `getMockNASAData()` ensures instant startup.

### 4. **Electron Security**
- `nodeIntegration: false` — Renderer can't access Node APIs
- `sandbox: true` — Renderer runs in sandbox
- No `eval()` or dynamic code
- API keys stored in `.env` (git-ignored)

## 🚀 Next Steps to Run

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
cp .env.example .env.local
# Edit .env.local if you have NASA/ESA API keys (optional)

# 3. Start dev servers
npm run dev
# Or individually:
npm run dev:web   # Frontend
npm run dev:api   # Backend

# 4. Build for production
npm run build
```

## ✅ What's Included

- ✅ Configurable update intervals (Settings panel + backend config)
- ✅ Astronomy-only news filtering with relevance scoring
- ✅ Planetary/asteroid data from NASA, ESA, JPL (no proprietary sources)
- ✅ Real-time planet position fetching (NASA JPL Horizons)
- ✅ Retro-aesthetic UI (CSS + Electron)
- ✅ No user accounts or forums (local-only, open-source)
- ✅ Security hardened (Electron sandbox, no exposed credentials)
- ✅ Comprehensive documentation (README, CONTRIBUTING, copilot-instructions)
- ✅ Monorepo structure (frontend + backend + shared types)

## ⚠️ Not Yet Implemented (Phase 2+)

These are important but deferred to future phases:
- Birth chart calculator
- Transit/prediction charts
- Astrology aspects & houses
- Mobile app
- Advanced analytics

## 🔗 Key Data Sources

| Source | URL | Type | Auth |
|--------|-----|------|------|
| NASA Horizons | https://ssd.jpl.nasa.gov/api/horizons.api | Real-time ephemeris | None |
| NASA Fact Sheets | https://nssdc.gsfc.nasa.gov/planetary/fact_sheet/ | Planet profiles | None |
| JPL Small-Body DB | https://ssd-api.jpl.nasa.gov/sbdb/ | Asteroid data | None |
| NASA News | https://www.nasa.gov/news-and-events/feed/ | RSS | None |
| ESA News | https://www.esa.int/rssfeed.php | RSS | None |
| Space.com | https://www.space.com/xml/rss-feeds/astronomy.xml | RSS | None |
| ArXiv | https://arxiv.org/list/astro-ph/recent | RSS | None |

## 📋 AI Agent Guidance

See `.github/copilot-instructions.md` for:
- Complete architecture breakdown
- Common development patterns (fetch & cache, settings-driven updates, filtering)
- Security considerations
- How to add new data sources
- Testing guidelines

---

**Ready to contribute?** Check `CONTRIBUTING.md` for guidelines on adding features, fixing bugs, or enhancing data sources. 🌙✨
