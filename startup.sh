#!/bin/bash

echo "🚀 Starting AISim Automated Ad Company..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Please copy env.example to .env and fill in your API keys"
    exit 1
fi

# Build and start services
echo "🏗️  Building Docker images..."
docker-compose build

echo ""
echo "▶️  Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "✅ AISim Ad Automation System is running!"
echo ""
echo "📊 Service URLs:"
echo "   - Backend API:  http://localhost:3000"
echo "   - Frontend:     http://localhost:3001"
echo "   - PostgreSQL:   localhost:5432"
echo "   - Redis:        localhost:6379"
echo ""
echo "🧪 To run tests:"
echo "   cd virtual-test-env && docker-compose -f docker-compose.test.yml up"
echo ""
echo "📝 To view logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 To stop:"
echo "   docker-compose down"
echo ""



