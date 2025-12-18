# Esther

**Esther** is an open-source, real-time astronomy data viewer built with Electron, React, and TypeScript. It fetches live planetary data from NASA JPL Horizons API and displays an interactive 3D solar system with custom planet models built in Blender. Features configurable refresh intervals, professional 3D visualizations, and educational astronomical data. Zero tracking, completely local, no AI.

**Key Features**:
- ✨ **Real-time 3D Solar System** — Beautiful Three.js visualization with custom Blender models
- 🛰️ **Live NASA Data** — Direct integration with NASA JPL Horizons API
- ⚙️ **Configurable Updates** — Set refresh intervals (1–60 minutes)
- 📚 **Educational Content** — Detailed planetary profiles and astronomical data
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
- **3D Solar System** — Interactive Three.js visualization with custom Blender planet models
- **Custom Planet Models** — Professional Blender GLB models for Jupiter, Saturn, Mercury, Uranus, Neptune
- **Configurable Update Intervals** — Choose refresh rates in Settings (1–60 minutes)
- **Educational Content** — Detailed planetary profiles from NASA, ESA, and JPL
- **Retro-inspired UI** — Clean, beautiful interface

## Project Structure

```
Esther/
├── .config/                    # Environment & Git configuration
│   ├── .env.example           # Example environment variables
│   ├── .gitignore             # Git ignore rules
│   ├── .gitattributes         # Git attributes
│   ├── .npmrc                 # NPM configuration
│   └── .nvmrc                 # Node version specification
│
├── config/                     # Build & dependency configuration
│   ├── electron-builder.json  # Electron packaging config (Windows/macOS/Linux)
│   ├── package-lock.json      # Locked dependency versions
│   ├── root-package.json      # Root monorepo package config
│   └── tsconfig.json          # TypeScript compiler settings
│
├── docs/                       # Comprehensive documentation
│   ├── DEPLOYMENT.md          # Build, test, release & troubleshoot guide
│   ├── GITHUB_ACTIONS.md      # CI/CD pipeline documentation
│   ├── SECURITY.md            # Security audit & practices
│   ├── PRIVACY.md             # Privacy policy & data practices
│   ├── INSTALLATION.md        # User installation guide
│   ├── CONTRIBUTING.md        # Development guidelines
│   └── SECURITY_AUDIT.md      # Detailed security findings
│
├── scripts/                    # Utility & startup scripts
│   ├── start.sh               # Start development servers
│   └── stop.sh                # Stop running servers
│
├── frontend/                   # React + Electron UI application
│   ├── src/
│   │   ├── components/        # React components (Planet Dashboard, 3D Viewer, Settings)
│   │   ├── api/               # API client for backend communication
│   │   ├── styles/            # CSS & styling (retro theme)
│   │   ├── types/             # TypeScript types & interfaces
│   │   └── utils/             # Helper functions (astrology, validation)
│   ├── public/                # Electron main process & preload script
│   ├── build/                 # Vite production build output
│   ├── dist/                  # Packaged Electron executables (.exe, .dmg)
│   ├── vite.config.ts         # Vite bundler configuration
│   └── package.json           # Frontend dependencies
│
├── backend/                    # Node.js Express API server
│   ├── src/
│   │   ├── main.ts            # Express app entry point
│   │   ├── services/          # Business logic
│   │   │   ├── ephemeris.ts  # NASA JPL Horizons API integration
│   │   │   ├── news-filter.ts # RSS feed filtering logic
│   │   │   ├── planetary-data.ts # Data aggregation
│   │   │   └── scheduler.ts   # Configurable update scheduling
│   │   ├── routes/            # API endpoints
│   │   │   ├── planets.ts     # GET /api/planets/positions
│   │   │   ├── news.ts        # GET /api/news (filtered)
│   │   │   └── settings.ts    # POST /api/settings (user config)
│   │   ├── middleware/        # Express middleware
│   │   │   └── security.ts    # Helmet.js security headers, CORS, validation
│   │   ├── config/            # Configuration schemas
│   │   │   └── settings.ts    # User settings defaults & validation
│   │   └── utils/             # Utility functions
│   │       ├── rate-limiter.ts # Request rate limiting
│   │       └── validation.ts   # Input validation helpers
│   ├── dist/                  # Compiled JavaScript output
│   ├── tsconfig.json          # TypeScript config (CommonJS)
│   └── package.json           # Backend dependencies
│
├── .github/                    # GitHub-specific configuration
│   ├── workflows/
│   │   └── build.yml          # CI/CD pipeline (auto-build on version tags)
│   └── copilot-instructions.md # AI coding guidelines
│
├── README.md                   # This file - project overview
└── LICENSE                     # MIT License

```

### Folder Purposes

| Folder | Purpose |
|--------|---------|
| **.config** | Environment & git configuration files (hidden) |
| **config** | Build configuration (electron-builder, tsconfig, package-lock) |
| **docs** | Complete documentation (guides, security, privacy, deployment) |
| **scripts** | Utility scripts for starting/stopping development environment |
| **frontend** | React + TypeScript UI (Vite bundler, Electron packaging, 3D visualization) |
| **backend** | Node.js Express API (NASA data fetching, news filtering, scheduling) |
| **.github** | GitHub Actions CI/CD workflows & GitHub-specific config |

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

