# Troubleshooting Fixes Applied

## Issues Fixed (November 13, 2025)

### 1. ✅ Duplicate Process Prevention
**Problem**: Multiple processes running on same ports causing conflicts  
**Fix**: Enhanced startup script to:
- Kill orphaned node and vite processes
- Added 2-second delay for clean shutdown
- Kill processes by name pattern, not just port

**Files Modified**:
- `/start.sh` - Added `pkill -f "node.*dist/main.js"` and `pkill -f "vite"`

### 2. ✅ Browser Auto-Open Conflict
**Problem**: Vite auto-opening browser multiple times  
**Fix**: Disabled auto-open and added strict port checking

**Files Modified**:
- `/frontend/vite.config.ts` - Set `open: false` and `strictPort: true`

### 3. ✅ CORS Configuration
**Problem**: Frontend on port 3001 couldn't connect to backend (CORS set for port 3000)  
**Fix**: Updated CORS settings for correct ports

**Files Modified**:
- `/backend/src/main.ts` - Changed default CORS from `localhost:3000` to `localhost:3001`
- `/backend/.env.local` - Updated `CORS_ORIGINS` to include `localhost:3001`

### 4. ✅ Better Error Handling
**Problem**: Generic error messages, hard to debug  
**Fix**: Added detailed console logging and specific error messages

**Files Modified**:
- `/frontend/src/components/PlanetDashboard.tsx` - Added console.log for debugging
- `/frontend/src/api/client.ts` - Added response validation and null filtering

---

## Prevention Measures

### Always Use Startup Script
```bash
# ALWAYS use this to start
./start.sh

# ALWAYS use this to stop
./stop.sh
```

### Never Run These Directly
❌ `cd backend && node dist/main.js` (can create orphans)  
❌ `cd frontend && npm run dev` (can create duplicates)

### Port Checklist
- Backend: **5001** ONLY
- Frontend: **3001** ONLY
- Never change these without updating ALL references:
  - `/backend/.env.local`
  - `/frontend/vite.config.ts`
  - `/frontend/src/api/client.ts`
  - `/backend/src/main.ts` (CORS)

---

## If Issues Occur Again

### Stuck on "Loading..."
1. Open Browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab - look for `/api/planets/positions` request
4. If request fails, restart backend: `./stop.sh && ./start.sh`

### Page Flashes/Disappears
1. Check for duplicate processes: `lsof -ti:3001`
2. If more than 2 PIDs, run: `./stop.sh && ./start.sh`

### API Connection Fails
1. Verify backend: `curl http://localhost:5001/health`
2. Check CORS: `curl -H "Origin: http://localhost:3001" http://localhost:5001/api/planets/positions`
3. Check backend logs: `tail -f /tmp/esther-backend.log`

---

## Testing Checklist

After starting servers, verify:
- [ ] `curl http://localhost:5001/health` returns `{"status":"ok"}`
- [ ] `lsof -ti:5001` returns exactly 1 PID
- [ ] `lsof -ti:3001` returns 1-2 PIDs (npm + vite is normal)
- [ ] Browser at `http://localhost:3001` shows planet dashboard
- [ ] Browser console has logs: "Making HTTP request" and "Received planet positions"
- [ ] Planet cards display with data (not stuck on "Loading...")

---

**Last Updated**: November 13, 2025  
**Status**: All issues resolved and prevented
