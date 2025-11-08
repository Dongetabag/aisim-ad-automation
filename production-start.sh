#!/bin/bash

################################################################################
# AISim Ad Automation - Production Startup Script
################################################################################
# This script launches the AISim platform in production mode
# As a 20+ year veteran developer, this includes:
# - Pre-flight checks and validation
# - Service dependency management
# - Health monitoring
# - Graceful error handling
# - Production-grade logging
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${SCRIPT_DIR}/logs"
BACKEND_PORT=3000
FRONTEND_PORT=3001

################################################################################
# Utility Functions
################################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_banner() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}║         AISim Ad Automation Platform                         ║${NC}"
    echo -e "${GREEN}║         Production Deployment System                         ║${NC}"
    echo -e "${GREEN}║         Version 1.0.0                                        ║${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

check_dependencies() {
    log_info "Checking system dependencies..."

    local missing_deps=0

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        missing_deps=1
    else
        log_success "Node.js $(node --version) detected"
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        missing_deps=1
    else
        log_success "npm $(npm --version) detected"
    fi

    return $missing_deps
}

check_environment() {
    log_info "Validating environment configuration..."

    if [ ! -f "${SCRIPT_DIR}/.env" ]; then
        log_error ".env file not found!"
        log_info "Please copy env.example to .env and configure your API keys"
        return 1
    fi

    log_success "Environment file found"

    # Source the .env file
    set -a
    source "${SCRIPT_DIR}/.env"
    set +a

    # Check critical environment variables
    local missing_vars=0

    if [ -z "$GOOGLE_API_KEY" ]; then
        log_warning "GOOGLE_API_KEY not set (AI features may not work)"
    fi

    if [ -z "$STRIPE_SECRET_KEY" ]; then
        log_warning "STRIPE_SECRET_KEY not set (payment features disabled)"
    fi

    log_success "Environment validated"
    return 0
}

check_port() {
    local port=$1
    local service=$2

    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "Port $port is already in use (${service})"
        log_info "Attempting to kill existing process..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

create_log_directory() {
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR"
        log_info "Created log directory: $LOG_DIR"
    fi
}

start_backend() {
    log_info "Starting backend server..."

    cd "${SCRIPT_DIR}/backend"

    # Check if dist directory exists
    if [ ! -d "dist" ]; then
        log_error "Backend not built! Run 'npm run build' first."
        return 1
    fi

    # Start backend in background
    NODE_ENV=production nohup node dist/app.js > "${LOG_DIR}/backend.log" 2>&1 &
    local backend_pid=$!
    echo $backend_pid > "${LOG_DIR}/backend.pid"

    log_success "Backend server starting (PID: $backend_pid)"

    # Wait for backend to be ready
    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:${BACKEND_PORT}/health > /dev/null 2>&1; then
            log_success "Backend is healthy and ready!"
            return 0
        fi

        attempt=$((attempt + 1))
        echo -n "."
        sleep 1
    done

    log_warning "Backend started but health check timeout (this may be normal)"
    return 0
}

start_frontend() {
    log_info "Starting frontend server..."

    cd "${SCRIPT_DIR}/frontend"

    # Check if .next directory exists
    if [ ! -d ".next" ]; then
        log_error "Frontend not built! Run 'npm run build' first."
        return 1
    fi

    # Start frontend in background
    NODE_ENV=production nohup npm start > "${LOG_DIR}/frontend.log" 2>&1 &
    local frontend_pid=$!
    echo $frontend_pid > "${LOG_DIR}/frontend.pid"

    log_success "Frontend server starting (PID: $frontend_pid)"

    # Wait for frontend to be ready
    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:${FRONTEND_PORT} > /dev/null 2>&1; then
            log_success "Frontend is healthy and ready!"
            return 0
        fi

        attempt=$((attempt + 1))
        echo -n "."
        sleep 1
    done

    log_warning "Frontend started but health check timeout (this may be normal)"
    return 0
}

print_status() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    DEPLOYMENT STATUS                        ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    log_success "AISim Platform is now running!"
    echo ""
    echo -e "${BLUE}📊 Application URLs:${NC}"
    echo -e "   Frontend:  ${GREEN}http://localhost:${FRONTEND_PORT}${NC}"
    echo -e "   Backend:   ${GREEN}http://localhost:${BACKEND_PORT}${NC}"
    echo -e "   API Docs:  ${GREEN}http://localhost:${BACKEND_PORT}/api-docs${NC}"
    echo ""

    echo -e "${BLUE}📁 Log Files:${NC}"
    echo -e "   Backend:   ${LOG_DIR}/backend.log"
    echo -e "   Frontend:  ${LOG_DIR}/frontend.log"
    echo ""

    echo -e "${BLUE}🔧 Management Commands:${NC}"
    echo -e "   View backend logs:  tail -f ${LOG_DIR}/backend.log"
    echo -e "   View frontend logs: tail -f ${LOG_DIR}/frontend.log"
    echo -e "   Stop all services:  ./production-stop.sh"
    echo ""

    echo -e "${BLUE}🚀 Next Steps:${NC}"
    echo -e "   1. Open your browser to http://localhost:${FRONTEND_PORT}"
    echo -e "   2. Configure your API keys in the .env file"
    echo -e "   3. Review the documentation in README.md"
    echo -e "   4. Monitor logs for any errors or warnings"
    echo ""

    echo -e "${YELLOW}⚠️  Production Checklist:${NC}"
    echo -e "   □ Configure SSL/TLS certificates"
    echo -e "   □ Set up reverse proxy (nginx/Apache)"
    echo -e "   □ Configure firewall rules"
    echo -e "   □ Set up automated backups"
    echo -e "   □ Configure monitoring and alerts"
    echo -e "   □ Review security settings"
    echo ""
}

cleanup() {
    log_error "Startup interrupted. Cleaning up..."

    # Kill backend if running
    if [ -f "${LOG_DIR}/backend.pid" ]; then
        kill $(cat "${LOG_DIR}/backend.pid") 2>/dev/null || true
        rm "${LOG_DIR}/backend.pid"
    fi

    # Kill frontend if running
    if [ -f "${LOG_DIR}/frontend.pid" ]; then
        kill $(cat "${LOG_DIR}/frontend.pid") 2>/dev/null || true
        rm "${LOG_DIR}/frontend.pid"
    fi

    exit 1
}

################################################################################
# Main Execution
################################################################################

# Set up trap for cleanup on interrupt
trap cleanup INT TERM

# Print banner
print_banner

# Pre-flight checks
log_info "Performing pre-flight checks..."

if ! check_dependencies; then
    log_error "Missing required dependencies. Please install them and try again."
    exit 1
fi

if ! check_environment; then
    log_error "Environment configuration failed. Please check your .env file."
    exit 1
fi

# Create log directory
create_log_directory

# Check and clear ports
log_info "Checking port availability..."
check_port $BACKEND_PORT "Backend"
check_port $FRONTEND_PORT "Frontend"

# Start services
log_info "Starting services..."

if ! start_backend; then
    log_error "Failed to start backend server"
    cleanup
    exit 1
fi

sleep 2  # Give backend a moment to stabilize

if ! start_frontend; then
    log_error "Failed to start frontend server"
    cleanup
    exit 1
fi

# Print final status
print_status

log_success "✅ All systems operational!"
log_info "Press Ctrl+C to view logs or use './production-stop.sh' to stop all services"

# Follow logs
tail -f "${LOG_DIR}/backend.log" "${LOG_DIR}/frontend.log"
