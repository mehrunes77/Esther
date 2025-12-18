# GitHub Actions Build & Release Pipeline

This document explains how Esther's automated CI/CD pipeline works on GitHub Actions.

## Overview

The GitHub Actions workflow automatically builds, tests, and releases Esther for Windows and macOS whenever you push a version tag.

**Live Workflow**: [../.github/workflows/build.yml](../.github/workflows/build.yml)

---

## How to Trigger a Release

### 1. Create and Push a Version Tag

```bash
# Create a new version tag
git tag -a v1.0.0 -m "Esther v1.0.0 - Initial Release"

# Push to GitHub (triggers the workflow)
git push origin v1.0.0
```

### 2. Monitor the Build

Visit: https://github.com/mehrunes77/Esther/actions

The workflow will:
- Build on Windows and macOS in parallel
- Run security audits
- Upload executables to GitHub Releases

### 3. Users Download from Releases

After ~15 minutes, builds complete and users can download from:
https://github.com/mehrunes77/Esther/releases/tag/v1.0.0

---

## Workflow Stages

### Stage 1: Setup (Both Platforms)

```yaml
- Setup Node.js 20.11.0
- npm ci  # Clean install from package-lock.json
```

**Why npm ci?** It installs exact versions from `package-lock.json`, ensuring reproducible builds across all machines.

---

### Stage 2: Backend Build

```bash
cd backend && npm run build
```

**What happens:**
- TypeScript source files in `backend/src/` compile to `backend/dist/`
- Includes services:
  - `ephemeris.ts` → NASA JPL Horizons API integration
  - `news-filter.ts` → RSS feed filtering
  - `planetary-data.ts` → Data aggregation
  - `scheduler.ts` → Configurable update jobs

**Output:** CommonJS modules ready for Node.js

---

### Stage 3: Frontend Build

```bash
cd frontend && npm run build
```

**What happens:**
- Vite bundles React app to `frontend/build/` (not `dist/`)
- Outputs:
  - `build/index.html` - Main HTML entry point
  - `build/assets/index-*.js` - Minified React bundle (~200KB gzipped)
  - `build/assets/index-*.css` - Bundled styles

**Why `build/` not `dist/`?** Electron's main process (`public/main.ts`) looks for `../build/index.html` in production.

---

### Stage 4: Electron Packaging

```bash
npm run build:electron
```

**What electron-builder does:**
1. Reads `electron-builder.json` configuration
2. Takes compiled frontend (`frontend/build/`)
3. Takes Electron main process (`public/main.ts`)
4. Takes preload script (`public/preload.ts`)
5. Bundles with Electron runtime
6. Creates platform-specific installers

**Windows Output:**
- `Esther-1.0.0.exe` - NSIS installer
- `Esther-1.0.0-portable.exe` - Portable version (no install)

**macOS Output:**
- `Esther-1.0.0.dmg` - Disk image for distribution
- `Esther-1.0.0.zip` - Alternative archive

All outputs go to: `frontend/dist/`

---

### Stage 5: Upload to Release

```yaml
files: |
  frontend/dist/Esther-*.exe
  frontend/dist/Esther-*.dmg
```

**Configuration:**
- Uses `softprops/action-gh-release@v1`
- Requires `permissions: contents: write` to create releases
- Automatically creates or updates GitHub release with executables
- electron-builder's `overwrite: true` setting replaces duplicate assets on rebuild

---

### Stage 6: Security Audit (Parallel)

```bash
npm audit --audit-level=moderate
```

**Runs independently** on Ubuntu Linux:
- Checks all dependencies for security vulnerabilities
- Reports moderate-severity and higher issues
- Does NOT block the release (`continue-on-error: true`)

---

## Architecture Flow

```
┌─────────────────────────────────────────┐
│  git push origin v1.0.0                 │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  GitHub Actions Triggered               │
└────────────┬────────────────────────────┘
             │
   ┌─────────┴──────────┬──────────────────┐
   │                    │                  │
   ▼                    ▼                  ▼
┌──────────┐  ┌──────────┐  ┌────────────────┐
│ Windows  │  │  macOS   │  │ Security Audit │
│ Agent    │  │  Agent   │  │ (Ubuntu)       │
├──────────┤  ├──────────┤  ├────────────────┤
│Backend   │  │Backend   │  │npm audit       │
│Frontend  │  │Frontend  │  │                │
│Electron  │  │Electron  │  │(non-blocking)  │
└────┬─────┘  └────┬─────┘  └────────────────┘
     │             │
     │ .exe        │ .dmg
     └──────┬──────┘
            ▼
   ┌─────────────────────┐
   │ GitHub Release Page │
   │ (Auto-created)      │
   └─────────────────────┘
            ▼
   ┌─────────────────────┐
   │ Users Download Exe  │
   └─────────────────────┘
```

---

## Key Configuration Files

### 1. `.github/workflows/build.yml`
Main CI/CD pipeline definition. Triggers on version tags, runs builds, uploads releases.

### 2. `electron-builder.json`
Electron packaging configuration:
```json
{
  "appId": "com.esther-app.astrology",
  "productName": "Esther",
  "publish": {
    "provider": "github",
    "overwrite": true  // Allows re-releasing without errors
  },
  "win": { /* Windows config */ },
  "mac": { /* macOS config */ }
}
```

### 3. `frontend/vite.config.ts`
Frontend build configuration:
```typescript
build: {
  outDir: 'build',  // Changed from 'dist' for Electron compatibility
  minify: 'terser'  // Minification for production
}
```

### 4. `package.json` (Root)
Workspaces definition (ensures root npm ci installs all dependencies):
```json
{
  "workspaces": ["backend", "frontend"],
  "scripts": {
    "build:electron": "cd frontend && npm run build:electron"
  }
}
```

---

## Dependency Lock Files

### Why Lock Files Matter

Lock files ensure **reproducible builds** — the exact same code builds identically on any machine.

```
package-lock.json          (root level)
frontend/package.json      (no separate lock, uses root)
backend/package.json       (no separate lock, uses root)
```

**npm workspaces** means a single lock file at root manages all dependencies.

### Critical Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `electron` | 39.1.2 (pinned) | Desktop app runtime |
| `electron-builder` | ^24.13.3 | Packaging into .exe/.dmg |
| `terser` | 5.44.1 (pinned) | Production minification |
| `vite` | ^5.0.0 | Frontend bundler |
| `express` | ^4.21.2 | Backend API server |
| `axios` | ^1.13.2 | HTTP client for NASA API |

---

## What Gets Built

### Backend (`backend/dist/`)
```
├── main.js                 # Express server + routes
├── services/
│   ├── ephemeris.js       # NASA JPL Horizons API
│   ├── news-filter.js     # RSS feed filtering
│   └── planetary-data.js  # Data aggregation
├── routes/
│   ├── planets.js         # GET /api/planets/positions
│   ├── news.js            # GET /api/news
│   └── settings.js        # POST /api/settings
└── middleware/
    └── security.js        # Helmet.js security headers
```

### Frontend (`frontend/build/`)
```
├── index.html             # Main entry point
├── assets/
│   ├── index-*.js         # React bundle (200KB gzipped)
│   └── index-*.css        # Styles
└── models/                # 3D planet models (GLB format)
    ├── jupiter.glb
    ├── saturn.glb
    └── ...
```

### Electron Output (`frontend/dist/`)
```
Windows:
  ├── Esther-1.0.0.exe           # NSIS installer
  └── Esther-1.0.0-portable.exe  # Portable executable

macOS:
  ├── Esther-1.0.0.dmg           # Disk image
  └── Esther-1.0.0.zip           # Archive
```

---

## Troubleshooting Build Failures

### Issue: Build fails with "vite not found"

**Cause:** Frontend dependencies not installed

**Fix:** Ensure `npm ci` runs at root level, which uses npm workspaces to install all dependencies.

```bash
npm ci  # Installs root + frontend + backend via workspaces
```

### Issue: "dist/index.js not found"

**Cause:** Vite output directory mismatch

**Fix:** Verify `frontend/vite.config.ts` has:
```typescript
build: {
  outDir: 'build'  // Must be 'build', not 'dist'
}
```

### Issue: Release upload fails with 404

**Cause:** Glob pattern matches non-existent files

**Fix:** Use specific patterns:
```yaml
files: |
  frontend/dist/Esther-*.exe
  frontend/dist/Esther-*.dmg
```

### Issue: "already_exists" error

**Cause:** Re-running workflow tries to upload duplicate assets

**Fix:** `electron-builder.json` includes:
```json
"publish": {
  "overwrite": true
}
```

---

## Local Development vs CI/CD

### Local Build
```bash
npm install
npm run dev:api          # Backend with hot-reload
npm run dev:web         # Frontend with hot-reload
npm run dev:electron    # Electron in dev mode
```

### CI Build
```bash
npm ci                  # Clean, reproducible install
npm run build           # Compile backend + frontend
npm run build:electron  # Package with electron-builder
```

**Key differences:**
- CI uses `npm ci` (not `npm install`) for exact versions
- CI runs on fresh machines (macOS/Windows agents)
- CI disables console logging via terser minification
- CI uses overwrite mode for re-releases

---

## Performance Notes

### Build Times
- **Windows**: ~12-15 minutes (including NSIS installer generation)
- **macOS**: ~10-12 minutes (including DMG creation)
- **Ubuntu Security Audit**: ~2-3 minutes (non-blocking)

### Why It's Slow
1. electron-builder downloads Electron runtime (~150MB)
2. Bundling React + Three.js (~800KB unminified)
3. Code signing preparation (though not enabled)
4. Creating installers/DMG images

### Optimizations
- npm cache reuses dependencies between builds
- Parallel matrix strategy runs Windows + macOS simultaneously
- Security audit runs independent (doesn't block release)

---

## Security Considerations

### Code Signing
Currently **NOT enabled** (set to `null` in `electron-builder.json`):
```json
"win": {
  "certificateFile": null
}
```

**To enable:** Provide code signing certificate and password via environment variables.

### Audit Results
Current moderate/high severity vulnerabilities are:
- Mostly from Three.js (3D rendering library)
- No direct exploits for stateless, local-only app
- All security headers enabled (Helmet.js)

See: [SECURITY.md](SECURITY.md) for full audit details.

---

## Release Workflow for Users

1. **Tag is pushed** → GitHub Actions triggered
2. **Builds complete** → Executables in `frontend/dist/`
3. **Release created** → Assets uploaded automatically
4. **Users download** → From GitHub Releases page
5. **Users run** → Executable installs or runs directly
6. **App launches** → Electron loads React UI + Backend API

---

## Next Steps

### To Create a New Release
```bash
# 1. Update version in frontend/package.json and backend/package.json
# 2. Commit changes
git add frontend/package.json backend/package.json
git commit -m "Bump to v1.1.0"

# 3. Create and push tag
git tag -a v1.1.0 -m "Esther v1.1.0 - New features"
git push origin v1.1.0

# 4. Wait ~15-20 minutes for builds
# 5. Announce release with changelog
```

### To Monitor Builds
- GitHub Actions: https://github.com/mehrunes77/Esther/actions
- Releases: https://github.com/mehrunes77/Esther/releases

### To Debug Locally
```bash
# Test backend build
cd backend && npm run build

# Test frontend build
cd frontend && npm run build

# Test electron packaging (local only)
cd frontend && npm run build:electron
```

---

## Related Documentation

- [README.md](../README.md) - Project overview
- [INSTALLATION.md](INSTALLATION.md) - User installation guide
- [SECURITY.md](SECURITY.md) - Security audit results
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guidelines
- [.github/copilot-instructions.md](../.github/copilot-instructions.md) - AI coding guidelines
