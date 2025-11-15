# Esther - Quick Start Guide

## 🚀 Running the Application

### First Time Setup
```bash
# Install all dependencies
npm run install:all

# Build backend
cd backend && npm run build && cd ..
```

### Starting the App

**Option 1: Use the startup script** (Recommended)
```bash
./start.sh
```

**Option 2: Manual startup**
```bash
# Terminal 1 - Backend (must be running first)
cd backend
node dist/main.js

# Terminal 2 - Frontend (in a new terminal)
cd frontend
npm run dev
```

### Stopping the App
```bash
./stop.sh
```

Or press `Ctrl+C` in each terminal running the servers.

---

## 🌐 Access Points

- **Frontend UI**: http://localhost:3001
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/health

---

## ⚙️ Port Configuration

**Backend**: Port **5001** (configured in `/backend/.env.local`)
**Frontend**: Port **3001** (configured in `/frontend/vite.config.ts`)

### If Ports Are Busy
```bash
# Find and kill processes
lsof -ti:5001 | xargs kill -9   # Backend
lsof -ti:3001 | xargs kill -9   # Frontend
```

---

## 🔧 Development Workflow

### Making Changes

**Backend Changes**:
```bash
cd backend
# Edit files in src/
npm run build        # Recompile TypeScript
# Restart backend server
```

**Frontend Changes**:
- Edit files in `frontend/src/`
- Vite hot-reloads automatically (no restart needed)

### Checking Logs
```bash
# Backend logs
tail -f /tmp/esther-backend.log

# Frontend logs  
tail -f /tmp/esther-frontend.log
```

---

## 🐛 Troubleshooting

### Backend Won't Start
1. Check if port 5001 is already in use:
   ```bash
   lsof -ti:5001
   ```
2. Verify .env.local exists:
   ```bash
   ls backend/.env.local
   ```
3. Check TypeScript compiled correctly:
   ```bash
   ls backend/dist/main.js
   ```

### Frontend Won't Load
1. Check if backend is running:
   ```bash
   curl http://localhost:5001/health
   ```
2. Verify port 3001 is available:
   ```bash
   lsof -ti:3001
   ```
3. Clear browser cache and reload

### API Calls Failing
- Backend must be on port **5001**
- Frontend expects backend at `http://localhost:5001`
- Check CORS settings in `backend/src/main.ts`

---

## 📝 What You Should See

### Backend Console
```
🚀 Esther Backend Server Started
port: 5001
environment: development
```

### Frontend Browser
- News banner at top with rotating astronomy articles
- Navigation: dashboard / settings / news
- Planet dashboard with live planetary positions
- Zodiac signs for each planet
- Retro dark theme with teal/cyan colors

### Network Tab (Browser DevTools)
- ✓ GET http://localhost:5001/api/planets/positions → 200
- ✓ GET http://localhost:5001/api/news → 200

---

## ✅ Pre-Flight Checklist

Before running, ensure:
- [ ] Node.js 20+ installed (`node --version`)
- [ ] Dependencies installed (`npm run install:all`)
- [ ] Backend compiled (`ls backend/dist/main.js`)
- [ ] Ports 5001 and 3001 are free
- [ ] No other Esther processes running

---

## 🎯 Quick Commands Reference

```bash
# Full restart
./stop.sh && ./start.sh

# Check if running
lsof -ti:5001 && echo "Backend ✓" || echo "Backend ✗"
lsof -ti:3001 && echo "Frontend ✓" || echo "Frontend ✗"

# Test backend health
curl http://localhost:5001/health

# View all running node processes
ps aux | grep node

# Nuclear option (kill all node processes)
pkill -9 node
```

---

## 📚 Project Structure

```
esther/
├── backend/          # Node.js Express API (Port 5001)
│   ├── src/          # TypeScript source
│   ├── dist/         # Compiled JavaScript (git-ignored)
│   └── .env.local    # Port & API configuration
├── frontend/         # React + Vite UI (Port 3001)
│   ├── src/          # React components
│   └── vite.config.ts # Port configuration
├── start.sh          # Startup script
└── stop.sh           # Stop script
```

---

**Last Updated**: November 13, 2025
**Tested On**: macOS (should work on Linux/WSL)
