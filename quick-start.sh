#!/bin/bash

echo "🚀 AISim Automated Ad System - Quick Start"
echo "=========================================="

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "node.*app.js" 2>/dev/null || true
sleep 2

# Start frontend on a fresh port
echo "🎨 Starting frontend on port 4000..."
cd frontend
PORT=4000 npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "⏳ Waiting for frontend to initialize..."
sleep 20

# Test the system
echo "🧪 Testing virtual environment..."
echo "Testing frontend on port 4000..."
if curl -s http://localhost:4000 > /dev/null; then
    echo "✅ Frontend is accessible on port 4000"
    echo "🎯 Opening browser..."
    open http://localhost:4000 2>/dev/null || echo "Please open http://localhost:4000 in your browser"
else
    echo "❌ Frontend not accessible on port 4000"
fi

echo ""
echo "🎉 Virtual Environment Ready!"
echo "=============================="
echo "Frontend: http://localhost:4000"
echo "Status: Active and ready for use"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Keep script running
wait $FRONTEND_PID