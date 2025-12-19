# Esther

**Esther** is an open-source, real-time astronomy data viewer built with Electron, React, and TypeScript. It fetches live planetary data from NASA JPL Horizons API and displays an interactive 3D solar system with custom planet models built in Blender. Features configurable refresh intervals, professional 3D visualizations, and educational astronomical data. Zero tracking, completely local, no AI.

**Key Features**:
- ✨ **Real-time 3D Solar System** — Beautiful Three.js visualization with custom Blender models
- 🛰️ **Live NASA Data** — Direct integration with NASA JPL Horizons API
- ⚙️ **Configurable Updates** — Set refresh intervals (1–60 minutes)
- 📚 **Educational Content** — Detailed planetary profiles and astronomical data
- 🔒 **Zero Tracking** — Fully privacy-first, no analytics or telemetry
- 🖥️ **Desktop & Web** — Works as Electron app (EXE/DMG/AppImage) or web app (COMING SOON)🟡

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

~### Quick Start (Pre-built)~

~Download for your system from [Releases](https://github.com/mehrunes77/Esther/releases):~

~- **Windows**: `Esther-x.x.x.exe` or `-portable.exe`~
~- **macOS**: `Esther-x.x.x.dmg`~
~- **Linux**: `Esther-x.x.x.AppImage`~

### Build 

```bash

# Clone repository
git clone https://github.com/mehrunes77/Esther.git
cd Esther

# Install dependencies (includes all needed packages)
npm install
(if you run into issues only install essentials)

# Start the program
/.start.sh
# to stop the program
/.stop.sh

```

See `INSTALLATION.md` for full instructions.

## IMPORTANT

- *** Frontend runs on https://localhost:5001
- *** Backend runs on https://localhost:3001
- If you have any issues, usually its because something else is running on either of this ports.
- When you run the /.start.sh script, cmd+click on https://localhost:5001 to access the webpage.
- Ta da~

### Folder Purposes

| Folder | Purpose |
|--------|---------|
| **.config** | Environment & git configuration files (hidden) |
| **config** | Build configuration metadata (node_modules index) |
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

### Prerequisites

- **Node.js**: v20.11.0 or later (includes npm)
- **Git**: For cloning the repository


## Security

**Esther is security-first:**

- ✅ Input validation on all endpoints
- ✅ SSRF protection (blocks private IPs)
- ✅ XSS protection via DOMPurify (COMING SOON)🟡
- ✅ Security headers (Helmet.js) (COMING SOON)🟡
- ✅ Content Security Policy
- ✅ Electron sandbox enabled (COMING SOON)🟡
- ✅ No sensitive data collection
- ✅ All dependencies audited and current 

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


## Contributing

Contributions welcome! Areas of focus:

- 🎨 UI/UX improvements (retro aesthetic)
- 🛰️ Additional data sources
- 📱 Mobile support
- 🧪 Additional tests
- 📚 Documentation
- 🐛 Bug fixes

**Not accepted**: user accounts, tracking/analytics, proprietary data, cryptocurrency features


~## Documentation~ (COMING SOON)

~- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — Build, test, release & troubleshoot guide~
~- **[docs/GITHUB_ACTIONS.md](docs/GITHUB_ACTIONS.md)** — CI/CD pipeline detailed documentation~
~- **[docs/SECURITY.md](docs/SECURITY.md)** — Security audit and responsible disclosure~
~- **[docs/PRIVACY.md](docs/PRIVACY.md)** — Privacy policy and data practices~
~- **[docs/INSTALLATION.md](docs/INSTALLATION.md)** — User installation guide~
~- **[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)** — Development guidelines~
~- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** — AI coding standards~

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

