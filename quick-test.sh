#!/bin/bash

# AISim Automated Ad System - Quick Testing Script
# Finds working frontend port and runs comprehensive tests

echo "🧪 AISim Automated Ad System - Quick Testing Environment"
echo "========================================================"

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

# Test frontend ports
test_frontend_ports() {
    print_status "Testing frontend ports..."
    
    local ports=(3040 3050 3060 3070 3080 3090 3100 3110 3120 3130)
    local working_port=""
    
    for port in "${ports[@]}"; do
        if curl -s "http://localhost:$port/" > /dev/null 2>&1; then
            print_success "Frontend accessible on port $port"
            working_port=$port
            break
        else
            print_warning "Port $port not accessible"
        fi
    done
    
    if [ -n "$working_port" ]; then
        echo "working_port=$working_port" > /tmp/aisim_working_port
        return 0
    else
        print_error "No working frontend ports found"
        return 1
    fi
}

# Test backend
test_backend() {
    print_status "Testing backend..."
    
    if curl -s "http://localhost:3000/health" > /dev/null 2>&1; then
        print_success "Backend is accessible"
        return 0
    else
        print_warning "Backend not accessible (this is OK for frontend-only testing)"
        return 1
    fi
}

# Run comprehensive tests
run_tests() {
    print_status "Running comprehensive tests..."
    
    if [ -f "virtual-test-env/test-runner.js" ]; then
        node virtual-test-env/test-runner.js
    else
        print_error "Test runner not found"
        return 1
    fi
}

# Open browser
open_browser() {
    local working_port=$(cat /tmp/aisim_working_port 2>/dev/null | cut -d'=' -f2)
    
    if [ -n "$working_port" ]; then
        print_success "Opening browser to http://localhost:$working_port"
        
        # Try different browser opening methods
        if command -v open > /dev/null 2>&1; then
            open "http://localhost:$working_port"
        elif command -v xdg-open > /dev/null 2>&1; then
            xdg-open "http://localhost:$working_port"
        elif command -v start > /dev/null 2>&1; then
            start "http://localhost:$working_port"
        else
            print_warning "Could not open browser automatically. Please open: http://localhost:$working_port"
        fi
    else
        print_error "No working port found to open"
    fi
}

# Main execution
main() {
    print_status "Starting quick testing environment..."
    
    # Test frontend ports
    if test_frontend_ports; then
        working_port=$(cat /tmp/aisim_working_port | cut -d'=' -f2)
        print_success "Found working frontend on port $working_port"
    else
        print_error "No working frontend found. Please start the frontend first."
        exit 1
    fi
    
    # Test backend
    test_backend
    
    # Run comprehensive tests
    run_tests
    
    # Open browser
    open_browser
    
    print_success "Quick testing environment ready!"
    print_status "Frontend: http://localhost:$working_port"
    print_status "Backend: http://localhost:3000 (if running)"
    
    echo ""
    echo "🎯 Available Features:"
    echo "  - AI Ad Generation"
    echo "  - Lead Generation (Google Places)"
    echo "  - Payment Processing (Stripe)"
    echo "  - Analytics Dashboard"
    echo "  - Chrome Extension"
    echo ""
    echo "Press Ctrl+C to stop testing"
    
    # Keep script running
    while true; do
        sleep 10
        if ! curl -s "http://localhost:$working_port/" > /dev/null 2>&1; then
            print_warning "Frontend connection lost. Please restart the frontend."
            break
        fi
    done
}

# Handle Ctrl+C
trap 'echo -e "\n${YELLOW}Stopping quick testing environment...${NC}"; rm -f /tmp/aisim_working_port; exit 0' INT

# Run main function
main "$@"
