# Esther

**Esther** is an open-source, real-time astronomy data viewer built with Electron, React, and TypeScript. It fetches live planetary data from NASA JPL Horizons API and renders an interactive 3D solar system. Features configurable refresh intervals, professional 3D planet models, and astronomy news filtering from NASA, ESA, and arXiv. Zero tracking, completely local, no AI.

**Key Features**:
- ✨ **Real-time 3D Solar System** — Beautiful Three.js visualization with accurate planetary positions
- 🛰️ **Live NASA Data** — Direct integration with NASA JPL Horizons API
- 📰 **Astronomy News** — Auto-filtered from NASA, ESA, and arXiv
- ⚙️ **Configurable Updates** — Set refresh intervals (1–60 minutes)
- 🔒 **Zero Tracking** — Fully privacy-first, no analytics or telemetry
- 🖥️ **Desktop & Web** — Works as Electron app (EXE/DMG/AppImage) or web app

## Privacy First

✅ **This app collects ZERO personal data**

- No user accounts
- No cloud sync
- No telemetry
- No tracking
- Everything runs locally
- Open source (audit the code)

See `PRIVACY.md` for details.

## Installation

### Quick Start (Pre-built)

Download for your system from [Releases](https://github.com/mehrunes77/Esther/releases):

- **Windows**: `Esther-x.x.x.exe` or `-portable.exe`
- **macOS**: `Esther-x.x.x.dmg`
- **Linux**: `Esther-x.x.x.AppImage`

See `INSTALLATION.md` for detailed setup instructions.

### Fork & Build

Fork this repository, and GitHub Actions automatically builds executables for Windows, macOS, and Linux when you push version tags:

```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

GitHub Actions will automatically:
- Build for all three platforms
- Create executables in `dist/`
- Upload to your releases page

Your followers can then download pre-built versions directly.

### Build from Source

```bash
# Clone repository
git clone https://github.com/mehrunes77/Esther.git
cd Esther

# Install dependencies (includes all needed packages)
npm install

# Build for your OS
npm run build:electron:win    # Windows
npm run build:electron:mac    # macOS
npm run build:electron:linux  # Linux

# Output in dist/ folder
```

See `INSTALLATION.md` for full instructions.

## Features

- **Real-time Planet Monitoring** — Live orbital positions from NASA JPL Horizons
- **3D Solar System** — Interactive Three.js visualization with proper lighting and shadows
- **Professional Planet Models** — Blender GLB models for Jupiter, Saturn, Mercury, Uranus, Neptune
- **Configurable Update Intervals** — Choose refresh rates in Settings (1–60 minutes)
- **Educational Content** — Detailed planetary profiles from NASA, ESA, and JPL
- **Astronomy-only News** — Auto-filtered feeds from NASA, ESA, and arXiv
- **Retro-inspired UI** — Clean, beautiful interface

## Architecture

```
Esther (Desktop App)
├── Frontend (React + Three.js + Electron)
│   ├── PlanetDashboard.tsx          # Planet data display
│   ├── SolarSystemViewer.tsx        # 3D visualization
│   └── SettingsPanel.tsx            # Configuration UI
├── Backend (Node.js + Express)
│   ├── /api/planets/positions       # Real-time data
│   ├── /api/news                    # Filtered news
│   └── /api/settings                # User settings
└── External APIs (Direct calls)
    ├── NASA JPL Horizons            # Planet positions
    ├── NASA Fact Sheets             # Planet data
    ├── ESA Data Portal              # Space data
    └── RSS Feeds (NASA, ESA, arXiv) # News
```

## Data Sources

### Real-time Ephemeris
- **NASA JPL Horizons API** — Precise planetary positions
- No authentication required
- Cached locally for 5 minutes
- User-configurable update interval (default: 15 min)

### Planetary Data
- **NASA Planetary Fact Sheets** — https://nssdc.gsfc.nasa.gov/planetary/fact_sheet/
- **JPL Small-Body Database** — https://ssd-api.jpl.nasa.gov/sbdb/ (asteroids)
- **ESA Resources** — https://sci.esa.int/web/solar-system/

### News Feeds
- **NASA News** — https://www.nasa.gov/feed/
- **ESA News** — https://www.esa.int/rssfeed.xml
- **arXiv Astronomy** — https://arxiv.org/rss/astro-ph

**Auto-filter keywords**: planet, asteroid, comet, spacecraft, mission, discovery, solar system, exoplanet, NASA, ESA, JPL

## Quick Start

### Prerequisites

- **Node.js**: v20.11.0 or later (includes npm)
- **Git**: For cloning the repository

### Development Setup

```bash
# Clone and install
git clone https://github.com/mehrunes77/Esther.git
cd Esther
npm install

# Configure (optional - defaults work)
cp .env.example .env.local

# Start development servers
npm run dev

# In another terminal, start backend
cd backend && npm run build && npm run dev

# Frontend opens at http://localhost:3001
```

### Build Desktop App

```bash
# Build for your OS
npm run build:electron:win     # Windows EXE
npm run build:electron:mac     # macOS DMG
npm run build:electron:linux   # Linux AppImage

# Find built app in dist/ folder
```

See `INSTALLATION.md` for detailed instructions.

## Security

**Esther is security-first:**

- ✅ Input validation on all endpoints
- ✅ SSRF protection (blocks private IPs)
- ✅ XSS protection via DOMPurify
- ✅ Security headers (Helmet.js)
- ✅ Content Security Policy
- ✅ Electron sandbox enabled
- ✅ No sensitive data collection
- ✅ All dependencies audited and current

See `SECURITY.md` for full security audit and responsible disclosure process.

## System Requirements

### Minimum
- Windows 7+, macOS 10.13+, or Ubuntu 16.04+
- 2 GB RAM
- 500 MB disk space
- Integrated graphics (OpenGL 2.0+)
- Internet connection

### Recommended
- Windows 10+, macOS 11+, or Ubuntu 20.04+
- 4 GB+ RAM
- SSD
- Modern CPU/GPU

## Troubleshooting

### Port Already in Use
```bash
# Use different port
API_PORT=5002 npm run dev
```

### Can't Connect to Backend
```bash
# Check if backend is running
curl http://localhost:5001/health

# Check your .env.local configuration
cat .env.local | grep API_PORT
```

### Slow 3D Rendering
- Update GPU drivers
- Lower graphics settings
- Close other applications
- Check CPU/GPU usage

See `INSTALLATION.md` for more troubleshooting.

## Building & Testing

```bash
# Install all dependencies
npm install

# Compile TypeScript
npm run build

# Run tests
npm run test

# Development with hot-reload
npm run dev

# Build for production
npm run build:web

# Build desktop apps
npm run build:electron:all
```

## Project Structure

```
esther/
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── api/             # API client
│   │   └── styles/          # CSS
│   ├── package.json
│   └── vite.config.ts       # Build config
├── backend/
│   ├── src/
│   │   ├── services/        # API services
│   │   ├── routes/          # API endpoints
│   │   └── utils/           # Helpers
│   ├── package.json
│   └── tsconfig.json
├── package.json             # Root (monorepo)
├── SECURITY.md             # Security audit
├── PRIVACY.md              # Privacy policy
├── INSTALLATION.md         # Setup guide
└── README.md               # This file
```

## Contributing

Contributions welcome! Areas of focus:

- 🎨 UI/UX improvements (retro aesthetic)
- 🛰️ Additional data sources
- 📱 Mobile support
- 🧪 Additional tests
- 📚 Documentation
- 🐛 Bug fixes

**Not accepted**: user accounts, tracking/analytics, proprietary data, cryptocurrency features

See `CONTRIBUTING.md` for guidelines.

## Documentation

- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — Build, test, release & troubleshoot guide
- **[docs/GITHUB_ACTIONS.md](docs/GITHUB_ACTIONS.md)** — CI/CD pipeline detailed documentation
- **[docs/SECURITY.md](docs/SECURITY.md)** — Security audit and responsible disclosure
- **[docs/PRIVACY.md](docs/PRIVACY.md)** — Privacy policy and data practices
- **[docs/INSTALLATION.md](docs/INSTALLATION.md)** — User installation guide
- **[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)** — Development guidelines
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** — AI coding standards

## License

MIT - See `LICENSE` file

## Support

- 📖 **Documentation**: See `INSTALLATION.md` and `SECURITY.md`
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/mehrunes77/Esther/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/mehrunes77/Esther/discussions)
- 🔒 **Security Issues**: See `SECURITY.md` for responsible disclosure

## Acknowledgments

- **NASA JPL Horizons** for real-time ephemeris data
- **NASA, ESA, arXiv** for public data and news
- **Three.js** for 3D rendering
- **React** and **Electron** for the framework

---

**Made with 🌙 by developers who believe astronomy should be accessible, scientific, and privacy-first.**

Check out `PRIVACY.md` to see exactly what data we do (and don't) collect.

