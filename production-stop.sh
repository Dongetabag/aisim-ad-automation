#!/bin/bash

################################################################################
# AISim Ad Automation - Production Stop Script
################################################################################
# Gracefully stops all AISim services
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${SCRIPT_DIR}/logs"

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo ""
echo -e "${YELLOW}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║         Stopping AISim Ad Automation Platform                ║${NC}"
echo -e "${YELLOW}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

log_info "Shutting down services..."

# Stop backend
if [ -f "${LOG_DIR}/backend.pid" ]; then
    BACKEND_PID=$(cat "${LOG_DIR}/backend.pid")
    if kill -0 $BACKEND_PID 2>/dev/null; then
        log_info "Stopping backend server (PID: $BACKEND_PID)..."
        kill -TERM $BACKEND_PID 2>/dev/null || true

        # Wait for graceful shutdown
        sleep 2

        # Force kill if still running
        if kill -0 $BACKEND_PID 2>/dev/null; then
            log_info "Force stopping backend..."
            kill -9 $BACKEND_PID 2>/dev/null || true
        fi

        log_success "Backend stopped"
    else
        log_info "Backend already stopped"
    fi
    rm "${LOG_DIR}/backend.pid"
else
    log_info "Backend PID file not found"
fi

# Stop frontend
if [ -f "${LOG_DIR}/frontend.pid" ]; then
    FRONTEND_PID=$(cat "${LOG_DIR}/frontend.pid")
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        log_info "Stopping frontend server (PID: $FRONTEND_PID)..."
        kill -TERM $FRONTEND_PID 2>/dev/null || true

        # Wait for graceful shutdown
        sleep 2

        # Force kill if still running
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            log_info "Force stopping frontend..."
            kill -9 $FRONTEND_PID 2>/dev/null || true
        fi

        log_success "Frontend stopped"
    else
        log_info "Frontend already stopped"
    fi
    rm "${LOG_DIR}/frontend.pid"
else
    log_info "Frontend PID file not found"
fi

# Kill any remaining processes on the ports
log_info "Cleaning up any remaining processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

echo ""
log_success "✅ All services stopped successfully!"
echo ""
log_info "To restart the platform, run: ./production-start.sh"
echo ""
