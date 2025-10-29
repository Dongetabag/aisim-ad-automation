#!/bin/bash

echo "🚀 AISim Automated Ad System - Virtual Environment Startup"
echo "=========================================================="

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "node dist/app.js" 2>/dev/null || true
sleep 2

# Start database services
echo "🗄️ Starting database services..."
docker-compose up -d postgres redis
sleep 5

# Start backend
echo "⚙️ Starting backend..."
cd backend
npm run build
node dist/app.js &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 10

# Start frontend on a fresh port
echo "🎨 Starting frontend on port 5000..."
cd frontend
PORT=5000 npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "⏳ Waiting for frontend to initialize..."
sleep 15

# Test the system
echo "🧪 Testing virtual environment..."
echo "Testing frontend on port 5000..."
if curl -s http://localhost:5000 > /dev/null; then
    echo "✅ Frontend is accessible on port 5000"
else
    echo "❌ Frontend not accessible on port 5000"
fi

echo "Testing backend on port 3000..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Backend is accessible on port 3000"
else
    echo "❌ Backend not accessible on port 3000"
fi

echo ""
echo "🎉 Virtual Environment Ready!"
echo "=============================="
echo "Frontend: http://localhost:5000"
echo "Backend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Keep script running
wait
