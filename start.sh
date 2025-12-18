#!/bin/bash
# Esther - Application Startup Script
# This script starts both backend and frontend servers

set -e

echo "🚀 Starting Esther Application..."
echo ""

# Kill any existing processes on ports 5001 and 3001
echo "Cleaning up existing processes..."
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
# Also kill any orphaned node/vite processes
pkill -f "node.*dist/main.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2

# Start backend server
echo "Starting backend on port 5001..."
cd backend
node dist/main.js > /tmp/esther-backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Verify backend is running
if curl -s http://localhost:5001/health > /dev/null; then
    echo "✓ Backend running on http://localhost:5001 (PID: $BACKEND_PID)"
else
    echo "✗ Backend failed to start"
    exit 1
fi

# Start frontend server
echo "Starting frontend on port 3001..."
cd frontend
npm run dev > /tmp/esther-frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 5

# Verify frontend is running
if lsof -ti:3001 > /dev/null; then
    echo "✓ Frontend running on http://localhost:3001 (PID: $FRONTEND_PID)"
else
    echo "✗ Frontend failed to start"
    exit 1
fi

echo ""
echo "✨ Esther is running!"
echo ""
echo "📍 URLs:"
echo "   Frontend: http://localhost:3001"
echo "   Backend:  http://localhost:5001"
echo ""
echo "📋 Process IDs:"
echo "   Backend:  $BACKEND_PID"
echo "   Frontend: Check with: lsof -ti:3001"
echo ""
echo "🛑 To stop:"
echo "   ./stop.sh"
echo "   OR manually: kill $BACKEND_PID && lsof -ti:3001 | xargs kill"
echo ""
echo "📄 Logs:"
echo "   Backend:  tail -f /tmp/esther-backend.log"
echo "   Frontend: tail -f /tmp/esther-frontend.log"
echo ""
