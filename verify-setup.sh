#!/bin/bash

# CollectPay Setup Verification Script
# This script checks if all dependencies and requirements are met

echo "=================================="
echo "CollectPay Setup Verification"
echo "=================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
ALL_CHECKS_PASSED=true

# Function to check command existence
check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is NOT installed"
        ALL_CHECKS_PASSED=false
        return 1
    fi
}

# Function to check version
check_version() {
    local cmd=$1
    local version_cmd=$2
    local min_version=$3
    
    if command -v "$cmd" &> /dev/null; then
        local current_version=$("$version_cmd" 2>&1)
        echo -e "${GREEN}✓${NC} $cmd version: $current_version"
        return 0
    else
        echo -e "${RED}✗${NC} $cmd is NOT installed"
        ALL_CHECKS_PASSED=false
        return 1
    fi
}

echo "Checking Backend Requirements..."
echo "--------------------------------"

# Check PHP
if check_command php; then
    check_version php "php -v | head -n 1" "8.2"
fi

# Check Composer
check_command composer

# Check MySQL/MariaDB
if ! check_command mysql && ! check_command mariadb; then
    echo -e "${YELLOW}⚠${NC} MySQL/MariaDB client not found. Database server may still be accessible."
fi

echo ""
echo "Checking Frontend Requirements..."
echo "--------------------------------"

# Check Node.js
if check_command node; then
    check_version node "node -v" "18"
fi

# Check npm
if check_command npm; then
    check_version npm "npm -v" "9"
fi

# Check Expo CLI
if check_command expo; then
    echo -e "${GREEN}✓${NC} Expo CLI is installed"
else
    echo -e "${YELLOW}⚠${NC} Expo CLI not found globally. Will be available via npx."
fi

echo ""
echo "Checking Project Structure..."
echo "--------------------------------"

# Check backend files
if [ -f "backend/composer.json" ]; then
    echo -e "${GREEN}✓${NC} Backend composer.json exists"
else
    echo -e "${RED}✗${NC} Backend composer.json NOT found"
    ALL_CHECKS_PASSED=false
fi

if [ -f "backend/.env.example" ]; then
    echo -e "${GREEN}✓${NC} Backend .env.example exists"
else
    echo -e "${RED}✗${NC} Backend .env.example NOT found"
    ALL_CHECKS_PASSED=false
fi

# Check frontend files
if [ -f "frontend/package.json" ]; then
    echo -e "${GREEN}✓${NC} Frontend package.json exists"
else
    echo -e "${RED}✗${NC} Frontend package.json NOT found"
    ALL_CHECKS_PASSED=false
fi

if [ -f "frontend/app.json" ]; then
    echo -e "${GREEN}✓${NC} Frontend app.json exists"
else
    echo -e "${RED}✗${NC} Frontend app.json NOT found"
    ALL_CHECKS_PASSED=false
fi

# Check migrations
if [ -d "backend/database/migrations" ]; then
    migration_count=$(ls -1 backend/database/migrations/*.php 2>/dev/null | wc -l)
    if [ $migration_count -gt 0 ]; then
        echo -e "${GREEN}✓${NC} Found $migration_count migration files"
    else
        echo -e "${RED}✗${NC} No migration files found"
        ALL_CHECKS_PASSED=false
    fi
else
    echo -e "${RED}✗${NC} Migrations directory not found"
    ALL_CHECKS_PASSED=false
fi

echo ""
echo "Checking Backend Dependencies..."
echo "--------------------------------"

if [ -d "backend/vendor" ]; then
    echo -e "${GREEN}✓${NC} Backend vendor directory exists (dependencies installed)"
else
    echo -e "${YELLOW}⚠${NC} Backend vendor directory not found. Run: cd backend && composer install"
fi

echo ""
echo "Checking Frontend Dependencies..."
echo "--------------------------------"

if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Frontend node_modules exists (dependencies installed)"
else
    echo -e "${YELLOW}⚠${NC} Frontend node_modules not found. Run: cd frontend && npm install"
fi

echo ""
echo "Checking Configuration Files..."
echo "--------------------------------"

if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Backend .env file exists"
else
    echo -e "${YELLOW}⚠${NC} Backend .env file not found. Run: cd backend && cp .env.example .env"
fi

if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✓${NC} docker-compose.yml exists"
else
    echo -e "${YELLOW}⚠${NC} docker-compose.yml not found"
fi

echo ""
echo "=================================="
echo "Verification Summary"
echo "=================================="

if [ "$ALL_CHECKS_PASSED" = true ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Set up backend: cd backend && composer install && cp .env.example .env"
    echo "2. Configure database in backend/.env"
    echo "3. Run migrations: cd backend && php artisan migrate"
    echo "4. Set up frontend: cd frontend && npm install"
    echo "5. Start backend: cd backend && php artisan serve"
    echo "6. Start frontend: cd frontend && npm start"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please install missing requirements.${NC}"
    echo ""
    echo "Installation guides:"
    echo "- PHP 8.2+: https://www.php.net/downloads"
    echo "- Composer: https://getcomposer.org/download/"
    echo "- Node.js 18+: https://nodejs.org/"
    echo "- MySQL 8.0+: https://dev.mysql.com/downloads/"
    exit 1
fi
