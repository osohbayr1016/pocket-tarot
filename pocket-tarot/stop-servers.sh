#!/bin/bash

echo "🛑 Stopping Pocket Tarot Servers..."

# Kill all related processes
echo "🔌 Stopping all processes..."
pkill -f "concurrently" 2>/dev/null
pkill -f "nodemon" 2>/dev/null
pkill -f "next dev" 2>/dev/null
pkill -f "node server.js" 2>/dev/null

# Kill processes using our ports
echo "🔌 Freeing up ports..."
lsof -ti:5001 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

echo "✅ All servers stopped!"
echo "💡 Ports 3000, 3001, and 5001 are now free" 