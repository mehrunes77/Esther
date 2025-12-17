# Installation & Setup Guide

**Esther** - Real-time Astronomy Data Viewer

This is a desktop application that visualizes real-time astronomical data from NASA's JPL Horizons API. It is NOT an AI-powered application.

## Table of Contents

1. [Quick Start (Pre-built)](#quick-start-pre-built)
2. [System Requirements](#system-requirements)
3. [Installation Options](#installation-options)
4. [Building from Source](#building-from-source)
5. [Configuration](#configuration)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start (Pre-built)

### Download

Get the latest release for your system:

- **Windows**: `Esther-x.x.x.exe` (installer) or `-portable.exe` (no installation)
- **macOS**: `Esther-x.x.x.dmg` (drag-to-install)
- **Linux**: `Esther-x.x.x.AppImage` (executable) or `.deb` (Debian-based)

### Install & Run

#### Windows
1. Download `Esther-x.x.x.exe`
2. Run the installer (admin rights may be needed)
3. Follow prompts
4. Application appears in Start Menu
5. Click "Esther" to launch

**Alternative (Portable)**:
1. Download `Esther-x.x.x-portable.exe`
2. Run directly - no installation needed
3. No admin rights required

#### macOS
1. Download `Esther-x.x.x.dmg`
2. Double-click to open
3. Drag "Esther" to the Applications folder
4. Go to Applications folder and double-click "Esther"
5. Approve security prompt if needed

#### Linux
**AppImage (Universal)**:
```bash
chmod +x Esther-x.x.x.AppImage
./Esther-x.x.x.AppImage
```

**Debian/Ubuntu**:
```bash
sudo apt install ./Esther-x.x.x.deb
esther  # Run from terminal
```

**Fedora/RHEL** (convert from deb):
```bash
sudo dnf install alien
sudo alien -r ./Esther-x.x.x.deb
sudo rpm -i esther-*.rpm
esther
```

---

## System Requirements

### Minimum

| Component | Requirement |
|-----------|-------------|
| **OS** | Windows 7+, macOS 10.13+, Linux (Ubuntu 16.04+) |
| **RAM** | 2 GB |
| **Disk** | 500 MB available space |
| **CPU** | Intel i5 / AMD Ryzen 5 or equivalent |
| **GPU** | Integrated graphics (OpenGL 2.0+) |
| **Network** | Internet connection (for NASA data) |

### Recommended

| Component | Recommendation |
|-----------|---|
| **OS** | Windows 10+, macOS 11+, Ubuntu 20.04+ |
| **RAM** | 4 GB+ |
| **Disk** | SSD (faster load times) |
| **CPU** | Modern multi-core processor |
| **GPU** | Dedicated graphics (NVIDIA/AMD) |
| **Network** | Broadband connection |

### Offline Mode

Esther works **partially offline** after initial data load:
- ✅ View planets you've already loaded
- ✅ Browse previously fetched news
- ❌ Cannot update planet positions
- ❌ Cannot fetch new news articles

**Internet Required For**:
- Real-time planetary positions (NASA JPL API)
- Fresh news articles (RSS feeds)
- Initial app startup

---

## Installation Options

### Option 1: Pre-built Binaries (Recommended)

**Pros**:
- ✅ No programming knowledge needed
- ✅ Fastest setup (5 minutes)
- ✅ Automatic updates available
- ✅ Fully tested and verified

**Cons**:
- ❌ Cannot modify source code
- ❌ Limited to released versions

**Get Started**: Download from [Releases Page](https://github.com/mehrunes77/Esther/releases)

---

### Option 2: Docker (Advanced)

```bash
docker run -p 3001:3001 -p 5001:5001 mehrunes77/esther:latest
```

Then open browser to `http://localhost:3001`

**Pros**:
- ✅ Isolated environment
- ✅ Easy deployment
- ✅ Cross-platform

**Cons**:
- ❌ Requires Docker
- ❌ Not a native app (runs in container)

---

### Option 3: Build from Source (Developers)

See [Building from Source](#building-from-source) section below.

---

## Building from Source

### Prerequisites

Install these first:

1. **Node.js** (v20.11.0 or later)
   - [Download](https://nodejs.org/) or use package manager
   - Verify: `node --version` (should be v20+)

2. **Git**
   - [Download](https://git-scm.com/) or use package manager
   - Verify: `git --version`

3. **Build Tools** (per OS)

   **Windows**:
   - Visual Studio Build Tools or Visual C++ redistributable
   - npm install -g windows-build-tools

   **macOS**:
   - Xcode Command Line Tools: `xcode-select --install`

   **Linux**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install build-essential python3

   # Fedora
   sudo dnf install gcc-c++ make python3
   ```

### Step 1: Clone Repository

```bash
git clone https://github.com/mehrunes77/Esther.git
cd Esther
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
npm install

# This installs:
# - Backend dependencies (Express, Axios, etc.)
# - Frontend dependencies (React, Three.js, etc.)
# - Dev tools (TypeScript, Vite, Electron-builder)
```

### Step 3: Configure Environment

```bash
# Create environment file from template
cp .env.example .env.local

# Edit .env.local (optional - defaults work fine)
nano .env.local
```

**Default Config**:
- Backend API: `http://localhost:5001`
- Frontend: `http://localhost:3001`
- NASA API: Uses free DEMO_KEY

### Step 4a: Run Development Mode

```bash
# Terminal 1: Backend
cd backend
npm run build  # Compile TypeScript
npm run dev    # Start backend server

# Terminal 2: Frontend  
cd frontend
npm run dev    # Start Vite dev server (opens at localhost:3001)
```

Then open `http://localhost:3001` in browser.

### Step 4b: Build Desktop App (EXE/DMG/AppImage)

```bash
# From root directory
npm run build

# Then for your OS:

# Windows
npm run build:electron:win

# macOS
npm run build:electron:mac

# Linux
npm run build:electron:linux

# All platforms (requires cross-compilation setup)
npm run build:electron:all
```

**Output locations**:
- Windows: `dist/Esther-x.x.x.exe` (and portable)
- macOS: `dist/Esther-x.x.x.dmg`
- Linux: `dist/Esther-x.x.x.AppImage`

### Step 5: Run Built App

Double-click the executable in `dist/` folder, or:

```bash
# Windows
./dist/Esther-x.x.x.exe

# macOS
open dist/Esther-x.x.x.dmg

# Linux
chmod +x dist/Esther-x.x.x.AppImage
./dist/Esther-x.x.x.AppImage
```

---

## Configuration

### Environment Variables

Edit `.env.local` to customize:

```bash
# Backend port (default: 5001)
API_PORT=5001

# NASA API (optional - DEMO_KEY works)
NASA_API_KEY=DEMO_KEY

# Update intervals (milliseconds)
PLANET_UPDATE_INTERVAL=900000      # 15 minutes
NEWS_UPDATE_INTERVAL=1800000       # 30 minutes
ASTEROID_UPDATE_INTERVAL=3600000   # 1 hour

# News filtering
NEWS_FILTERING_ENABLED=true
NEWS_MIN_RELEVANCE_SCORE=30

# Logging
LOG_LEVEL=info
```

### In-App Settings

Once running, adjust via Settings Panel:
- Planet update interval
- News update interval
- Enable/disable news sources
- News relevance threshold

Changes saved locally (no cloud sync).

---

## Troubleshooting

### "Port Already in Use"

If you get `EADDRINUSE: address already in use :::5001`:

```bash
# Find process using port
lsof -i :5001          # macOS/Linux
netstat -ano | findstr 5001  # Windows

# Kill the process
kill <PID>             # macOS/Linux
taskkill /PID <PID> /F # Windows

# Or use different port
API_PORT=5002 npm run dev
```

### "Cannot Connect to Backend"

1. Verify backend is running (should see logs)
2. Check port isn't blocked by firewall
3. Verify `.env.local` has correct `API_PORT`
4. Try `curl http://localhost:5001/health`

### "App Won't Start on Linux"

Missing runtime libraries:

```bash
# Ubuntu/Debian
sudo apt-get install libnss3 libxss1 libappindicator3-1 libindicator7

# Fedora
sudo dnf install libappindicator-gtk3 libnotify
```

### "Slow 3D Rendering"

1. Lower graphics settings if available
2. Check GPU drivers are updated
3. Close other applications
4. Try different browser (if web version)

### "NASA API Rate Limited"

If getting `429 Too Many Requests`:

1. Increase update interval in settings
2. Wait 1 hour (rate limit resets)
3. Get your own API key at https://api.nasa.gov
4. Add to `.env.local`: `NASA_API_KEY=your_key_here`

### "No News Articles Showing"

1. Check internet connection
2. Verify news sources in settings
3. Try lowering NEWS_MIN_RELEVANCE_SCORE
4. Check logs for RSS feed errors

---

## Uninstalling

### Windows
- Control Panel → Programs → Programs and Features → Esther → Uninstall

### macOS
- Drag Esther from Applications to Trash

### Linux (AppImage)
- Delete the `.AppImage` file

### Linux (Debian)
```bash
sudo apt remove esther
```

### Remove Local Data
```bash
# Delete all saved settings
rm -rf ~/.esther    # macOS/Linux
rmdir /s %APPDATA%\.esther  # Windows
```

---

## Next Steps

1. **Read SECURITY.md** - Understand privacy & security
2. **Read PRIVACY.md** - Learn about data practices
3. **Explore Settings** - Customize update intervals & preferences
4. **Report Issues** - GitHub Issues (non-security)
5. **Report Security Issues** - See SECURITY.md

---

## System Architecture

### Components

```
Esther (App)
├── Frontend (React + Three.js)
│   ├── PlanetDashboard
│   ├── SolarSystemViewer (3D)
│   └── SettingsPanel
├── Backend (Node.js + Express)
│   ├── /api/planets/positions
│   ├── /api/news
│   └── /api/settings
└── External APIs
    ├── NASA JPL Horizons (planets)
    ├── ESA Data Portal
    └── RSS Feeds (news)
```

### Data Flow

```
User → Esther App → Backend Server → NASA/ESA APIs → Displayed in UI
                 ↓
            (Local Cache)
```

---

## Getting Help

- **Documentation**: See README.md for overview
- **Issues**: [GitHub Issues](https://github.com/mehrunes77/Esther/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mehrunes77/Esther/discussions)
- **Security**: See SECURITY.md for responsible disclosure

---

**Version**: 1.0.0  
**Last Updated**: December 17, 2025

