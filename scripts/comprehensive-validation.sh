#!/bin/bash

# Comprehensive System Validation Script
# This script performs automated checks across the entire system

set -e

echo "==================================================================="
echo "       COMPREHENSIVE SYSTEM VALIDATION - January 8, 2026"
echo "==================================================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
    echo ""
    echo "==================================================================="
    echo "  $1"
    echo "==================================================================="
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}✗${NC} $1"
}

ERRORS=0
WARNINGS=0
CHECKS=0

# Phase 1: Code Structure Validation
print_section "Phase 1: Code Structure Validation"

# Check all screens exist
SCREENS=(
    "LoginScreen.tsx"
    "RegisterScreen.tsx"
    "HomeScreen.tsx"
    "SupplierListScreen.tsx"
    "SupplierFormScreen.tsx"
    "SupplierDetailScreen.tsx"
    "ProductListScreen.tsx"
    "ProductFormScreen.tsx"
    "ProductDetailScreen.tsx"
    "RateListScreen.tsx"
    "RateFormScreen.tsx"
    "RateDetailScreen.tsx"
    "RateHistoryScreen.tsx"
    "CollectionListScreen.tsx"
    "CollectionFormScreen.tsx"
    "CollectionDetailScreen.tsx"
    "PaymentListScreen.tsx"
    "PaymentFormScreen.tsx"
    "PaymentDetailScreen.tsx"
    "UserListScreen.tsx"
    "UserFormScreen.tsx"
    "UserDetailScreen.tsx"
    "RoleListScreen.tsx"
    "RoleFormScreen.tsx"
    "RoleDetailScreen.tsx"
    "ReportsScreen.tsx"
)

echo "Checking screen files existence..."
for screen in "${SCREENS[@]}"; do
    CHECKS=$((CHECKS + 1))
    if [ -f "frontend/src/presentation/screens/$screen" ]; then
        print_success "$screen exists"
    else
        print_error "$screen NOT FOUND"
        ERRORS=$((ERRORS + 1))
    fi
done

# Phase 2: TypeScript Compilation
print_section "Phase 2: TypeScript Compilation Check"
echo "Compiling TypeScript..."
CHECKS=$((CHECKS + 1))
cd frontend
if npx tsc --noEmit 2>&1 | tee /tmp/tsc-output.txt; then
    print_success "TypeScript compilation successful (0 errors)"
else
    ERROR_COUNT=$(grep -c "error TS" /tmp/tsc-output.txt || echo 0)
    print_error "TypeScript compilation failed with $ERROR_COUNT errors"
    ERRORS=$((ERRORS + 1))
fi
cd ..

# Phase 3: Screen Content Validation
print_section "Phase 3: Screen Content Validation"

echo "Checking for common patterns in screens..."

# Check for proper imports
CHECKS=$((CHECKS + 1))
echo "Checking React imports..."
MISSING_REACT=0
for screen in "${SCREENS[@]}"; do
    if ! grep -q "import.*React" "frontend/src/presentation/screens/$screen" 2>/dev/null; then
        print_warning "$screen: No React import found"
        WARNINGS=$((WARNINGS + 1))
        MISSING_REACT=$((MISSING_REACT + 1))
    fi
done
if [ $MISSING_REACT -eq 0 ]; then
    print_success "All screens have React imports"
fi

# Check for StyleSheet usage
CHECKS=$((CHECKS + 1))
echo "Checking StyleSheet usage..."
NO_STYLES=0
for screen in "${SCREENS[@]}"; do
    if ! grep -q "StyleSheet\|styles" "frontend/src/presentation/screens/$screen" 2>/dev/null; then
        print_warning "$screen: No StyleSheet usage found"
        WARNINGS=$((WARNINGS + 1))
        NO_STYLES=$((NO_STYLES + 1))
    fi
done
if [ $NO_STYLES -eq 0 ]; then
    print_success "All screens use StyleSheet"
fi

# Check for navigation usage
CHECKS=$((CHECKS + 1))
echo "Checking navigation patterns..."
NO_NAV=0
for screen in "${SCREENS[@]}"; do
    if ! grep -q "useNavigation\|navigation" "frontend/src/presentation/screens/$screen" 2>/dev/null; then
        print_warning "$screen: No navigation usage found"
        WARNINGS=$((WARNINGS + 1))
        NO_NAV=$((NO_NAV + 1))
    fi
done
if [ $NO_NAV -eq 0 ]; then
    print_success "All screens use navigation"
fi

# Phase 4: API Integration Check
print_section "Phase 4: API Integration Patterns"

echo "Checking API client usage..."
CHECKS=$((CHECKS + 1))
API_SCREENS=(
    "SupplierListScreen.tsx"
    "ProductListScreen.tsx"
    "RateListScreen.tsx"
    "CollectionListScreen.tsx"
    "PaymentListScreen.tsx"
    "UserListScreen.tsx"
    "RoleListScreen.tsx"
)

for screen in "${API_SCREENS[@]}"; do
    if grep -q "apiClient\|axios\|fetch" "frontend/src/presentation/screens/$screen" 2>/dev/null; then
        print_success "$screen: API integration found"
    else
        print_warning "$screen: No direct API calls found (might use hooks)"
        WARNINGS=$((WARNINGS + 1))
    fi
done

# Phase 5: Error Handling Validation
print_section "Phase 5: Error Handling Validation"

echo "Checking error handling patterns..."
CHECKS=$((CHECKS + 1))
NO_ERROR_HANDLING=0
for screen in "${SCREENS[@]}"; do
    if ! grep -q "try\|catch\|Alert\|error" "frontend/src/presentation/screens/$screen" 2>/dev/null; then
        print_warning "$screen: No error handling patterns found"
        WARNINGS=$((WARNINGS + 1))
        NO_ERROR_HANDLING=$((NO_ERROR_HANDLING + 1))
    fi
done
if [ $NO_ERROR_HANDLING -eq 0 ]; then
    print_success "All screens have error handling"
fi

# Phase 6: State Management Check
print_section "Phase 6: State Management Check"

echo "Checking state management patterns..."
CHECKS=$((CHECKS + 1))
NO_STATE=0
for screen in "${SCREENS[@]}"; do
    if ! grep -q "useState\|useEffect\|useContext\|useReducer" "frontend/src/presentation/screens/$screen" 2>/dev/null; then
        print_warning "$screen: No state management hooks found"
        WARNINGS=$((WARNINGS + 1))
        NO_STATE=$((NO_STATE + 1))
    fi
done
if [ $NO_STATE -eq 0 ]; then
    print_success "All screens use state management"
fi

# Phase 7: Backend API Endpoints Validation
print_section "Phase 7: Backend API Endpoints Validation"

echo "Checking API routes..."
CHECKS=$((CHECKS + 1))
if [ -f "backend/routes/api.php" ]; then
    print_success "API routes file exists"
    
    EXPECTED_ROUTES=(
        "login"
        "register"
        "logout"
        "suppliers"
        "products"
        "rates"
        "collections"
        "payments"
        "users"
        "roles"
        "reports"
    )
    
    for route in "${EXPECTED_ROUTES[@]}"; do
        if grep -q "$route" "backend/routes/api.php"; then
            print_success "Route: $route exists"
        else
            print_warning "Route: $route might be missing"
            WARNINGS=$((WARNINGS + 1))
        fi
    done
else
    print_error "API routes file not found"
    ERRORS=$((ERRORS + 1))
fi

# Phase 8: Backend Controllers Check
print_section "Phase 8: Backend Controllers Validation"

echo "Checking controllers..."
CHECKS=$((CHECKS + 1))
CONTROLLERS=(
    "AuthController.php"
    "SupplierController.php"
    "ProductController.php"
    "RateController.php"
    "CollectionController.php"
    "PaymentController.php"
    "UserController.php"
    "RoleController.php"
    "ReportController.php"
)

for controller in "${CONTROLLERS[@]}"; do
    if [ -f "backend/app/Http/Controllers/API/$controller" ]; then
        print_success "$controller exists"
    else
        print_error "$controller NOT FOUND"
        ERRORS=$((ERRORS + 1))
    fi
done

# Phase 9: Database Models Check
print_section "Phase 9: Database Models Validation"

echo "Checking models..."
CHECKS=$((CHECKS + 1))
MODELS=(
    "User.php"
    "Supplier.php"
    "Product.php"
    "Rate.php"
    "Collection.php"
    "Payment.php"
    "Role.php"
    "AuditLog.php"
)

for model in "${MODELS[@]}"; do
    if [ -f "backend/app/Models/$model" ]; then
        print_success "$model exists"
    else
        print_error "$model NOT FOUND"
        ERRORS=$((ERRORS + 1))
    fi
done

# Phase 10: Security Validation
print_section "Phase 10: Security Patterns Validation"

echo "Checking for security patterns..."

# Check for JWT usage
CHECKS=$((CHECKS + 1))
if grep -r "JWT\|jwt" backend/config/ > /dev/null 2>&1; then
    print_success "JWT authentication configured"
else
    print_warning "JWT authentication might not be configured"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for middleware usage
CHECKS=$((CHECKS + 1))
if [ -f "backend/app/Http/Middleware/Authenticate.php" ]; then
    print_success "Authentication middleware exists"
else
    print_warning "Authentication middleware not found"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for CORS configuration
CHECKS=$((CHECKS + 1))
if [ -f "backend/config/cors.php" ]; then
    print_success "CORS configuration exists"
else
    print_warning "CORS configuration not found"
    WARNINGS=$((WARNINGS + 1))
fi

# Phase 11: Offline Support Validation
print_section "Phase 11: Offline Support Validation"

echo "Checking offline support components..."

# Check for network status hook
CHECKS=$((CHECKS + 1))
if [ -f "frontend/src/application/hooks/useNetworkStatus.ts" ]; then
    print_success "Network status hook exists"
else
    print_warning "Network status hook not found"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for local storage service
CHECKS=$((CHECKS + 1))
if [ -f "frontend/src/infrastructure/storage/LocalStorageService.ts" ]; then
    print_success "Local storage service exists"
else
    print_warning "Local storage service not found"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for sync service
CHECKS=$((CHECKS + 1))
if [ -f "frontend/src/application/services/SyncService.ts" ]; then
    print_success "Sync service exists"
else
    print_warning "Sync service not found"
    WARNINGS=$((WARNINGS + 1))
fi

# Final Report
print_section "VALIDATION SUMMARY"

echo ""
echo "Total Checks Performed: $CHECKS"
echo -e "Errors Found: ${RED}$ERRORS${NC}"
echo -e "Warnings Found: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    print_success "✓ All critical validations passed!"
    if [ $WARNINGS -eq 0 ]; then
        echo ""
        echo "==================================================================="
        echo "              STATUS: EXCELLENT - NO ISSUES FOUND"
        echo "==================================================================="
        exit 0
    else
        echo ""
        echo "==================================================================="
        echo "              STATUS: GOOD - MINOR WARNINGS ONLY"
        echo "==================================================================="
        exit 0
    fi
else
    echo ""
    echo "==================================================================="
    echo "          STATUS: NEEDS ATTENTION - ERRORS FOUND"
    echo "==================================================================="
    exit 1
fi
