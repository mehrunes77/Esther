# ✅ Esther - Startup Checklist

Use this checklist every time you start working on Esther to avoid issues.

## Before Starting

- [ ] No other processes on port 5001 (backend)
  ```bash
  lsof -ti:5001 | xargs kill -9 2>/dev/null
  ```

- [ ] No other processes on port 3001 (frontend)
  ```bash
  lsof -ti:3001 | xargs kill -9 2>/dev/null
  ```

- [ ] Backend is compiled
  ```bash
  ls backend/dist/main.js  # Should exist
  ```

- [ ] Environment file exists
  ```bash
  ls backend/.env.local  # Should have API_PORT=5001
  ```

## Starting Up

- [ ] Start backend FIRST
  ```bash
  cd backend && node dist/main.js
  ```
  **Wait for**: `🚀 Esther Backend Server Started` with `port: 5001`

- [ ] Verify backend health
  ```bash
  curl http://localhost:5001/health
  ```
  **Should return**: `{"status":"ok","timestamp":"..."}`

- [ ] Start frontend SECOND
  ```bash
  cd frontend && npm run dev
  ```
  **Wait for**: `Local: http://localhost:3001/`

- [ ] Open browser
  ```
  http://localhost:3001
  ```

## What You Should See

### In Browser
- [ ] Debug banner at top: "✓ react is running | backend: localhost:5001"
- [ ] News banner with rotating astronomy articles
- [ ] Navigation buttons: dashboard / settings / news
- [ ] Planet dashboard with cards showing:
  - Planet names (Mercury, Venus, Mars, etc.)
  - Zodiac signs
  - Right Ascension / Declination
  - Distance from Earth
- [ ] Retro dark theme (black background, teal/cyan text)

### In Browser DevTools (F12 → Network)
- [ ] GET `http://localhost:5001/api/planets/positions` → Status 200
- [ ] GET `http://localhost:5001/api/news` → Status 200
- [ ] No CORS errors in console

## If Something Goes Wrong

### Backend Won't Start
1. Check if TypeScript compiled:
   ```bash
   cd backend && npm run build
   ```
2. Check if port is free:
   ```bash
   lsof -ti:5001
   ```
3. Check .env.local has `API_PORT=5001`

### Frontend Shows Blank Page
1. Check browser console for errors (F12)
2. Verify backend is running:
   ```bash
   curl http://localhost:5001/health
   ```
3. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

### API Calls Fail (CORS errors)
1. Verify backend is on port **5001** (not 5000)
2. Check `/frontend/src/api/client.ts` has `baseURL: 'http://localhost:5001'`
3. Check backend CORS in `/backend/src/main.ts` allows `localhost:3001`

### "Port Already in Use" Error
```bash
# Kill everything and restart
./stop.sh
./start.sh
```

## Quick Commands

```bash
# Check what's running
lsof -ti:5001 && echo "Backend ✓" || echo "Backend ✗"
lsof -ti:3001 && echo "Frontend ✓" || echo "Frontend ✗"

# View logs
tail -f /tmp/esther-backend.log
tail -f /tmp/esther-frontend.log

# Full restart
./stop.sh && sleep 2 && ./start.sh

# Emergency stop all
pkill -9 node
```

## Port Reference (DO NOT CHANGE)

| Service | Port | Config File |
|---------|------|-------------|
| Backend API | **5001** | `/backend/.env.local` |
| Frontend Dev | **3001** | `/frontend/vite.config.ts` |
| API Client | **5001** | `/frontend/src/api/client.ts` |

## Critical Files - DO NOT DELETE

- `/backend/dist/main.js` - Compiled backend (regenerate with `npm run build`)
- `/backend/.env.local` - Backend configuration with port settings
- `/frontend/src/api/client.ts` - API client (hardcoded to port 5001)
- `/frontend/vite.config.ts` - Frontend dev server config (port 3001)

---

**Tip**: Save this file and open it every time you start Esther to avoid common issues!
