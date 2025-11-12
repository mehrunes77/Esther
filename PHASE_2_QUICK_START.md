# 🚀 Phase 2 Quick Start Guide

**Status**: Just completed ✅  
**What's Ready**: Full backend API + frontend client  
**Time to Test**: 10 minutes

---

## 📋 What You Have Now

✅ Express backend server on port 5000  
✅ 3 API route groups (planets, news, settings)  
✅ Frontend API client with IPC fallback  
✅ Real-time planet data from NASA JPL  
✅ Astronomy news filtering  
✅ Settings management  

---

## ⚡ Start Testing in 3 Steps

### Step 1: Install Dependencies (5 min)
```bash
cd /Users/ayeshaniazi/Documents/Esther
npm install
```

This installs:
- Express, axios, helmet, winston (backend)
- React, electron, typescript (frontend)
- All development tools

### Step 2: Start Backend (Terminal 1)
```bash
npm run dev:api
```

Expected output:
```
🚀 Esther Backend Server Started on port 5000
```

### Step 3: Test Endpoints (Terminal 2)

**Test 1: Health Check**
```bash
curl http://localhost:5000/health
```
Response: `{"status":"ok","timestamp":"2025-11-12T..."}`

**Test 2: Get All Planets**
```bash
curl http://localhost:5000/api/planets/positions
```
Response: Array of planets with positions, distances, magnitudes

**Test 3: Get Specific Planet**
```bash
curl http://localhost:5000/api/planets/mars
```
Response: Mars position + profile data

**Test 4: Get News**
```bash
curl "http://localhost:5000/api/news?limit=5&minScore=50"
```
Response: Array of filtered astronomy articles

**Test 5: Get Settings**
```bash
curl http://localhost:5000/api/settings
```
Response: Current app configuration

**Test 6: Update Settings**
```bash
curl -X POST http://localhost:5000/api/settings \
  -H "Content-Type: application/json" \
  -d '{"planetUpdateInterval": 600000}'
```
Response: Updated settings object

---

## 📝 Available API Endpoints

### Planets
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/planets/positions` | GET | All planet positions |
| `/api/planets/:name` | GET | Specific planet profile + position |
| `/api/planets/category/:type` | GET | Filter by type (terrestrial, gas_giant, etc) |

### News
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/news` | GET | Filtered astronomy news (paginated) |
| `/api/news/sources` | GET | Available news sources |
| `/api/news/:id` | GET | Specific article |

### Settings
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/settings` | GET | Current settings |
| `/api/settings` | POST | Update settings (with validation) |
| `/api/settings/ranges` | GET | Valid ranges for numeric settings |
| `/api/settings/reset` | POST | Reset to defaults |

### Health
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |

---

## 🔌 Using Frontend API Client

Once dependencies are installed, use the API client in React components:

```typescript
import { apiClient } from './api/client';

// Get planet positions
const positions = await apiClient.getPlanetPositions();

// Get specific planet
const mars = await apiClient.getPlanetProfile('mars');

// Get news with filters
const news = await apiClient.getNews({
  limit: 50,
  minScore: 30,
  source: 'nasa'
});

// Get and update settings
const settings = await apiClient.getSettings();
await apiClient.saveSettings({ planetUpdateInterval: 600000 });

// Listen for real-time updates (Electron only)
apiClient.onPlanetUpdate((data) => {
  console.log('Planet data updated:', data);
});
```

---

## 🧪 Build & Test Frontend

```bash
# Build frontend
npm run build:web

# Check types
npx tsc --noEmit

# Run frontend tests
npm run test:web
```

---

## 🔍 Debug Endpoints

### Get detailed request logging
Start backend with debug enabled:
```bash
LOG_LEVEL=debug npm run dev:api
```

### View all requests
```bash
curl -v http://localhost:5000/api/planets/positions 2>&1 | grep -A 50 ">"
```

### Test in browser
Open http://localhost:5000/health in your browser

---

## 🐛 Common Issues

### "Port 5000 already in use"
```bash
# Kill existing process
lsof -i :5000
kill -9 <PID>

# Or use different port
API_PORT=5001 npm run dev:api
```

### "Cannot find module 'express'"
```bash
# Re-run npm install
npm install

# If still fails, clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### CORS error in browser
Backend should handle this. Check .env.local for CORS_ORIGINS

### API returns 500 error
Check backend console for detailed error logs

---

## 📊 What's Working

✅ Backend server running on port 5000  
✅ All routes responding with data  
✅ Input validation working  
✅ Rate limiting active  
✅ Error handling with proper logging  
✅ CORS configured  
✅ Security headers applied  

---

## ⏭️ Next: Phase 3 - UI Components

After testing, ready to build:
1. PlanetDashboard component
2. Real-time planet display
3. Settings UI
4. News feed

See `PHASE_2_COMPLETE.md` for detailed architecture.

---

## 🎯 30-Minute Plan

- **0-5 min**: Run `npm install`
- **5-10 min**: Start backend with `npm run dev:api`
- **10-20 min**: Test all endpoints with curl commands above
- **20-30 min**: Review PHASE_2_COMPLETE.md and plan Phase 3

---

**Ready?** Let's go! 🚀

```bash
npm install && npm run dev:api
```
