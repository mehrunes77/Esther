# Deployment & Release Guide

Complete guide for building, testing, and releasing Esther.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Development Setup](#development-setup)
3. [Building](#building)
4. [Testing](#testing)
5. [Releasing](#releasing)
6. [GitHub Actions (CI/CD)](#github-actions-cicd)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### For Users (Pre-built)

Download from [GitHub Releases](https://github.com/mehrunes77/Esther/releases):
- **Windows**: `Esther-x.x.x.exe` or `-portable.exe`
- **macOS**: `Esther-x.x.x.dmg`
- **Linux**: `Esther-x.x.x.AppImage`

### For Developers (From Source)

```bash
# Clone
git clone https://github.com/mehrunes77/Esther.git
cd Esther

# Install dependencies
npm install

# Start development
npm run dev

# Backend runs at http://localhost:5001
# Frontend runs at http://localhost:3001
```

---

## Development Setup

### Prerequisites

- **Node.js**: v20.11.0 or later
- **npm**: v10+ (included with Node.js)
- **Git**: For version control

### Installation

```bash
# 1. Clone repository
git clone https://github.com/mehrunes77/Esther.git
cd Esther

# 2. Install dependencies (via npm workspaces)
npm install

# 3. Optional: Create .env.local for custom settings
cp .env.example .env.local

# 4. Verify installation
npm run type-check
```

### Environment Variables

Create `.env.local` in project root (optional):

```env
# Backend
API_PORT=5001
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:5001
```

### Directory Structure

```
esther/
├── frontend/                # React app + Electron UI
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── api/            # API client
│   │   └── styles/         # CSS
│   ├── public/             # Electron main/preload
│   └── vite.config.ts      # Build config
├── backend/                # Express API server
│   ├── src/
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API endpoints
│   │   └── middleware/     # Auth, logging, etc.
│   └── tsconfig.json       # TypeScript config
├── package.json            # Root workspaces config
└── docs/                   # Documentation
```

---

## Building

### Backend Build

```bash
cd backend
npm run build
# Output: backend/dist/
```

**What it does:**
- Compiles TypeScript to CommonJS
- Outputs to `backend/dist/`
- Ready for Node.js execution

### Frontend Build

```bash
cd frontend
npm run build
# Output: frontend/build/
```

**What it does:**
- Bundles React with Vite
- Minifies with Terser
- Outputs to `frontend/build/` (note: not `dist/`)
- Includes CSS, assets, and HTML entry point

### Electron Build (Desktop App)

```bash
# Builds frontend + packages with Electron
npm run build:electron

# Or platform-specific:
npm run build:electron:win      # Windows EXE
npm run build:electron:mac      # macOS DMG
npm run build:electron:linux    # Linux AppImage

# Output: frontend/dist/
```

**What electron-builder does:**
1. Compiles frontend (`frontend/build/`)
2. Bundles with Electron runtime
3. Creates platform-specific installers
4. Outputs to `frontend/dist/`

### Full Build

```bash
# Build everything
npm run build

# Then package for Electron
npm run build:electron
```

---

## Testing

### Type Checking

```bash
npm run type-check
# Checks TypeScript without building
```

### Unit Tests

```bash
# Run all tests
npm run test

# Backend tests
cd backend && npm run test

# Frontend tests
cd frontend && npm run test

# Watch mode
npm run test:watch
```

### Manual Testing

```bash
# 1. Start development servers
npm run dev

# 2. In another terminal, start backend
cd backend && npm run build && npm run dev

# 3. Frontend auto-opens at http://localhost:3001

# 4. Test features:
#    - Planet data loading
#    - 3D visualization
#    - Settings panel
#    - News feed
```

---

## Releasing

### Step 1: Prepare Release

```bash
# 1. Update version numbers in both package.json files
# frontend/package.json: "version": "1.1.0"
# backend/package.json: "version": "1.1.0"

# 2. Commit changes
git add frontend/package.json backend/package.json
git commit -m "Bump version to v1.1.0"

# 3. Verify everything builds
npm run build
npm run build:electron
```

### Step 2: Create Release Tag

```bash
# Create annotated tag
git tag -a v1.1.0 -m "Esther v1.1.0 - New Features"

# Push to GitHub (triggers CI/CD)
git push origin v1.1.0
```

### Step 3: Automatic Build

GitHub Actions automatically:
1. Checks out code
2. Installs dependencies
3. Builds backend & frontend
4. Packages with electron-builder
5. Uploads to GitHub Releases

**Monitor at**: https://github.com/mehrunes77/Esther/actions

### Step 4: Announce Release

After build completes (~15-20 min):

1. Visit: https://github.com/mehrunes77/Esther/releases/tag/v1.1.0
2. Edit release notes
3. Announce on social media

---

## GitHub Actions (CI/CD)

### How It Works

**Trigger**: Push a version tag (e.g., `v1.0.0`)

**Workflow** (`.github/workflows/build.yml`):
```
1. Checkout code
2. Install Node.js 20.11.0
3. npm ci (clean install from lock file)
4. Build backend (TypeScript → JavaScript)
5. Build frontend (Vite bundling)
6. Package with electron-builder
7. Upload Windows EXE + macOS DMG to Release
8. Run security audit (non-blocking)
```

**Parallel Builds**:
- Windows agent builds `.exe`
- macOS agent builds `.dmg`
- Ubuntu agent runs security audit

### Build Output

```
frontend/dist/
├── Esther-1.1.0.exe              # Windows installer
├── Esther-1.1.0-portable.exe     # Windows portable
└── Esther-1.1.0.dmg              # macOS disk image
```

### Build Times

- **Windows**: ~12-15 minutes
- **macOS**: ~10-12 minutes
- **Security Audit**: ~2-3 minutes (parallel)

### Configuration Files

- `.github/workflows/build.yml` - CI/CD pipeline
- `electron-builder.json` - Electron build config
- `frontend/vite.config.ts` - Frontend build config
- `package-lock.json` - Exact dependency versions

### Troubleshooting CI/CD

**Issue**: Build fails with "vite not found"
- **Fix**: `npm ci` at root installs all workspace dependencies

**Issue**: "dist/index.js not found"
- **Fix**: Verify Vite outputs to `build/` not `dist/`

**Issue**: Asset upload fails with 404
- **Fix**: Check glob pattern matches actual files

**Issue**: "already_exists" error
- **Fix**: `electron-builder.json` has `overwrite: true`

---

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

# Check configuration
cat .env.local | grep API_PORT
```

### Frontend Shows Blank Page

1. Check browser console for errors
2. Verify backend is running: `http://localhost:5001`
3. Check network tab for failed requests
4. Restart frontend: `npm run dev:web`

### Slow 3D Rendering

- Update GPU drivers
- Close other applications
- Check GPU usage: Activity Monitor (macOS) or Task Manager (Windows)
- Lower graphics quality in settings

### Build Fails Locally

```bash
# Clean rebuild
rm -rf node_modules frontend/node_modules backend/node_modules
npm install
npm run build
```

### TypeScript Errors

```bash
npm run type-check
# Shows all type errors without building
```

### Dependency Conflicts

```bash
# Update all dependencies to latest
npm update

# Or use audit to fix known issues
npm audit fix
npm audit fix --force  # Warning: may introduce breaking changes
```

### Electron Packaging Issues

```bash
# Rebuild native modules
npm rebuild

# Then try packaging again
npm run build:electron
```

### Preload Script Issues

If Electron main process crashes:
1. Check `frontend/public/preload.ts`
2. Verify it exports IPC methods correctly
3. Check browser console for errors

### Cannot Sign Executables

Currently signing is disabled (`certificateFile: null` in electron-builder.json).

To enable:
- Provide code signing certificate
- Set environment variables in CI/CD
- macOS: Developer ID from Apple
- Windows: Authenticode certificate

---

## Release Checklist

Before releasing:

- [ ] Version bumped in both package.json files
- [ ] All tests pass: `npm run test`
- [ ] Type checking passes: `npm run type-check`
- [ ] Builds locally: `npm run build:electron`
- [ ] No console errors in browser dev tools
- [ ] Changelog prepared
- [ ] Documentation updated if needed

After release:

- [ ] GitHub Actions build completed successfully
- [ ] Executables uploaded to Releases page
- [ ] Users can download and run app
- [ ] Security audit passed
- [ ] Announcement posted

---

## Common Commands Reference

```bash
# Development
npm run dev              # All dev servers
npm run dev:api         # Backend only
npm run dev:web         # Frontend only
npm run dev:electron    # Electron dev mode

# Building
npm run build           # Backend + Frontend
npm run build:api       # Backend only
npm run build:web       # Frontend only
npm run build:electron  # Full desktop app

# Testing
npm run test            # All tests
npm run test:watch      # Watch mode

# Utilities
npm run type-check      # TypeScript check
npm run lint            # Code linting (coming soon)
npm run clean           # Remove build artifacts
```

---

## File Locations

| Component | Location | Purpose |
|-----------|----------|---------|
| Backend Source | `backend/src/` | Node.js API |
| Backend Build | `backend/dist/` | Compiled JavaScript |
| Frontend Source | `frontend/src/` | React components |
| Frontend Build | `frontend/build/` | Vite bundle |
| Electron Output | `frontend/dist/` | Packaged executables |
| Lock File | `package-lock.json` | Exact versions |
| Environment | `.env.local` | Local settings (optional) |

---

## Performance Tips

### Development
- Use `npm run dev` with hot-reload
- Don't rebuild unnecessarily
- Check GPU/CPU usage if slow

### Production
- Use minified builds (automatic)
- Enable code splitting if needed
- Test on target hardware
- Monitor memory usage in 3D view

### CI/CD
- Cache npm dependencies (done automatically)
- Parallel builds (Windows + macOS simultaneously)
- Don't block on non-critical tasks (security audit is non-blocking)

---

## Security Notes

### Code Signing
- Not currently enabled (see electron-builder.json)
- Required for auto-updates
- Windows: Authenticode certificate
- macOS: Developer ID

### Dependencies
- All audited: `npm audit`
- No critical vulnerabilities
- Three.js has low-severity issues (acceptable for local app)
- See SECURITY.md for details

### Privacy
- Zero data collection
- No telemetry
- Everything runs locally
- See PRIVACY.md for details

---

## Related Documentation

- **[GITHUB_ACTIONS.md](GITHUB_ACTIONS.md)** - CI/CD pipeline detailed guide
- **[SECURITY.md](SECURITY.md)** - Security audit & practices
- **[PRIVACY.md](PRIVACY.md)** - Privacy policy & practices
- **[INSTALLATION.md](INSTALLATION.md)** - User installation guide
- **[README.md](README.md)** - Project overview
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development guidelines

---

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/mehrunes77/Esther/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mehrunes77/Esther/discussions)
- **Security**: See [SECURITY.md](SECURITY.md) for responsible disclosure

---

**Last Updated**: December 18, 2025
**Version**: v1.0.0
