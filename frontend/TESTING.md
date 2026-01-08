# Frontend Testing Guide

## Automated Testing

### Quick Start
```bash
cd frontend
npm test                    # Run all automated tests
npm run test:coverage      # Run tests with coverage report
npm run test:watch         # Run tests in watch mode
```

### Current Test Coverage
- **84 automated tests** covering:
  - Authentication services
  - Conflict resolution
  - UI components (Pagination, SortButton, Loading, ErrorMessage, EmptyState)
  - AuthContext state management

### Documentation
- See **TESTING_QUICK_START.md** for automated testing guide
- See **TESTING_IMPLEMENTATION.md** for detailed test report
- Continue below for manual testing procedures

---

## Manual Testing Strategy

This document outlines the testing approach for the React Native (Expo) frontend of the Data Collection and Payment Management System.

## Pre-Testing Setup

### Backend Setup
```bash
cd backend

# Ensure database exists
touch database/database.sqlite

# Run migrations and seeders
php artisan migrate:fresh --seed --force

# Start server (choose an available port)
php artisan serve --host=127.0.0.1 --port=8001
```

### Frontend Setup
```bash
cd frontend

# Install dependencies (if not already done)
npm install

# Configure environment
# Edit .env file and set:
# EXPO_PUBLIC_API_URL=http://127.0.0.1:8001/api (for emulator)
# EXPO_PUBLIC_API_URL=http://YOUR_IP:8001/api (for physical device)

# Start Expo development server
npm start
```

## Test Categories

### 1. Architecture & Code Quality ✅

**Objective:** Verify Clean Architecture boundaries and code quality

**Tests:**
- [x] TypeScript compilation (0 errors)
- [x] Dependency audit (0 vulnerabilities)
- [x] No circular dependencies
- [x] Layer dependency rules enforced
- [x] All imports follow correct patterns

**Commands:**
```bash
cd frontend
npx tsc --noEmit
npm audit
```

**Expected Result:** All checks pass ✅

---

### 2. Authentication Flow

**Objective:** Verify user authentication works end-to-end

**Test Cases:**

#### 2.1 User Registration
1. Open app (should show Login screen)
2. Tap "Register" link
3. Fill in registration form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "Password123!"
   - Confirm Password: "Password123!"
4. Tap "Register" button
5. **Expected:** Registration successful, redirected to Home screen

#### 2.2 User Login
1. If logged in, logout first
2. Enter credentials:
   - Email: "admin@ledger.com"
   - Password: "password"
3. Tap "Login" button
4. **Expected:** Login successful, redirected to Home screen with user name displayed

#### 2.3 Token Persistence
1. Login successfully
2. Close the app completely
3. Reopen the app
4. **Expected:** User remains logged in (no login screen shown)

#### 2.4 Logout
1. From Home screen, tap logout button
2. **Expected:** Redirected to Login screen

**Default Test Users (from seeder):**
- Admin: `admin@ledger.com` / `password`
- Collector: `collector@ledger.com` / `password`

---

### 3. RBAC/ABAC Access Control

**Objective:** Verify role-based access control works correctly

**Test Cases:**

#### 3.1 Admin Role (Full Access)
1. Login as admin@ledger.com
2. **Expected on Home Screen:**
   - See all menu items (Suppliers, Products, Collections, Payments, Users, Roles, Reports)
   - Sync status indicator visible
3. Navigate to each screen
4. **Expected:** Can access all CRUD operations

#### 3.2 Collector Role (Limited Access)
1. Logout and login as collector@ledger.com
2. **Expected on Home Screen:**
   - See only: Suppliers, Products, Collections, Payments
   - NO access to Users, Roles
3. Navigate to Supplier List
4. **Expected:** Can view, create, edit suppliers
5. Try to navigate to User List (if accessible)
6. **Expected:** Should not see this menu item or get permission denied

#### 3.3 Permission-Based UI
1. Login as admin
2. Navigate to Supplier List
3. **Expected:** "Add Supplier" button visible
4. Logout, login as viewer (if exists)
5. Navigate to Supplier List
6. **Expected:** "Add Supplier" button hidden or disabled

---

### 4. Supplier Management (CRUD)

**Objective:** Verify complete supplier lifecycle

#### 4.1 List Suppliers
1. Login and navigate to Supplier List
2. **Expected:** 
   - List of suppliers displayed
   - Pagination controls visible
   - Search box present
   - Sort buttons for columns

#### 4.2 Search Suppliers
1. In Supplier List, enter "Tea" in search box
2. Wait 500ms (debounce)
3. **Expected:** Filtered results showing only suppliers matching "Tea"
4. Clear search
5. **Expected:** All suppliers displayed again

#### 4.3 Sort Suppliers
1. Tap sort button on "Name" column
2. **Expected:** 
   - Suppliers sorted alphabetically by name (ascending)
   - Arrow indicator shows ascending
3. Tap again
4. **Expected:** 
   - Suppliers sorted reverse alphabetically (descending)
   - Arrow indicator shows descending

#### 4.4 Paginate Suppliers
1. If suppliers span multiple pages, tap "Next" button
2. **Expected:** Page 2 displayed with next set of suppliers
3. Tap "Previous" button
4. **Expected:** Back to page 1

#### 4.5 Create Supplier
1. Tap "Add Supplier" button
2. Fill in form:
   - Code: "SUP001"
   - Name: "Test Supplier"
   - Contact Person: "John Doe"
   - Phone: "+1234567890"
   - Region: "North"
3. Tap "Save"
4. **Expected:** 
   - Success message displayed
   - Redirected to Supplier Detail or List
   - New supplier appears in list

#### 4.6 View Supplier Details
1. From Supplier List, tap on a supplier
2. **Expected:** 
   - Supplier Detail screen displayed
   - All supplier information visible
   - Edit and Delete buttons visible (if permitted)

#### 4.7 Edit Supplier
1. From Supplier Detail, tap "Edit" button
2. Change name to "Updated Supplier Name"
3. Tap "Save"
4. **Expected:** 
   - Success message
   - Supplier detail updated
   - Change reflected in list

#### 4.8 Delete Supplier
1. From Supplier Detail, tap "Delete" button
2. **Expected:** Confirmation dialog appears
3. Tap "Confirm"
4. **Expected:** 
   - Success message
   - Redirected to Supplier List
   - Supplier no longer in list (soft deleted)

---

### 5. Product Management (with Rates)

**Objective:** Verify product and rate versioning

#### 5.1 Create Product
1. Navigate to Product List
2. Tap "Add Product"
3. Fill in form:
   - Code: "PROD001"
   - Name: "Tea Leaves"
   - Base Unit: "kg"
   - Current Rate: "250.00"
   - Effective Date: (today's date)
4. Tap "Save"
5. **Expected:** Product created with initial rate

#### 5.2 View Rate History
1. From Product Detail, tap "Rate History" button
2. **Expected:** 
   - List of historical rates displayed
   - Most recent rate at top
   - Each rate shows effective date and amount

#### 5.3 Add New Rate
1. From Product Detail or Rate History, tap "Add Rate"
2. Enter new rate: "275.00"
3. Set effective date: (future date)
4. Tap "Save"
5. **Expected:** 
   - New rate added to history
   - Product shows current rate is still old rate until effective date

#### 5.4 Multi-Unit Support
1. Create product with base_unit = "kg"
2. View product details
3. **Expected:** Can record collections in kg, g, lbs, etc.

---

### 6. Collection Management

**Objective:** Verify collection recording with calculations

#### 6.1 Record Collection
1. Navigate to Collection List
2. Tap "Add Collection"
3. Fill in form:
   - Supplier: Select "Test Supplier"
   - Product: Select "Tea Leaves"
   - Date: (today)
   - Quantity: "50.5"
   - Unit: "kg"
4. **Expected:** 
   - Current rate loaded automatically
   - Amount calculated automatically (e.g., 50.5 × 250 = 12,625)
5. Tap "Save"
6. **Expected:** 
   - Collection saved
   - Amount matches calculation

#### 6.2 View Collection Details
1. From Collection List, tap on a collection
2. **Expected:** 
   - All details displayed
   - Supplier name, product name visible
   - Quantity, unit, rate, amount correct

#### 6.3 Edit Collection
1. From Collection Detail, tap "Edit"
2. Change quantity to "55.0"
3. **Expected:** Amount recalculated (55 × 250 = 13,750)
4. Tap "Save"
5. **Expected:** Updated collection saved with new amount

---

### 7. Payment Management

**Objective:** Verify payment recording and balance tracking

#### 7.1 Record Advance Payment
1. Navigate to Payment List
2. Tap "Add Payment"
3. Fill in form:
   - Supplier: Select supplier with collections
   - Payment Type: "Advance"
   - Amount: "5,000"
   - Date: (today)
4. Tap "Save"
5. **Expected:** Advance payment recorded

#### 7.2 Record Partial Payment
1. Add another payment for same supplier
2. Payment Type: "Partial"
3. Amount: "3,000"
4. **Expected:** Partial payment recorded

#### 7.3 View Balance
1. Navigate to Supplier Detail
2. **Expected:** 
   - Balance section displayed
   - Total Collections amount shown
   - Total Payments amount shown
   - Outstanding Balance = Collections - Payments
   - Example: 12,625 - 8,000 = 4,625

#### 7.4 Verify Balance Calculation
1. Add more collections for the supplier
2. Add more payments
3. Navigate to Supplier Detail again
4. **Expected:** Balance updated correctly with all transactions

---

### 8. Server-Side Operations

**Objective:** Verify pagination, sorting, filtering work with backend

#### 8.1 Server-Side Pagination
1. Navigate to any list screen (Suppliers, Products, Collections, Payments)
2. Observe network request in logs
3. **Expected:** Request includes `?page=1&per_page=10`
4. Navigate to page 2
5. **Expected:** Request includes `?page=2&per_page=10`
6. **Verify:** Only 10 items displayed per page (server controls limit)

#### 8.2 Server-Side Sorting
1. Tap sort button on a column
2. Observe network request
3. **Expected:** Request includes `?sort_by=name&sort_order=asc`
4. Tap again
5. **Expected:** Request includes `?sort_by=name&sort_order=desc`
6. **Verify:** Results reordered by server, not client

#### 8.3 Server-Side Filtering
1. Enter search term "Test"
2. Wait 500ms (debounce)
3. Observe network request
4. **Expected:** Request includes `?search=Test`
5. **Verify:** Server returns filtered results

#### 8.4 Combined Operations
1. Search for "Tea"
2. Sort by date descending
3. Navigate to page 2
4. **Expected:** Request includes `?search=Tea&sort_by=created_at&sort_order=desc&page=2`

---

### 9. Offline Support

**Objective:** Verify offline functionality and synchronization

#### 9.1 Offline Data Access
1. Login and load some data (suppliers, products)
2. Turn off network (airplane mode or disable WiFi)
3. Navigate through previously loaded screens
4. **Expected:** Can still view cached data

#### 9.2 Offline Create Operation
1. While offline, try to create a new supplier
2. Fill in form and tap "Save"
3. **Expected:** 
   - Operation queued for sync
   - "Pending sync" indicator shown
   - Item appears in local list

#### 9.3 Offline Edit Operation
1. While offline, edit an existing supplier
2. Tap "Save"
3. **Expected:** 
   - Changes queued for sync
   - "Pending sync" indicator shown

#### 9.4 Automatic Synchronization
1. Turn network back on
2. **Expected:** 
   - Sync status indicator shows "Syncing..."
   - Queued operations sent to server
   - Sync completes successfully
   - Status shows "Synced"

#### 9.5 Manual Sync
1. Create some offline changes
2. Turn network back on
3. Tap sync button on Home screen or sync indicator
4. **Expected:** 
   - Manual sync triggered
   - All pending changes uploaded
   - Success message displayed

---

### 10. Conflict Resolution

**Objective:** Verify multi-device conflict handling

#### 10.1 Simulate Concurrent Edit (Requires 2 Devices)
**Device 1:**
1. Load Supplier Detail (e.g., Supplier ID 1, version 1)
2. Tap Edit

**Device 2:**
1. Load same Supplier Detail (Supplier ID 1, version 1)
2. Tap Edit
3. Change name to "Device 2 Update"
4. Tap Save
5. **Expected:** Save successful, version incremented to 2

**Device 1 (continued):**
1. Change name to "Device 1 Update"
2. Tap Save
3. **Expected:** 
   - HTTP 409 Conflict response
   - Conflict notification displayed
   - "Server data is newer" message
   - Option to "View Details" or "Refresh"
4. Tap "Refresh"
5. **Expected:** 
   - Local data replaced with server data (Device 2's changes)
   - Version updated to 2

#### 10.2 Server-Authoritative Resolution
1. After conflict, verify local data matches server
2. **Expected:** Server data always wins (no data loss)

---

### 11. Data Integrity

**Objective:** Verify no duplication or corruption

#### 11.1 No Duplicate Records
1. Create a supplier
2. Quickly tap "Save" multiple times
3. **Expected:** Only one supplier created (duplicate prevention)

#### 11.2 Validation Enforcement
1. Try to create supplier with missing required fields
2. **Expected:** Validation errors displayed, save prevented

#### 11.3 Referential Integrity
1. Try to delete a supplier that has collections
2. **Expected:** 
   - Error or warning displayed
   - Delete prevented or soft delete performed
   - Collections still reference supplier

---

### 12. UX & Consistency

**Objective:** Verify consistent user experience

#### 12.1 Loading States
1. Perform any operation that requires network
2. **Expected:** Loading indicator displayed during operation

#### 12.2 Error Handling
1. Disconnect network and try to create a record
2. **Expected:** 
   - Clear error message displayed
   - Option to retry or queue for sync

#### 12.3 Empty States
1. Navigate to a list screen with no data
2. **Expected:** Empty state message displayed (not blank screen)

#### 12.4 Success Feedback
1. Successfully create/update/delete a record
2. **Expected:** Success message or toast notification displayed

#### 12.5 Navigation Flow
1. Navigate from Home → Supplier List → Supplier Detail → Edit → Save
2. **Expected:** Smooth navigation, proper back button behavior

---

## Test Execution Checklist

### Phase 1: Pre-Testing
- [ ] Backend server running
- [ ] Frontend env configured
- [ ] Test credentials available
- [ ] Database seeded with test data

### Phase 2: Core Functionality
- [ ] Authentication (Login, Register, Logout)
- [ ] RBAC/ABAC (Admin, Collector roles)
- [ ] Supplier CRUD
- [ ] Product CRUD with rates
- [ ] Collection CRUD with calculations
- [ ] Payment CRUD with balance

### Phase 3: Advanced Features
- [ ] Server-side pagination
- [ ] Server-side sorting
- [ ] Server-side filtering
- [ ] Debounced search

### Phase 4: Offline & Sync
- [ ] Offline data access
- [ ] Offline CRUD operations
- [ ] Automatic sync on reconnection
- [ ] Manual sync trigger
- [ ] Sync status indicators

### Phase 5: Multi-Device
- [ ] Concurrent edits
- [ ] Conflict detection
- [ ] Conflict resolution
- [ ] Version tracking

### Phase 6: Data Quality
- [ ] No duplicates
- [ ] Validation works
- [ ] Referential integrity
- [ ] Calculation accuracy

### Phase 7: UX Polish
- [ ] Loading states
- [ ] Error messages
- [ ] Empty states
- [ ] Success feedback
- [ ] Navigation flows

---

## Known Issues & Limitations

### Current Limitations
1. **Expo Go vs. Development Build:** Some features (like SQLite) work better in development builds
2. **Network Detection:** May have delays detecting network state changes
3. **Background Sync:** Sync occurs only when app is active

### Reported Bugs
- None currently reported

---

## Performance Benchmarks

### Expected Performance
- **List Screen Load:** < 2 seconds
- **Form Save:** < 1 second
- **Search Debounce:** 500ms
- **Sync Operation:** < 5 seconds for 10 items
- **Initial Load:** < 3 seconds

### Performance Issues to Watch
- Large list rendering (100+ items)
- Image loading (if implemented)
- Complex calculations
- Database query performance

---

## Test Reports

### Template for Bug Reports

**Bug Title:** [Brief description]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**

**Actual Behavior:**

**Environment:**
- Device: [iOS/Android, Physical/Emulator]
- OS Version:
- App Version:
- Backend URL:

**Screenshots:** [If applicable]

**Logs:** [Console output]

---

## Automated Testing (Future)

### Recommended Tools
- **Jest:** Unit testing
- **React Native Testing Library:** Component testing
- **Detox:** E2E testing
- **Maestro:** Mobile UI testing

### Test Coverage Goals
- Unit Tests: 80%+
- Integration Tests: 60%+
- E2E Tests: Critical paths covered

---

**Last Updated:** 2025-12-30  
**Version:** 1.0.0  
**Status:** Ready for testing
