#!/bin/bash
# Esther - Application Stop Script

echo "🛑 Stopping Esther Application..."

# Kill backend (port 5001)
if lsof -ti:5001 > /dev/null 2>&1; then
    lsof -ti:5001 | xargs kill -9 2>/dev/null
    echo "✓ Backend stopped"
else
    echo "- Backend not running"
fi

# Kill frontend (port 3001)
if lsof -ti:3001 > /dev/null 2>&1; then
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    echo "✓ Frontend stopped"
else
    echo "- Frontend not running"
fi

echo ""
echo "✨ All services stopped"
