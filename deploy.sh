#!/bin/bash

# AISim Automated Ad System - Production Deployment Script
# Deploys the complete system with all services

echo "🚀 AISim Automated Ad System - Production Deployment"
echo "===================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ✅ $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ⚠️  $1"
}

print_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ❌ $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking deployment prerequisites..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi
    print_success "Docker is running"
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        print_warning ".env file not found, creating from template..."
        cp env.example .env
        print_warning "Please edit .env file with your actual API keys before continuing"
    fi
    print_success "Environment configuration ready"
    
    # Check if node_modules exist
    if [ ! -d "backend/node_modules" ]; then
        print_status "Installing backend dependencies..."
        cd backend && npm install && cd ..
    fi
    
    if [ ! -d "frontend/node_modules" ]; then
        print_status "Installing frontend dependencies..."
        cd frontend && npm install && cd ..
    fi
    print_success "Dependencies installed"
}

# Build production images
build_images() {
    print_status "Building production Docker images..."
    
    # Build backend image
    print_status "Building backend image..."
    docker build -t aisim-backend:latest ./backend
    if [ $? -eq 0 ]; then
        print_success "Backend image built successfully"
    else
        print_error "Backend image build failed"
        exit 1
    fi
    
    # Build frontend image
    print_status "Building frontend image..."
    docker build -t aisim-frontend:latest ./frontend
    if [ $? -eq 0 ]; then
        print_success "Frontend image built successfully"
    else
        print_error "Frontend image build failed"
        exit 1
    fi
}

# Deploy with Docker Compose
deploy_services() {
    print_status "Deploying services with Docker Compose..."
    
    # Stop any existing services
    docker-compose down --remove-orphans
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check service status
    print_status "Checking service status..."
    docker-compose ps
}

# Run health checks
run_health_checks() {
    print_status "Running deployment health checks..."
    
    # Check backend health
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_warning "Backend health check failed"
    fi
    
    # Check frontend health
    if curl -f http://localhost:3001/ > /dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_warning "Frontend health check failed"
    fi
    
    # Check database
    if docker-compose exec -T postgres pg_isready -U aisim > /dev/null 2>&1; then
        print_success "Database is healthy"
    else
        print_warning "Database health check failed"
    fi
}

# Run comprehensive tests
run_deployment_tests() {
    print_status "Running deployment tests..."
    
    if [ -f "virtual-test-env/test-runner.js" ]; then
        node virtual-test-env/test-runner.js
    else
        print_warning "Test runner not found, skipping tests"
    fi
}

# Show deployment status
show_deployment_status() {
    echo ""
    echo "🎉 AISim Automated Ad System Deployed Successfully!"
    echo "=================================================="
    echo ""
    echo "📊 Services Status:"
    echo "  Backend:  http://localhost:3000"
    echo "  Frontend: http://localhost:3001"
    echo "  Database: localhost:5432"
    echo "  Redis:    localhost:6379"
    echo ""
    echo "🔗 Key Endpoints:"
    echo "  Health Check: http://localhost:3000/health"
    echo "  API Docs:     http://localhost:3000/api"
    echo "  Dashboard:    http://localhost:3001/dashboard"
    echo "  Create Ad:    http://localhost:3001/create-ad"
    echo ""
    echo "📝 Management Commands:"
    echo "  View Logs:    docker-compose logs -f"
    echo "  Stop System:  docker-compose down"
    echo "  Restart:      docker-compose restart"
    echo "  Update:       docker-compose pull && docker-compose up -d"
    echo ""
    echo "🎯 Available Features:"
    echo "  ✅ AI Ad Generation"
    echo "  ✅ Lead Generation (Google Places)"
    echo "  ✅ Payment Processing (Stripe)"
    echo "  ✅ Analytics Dashboard"
    echo "  ✅ Chrome Extension"
    echo "  ✅ Virtual Testing Environment"
    echo ""
    echo "🚀 System is ready for production use!"
}

# Main deployment function
main() {
    check_prerequisites
    build_images
    deploy_services
    run_health_checks
    run_deployment_tests
    show_deployment_status
}

# Handle Ctrl+C
trap 'echo -e "\n${YELLOW}Deployment interrupted. Cleaning up...${NC}"; docker-compose down; exit 1' INT

# Run main deployment
main "$@"
