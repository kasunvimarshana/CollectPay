# Manual UI Testing Guide
## Data Collection and Payment Management System
**Purpose:** Step-by-step guide for manual UI testing  
**Date:** January 8, 2026  
**Audience:** QA Testers, Product Owners, Stakeholders

---

## Prerequisites

### Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate:fresh --seed
php artisan serve
```
Backend should be running at: http://localhost:8000

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
Then select platform:
- `w` for web browser
- `a` for Android emulator
- `i` for iOS simulator

---

## Test User Accounts

After seeding, the following test accounts are available:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | admin@example.com | password | Full access |
| Manager | manager@example.com | password | Most features |
| Collector | collector@example.com | password | Collections only |
| Viewer | viewer@example.com | password | Read-only |

---

## Testing Scenarios

### Scenario 1: Authentication Flow

#### Test Case 1.1: Successful Login
**Steps:**
1. Launch the app
2. Enter email: `admin@example.com`
3. Enter password: `password`
4. Tap "Login" button

**Expected Results:**
- ✅ Loading indicator appears
- ✅ User is redirected to Home screen
- ✅ Dashboard shows navigation cards
- ✅ Sync status indicator visible

#### Test Case 1.2: Failed Login
**Steps:**
1. Launch the app
2. Enter email: `wrong@example.com`
3. Enter password: `wrongpassword`
4. Tap "Login" button

**Expected Results:**
- ✅ Loading indicator appears
- ✅ Error alert shows "Login Failed"
- ✅ User remains on login screen
- ✅ Can retry login

#### Test Case 1.3: Logout
**Steps:**
1. Login as admin
2. Navigate to profile/settings
3. Tap "Logout" button

**Expected Results:**
- ✅ User is logged out
- ✅ Redirected to login screen
- ✅ Cannot access protected screens
- ✅ Local data cleared

---

### Scenario 2: Supplier Management

#### Test Case 2.1: View Supplier List
**Steps:**
1. Login as admin
2. Tap "Suppliers" on home screen
3. Observe the list

**Expected Results:**
- ✅ List of suppliers displayed
- ✅ Each card shows: name, code, balance
- ✅ Search bar at top
- ✅ "Add Supplier" button visible
- ✅ Pagination controls at bottom
- ✅ Can pull to refresh

#### Test Case 2.2: Search Suppliers
**Steps:**
1. Go to Supplier List
2. Tap search bar
3. Type "Supplier"
4. Observe results

**Expected Results:**
- ✅ List filters as you type
- ✅ Only matching suppliers shown
- ✅ Empty state if no matches
- ✅ Clear button to reset search

#### Test Case 2.3: Create New Supplier
**Steps:**
1. Go to Supplier List
2. Tap "Add Supplier" button
3. Fill in form:
   - Name: "Test Supplier"
   - Code: "SUP001"
   - Address: "123 Test St"
   - Phone: "1234567890"
   - Email: "test@supplier.com"
4. Tap "Save"

**Expected Results:**
- ✅ Form validates inputs
- ✅ Loading indicator on save
- ✅ Success message shown
- ✅ Redirected to supplier list
- ✅ New supplier appears in list
- ✅ Balance shows 0.00

#### Test Case 2.4: Edit Supplier
**Steps:**
1. Go to Supplier List
2. Tap on a supplier card
3. Tap "Edit" button
4. Change name to "Updated Supplier"
5. Tap "Save"

**Expected Results:**
- ✅ Form pre-filled with existing data
- ✅ Can modify any field
- ✅ Save button updates record
- ✅ Returns to detail screen
- ✅ Changes visible immediately

#### Test Case 2.5: View Supplier Balance
**Steps:**
1. Create a collection for a supplier (see Scenario 5)
2. Go to Supplier Detail
3. Observe balance section

**Expected Results:**
- ✅ Balance shows correct amount
- ✅ Collections count displayed
- ✅ Payments count displayed
- ✅ Can tap to view details

---

### Scenario 3: Product Management

#### Test Case 3.1: View Product List
**Steps:**
1. Login as admin
2. Tap "Products" on home screen

**Expected Results:**
- ✅ List of products displayed
- ✅ Each card shows: name, unit, current rate
- ✅ Search functionality
- ✅ "Add Product" button
- ✅ Pagination controls

#### Test Case 3.2: Create Product with Multi-Unit
**Steps:**
1. Go to Product List
2. Tap "Add Product"
3. Fill form:
   - Name: "Test Product"
   - Description: "Test description"
   - Base Unit: Select "kg" from dropdown
4. Tap "Save"

**Expected Results:**
- ✅ Unit dropdown shows options (kg, g, lbs, liters, etc.)
- ✅ Selected unit saved correctly
- ✅ Product appears in list
- ✅ Unit displayed on product card

---

### Scenario 4: Rate Management

#### Test Case 4.1: Create Rate
**Steps:**
1. Go to Rates screen
2. Tap "Add Rate"
3. Select product
4. Enter rate: "250"
5. Select unit: "kg"
6. Select effective date: Today's date
7. Tap "Save"

**Expected Results:**
- ✅ Product selector works
- ✅ Rate accepts decimal numbers
- ✅ Date picker functional
- ✅ Unit matches product unit
- ✅ Rate saved successfully
- ✅ Version number is 1

#### Test Case 4.2: Update Rate (Creates New Version)
**Steps:**
1. Go to Rate List
2. Tap existing rate
3. Tap "Edit"
4. Change rate to "275"
5. Change effective date to tomorrow
6. Tap "Save"

**Expected Results:**
- ✅ New version created
- ✅ Old version preserved
- ✅ Version number incremented
- ✅ New rate has new effective date
- ✅ Both versions visible in history

#### Test Case 4.3: View Rate History
**Steps:**
1. Go to Rate Detail
2. Tap "View History"

**Expected Results:**
- ✅ All versions listed chronologically
- ✅ Each shows: rate, date, version
- ✅ Most recent at top
- ✅ Can see rate changes over time

---

### Scenario 5: Collection Recording

#### Test Case 5.1: Record Collection with Auto-Calculation
**Steps:**
1. Ensure a rate exists for a product
2. Go to Collections screen
3. Tap "Add Collection"
4. Select supplier
5. Select product
6. Enter quantity: "50.5"
7. Select collection date: Today
8. Observe auto-calculation

**Expected Results:**
- ✅ Supplier dropdown functional
- ✅ Product dropdown functional
- ✅ Rate automatically fetched based on date
- ✅ Total calculated: 50.5 × 250 = 12,625
- ✅ Calculation shown in real-time
- ✅ Unit displayed correctly (kg)

#### Test Case 5.2: Save Collection
**Steps:**
1. Continue from 5.1
2. Add notes: "Test collection"
3. Tap "Save"

**Expected Results:**
- ✅ Loading indicator shown
- ✅ Success message displayed
- ✅ Redirected to collection list
- ✅ New collection appears
- ✅ Supplier balance updated (+12,625)

#### Test Case 5.3: Date-Based Rate Lookup
**Steps:**
1. Create rate effective yesterday
2. Create collection with yesterday's date
3. Observe rate used

**Expected Results:**
- ✅ System fetches rate effective on that date
- ✅ Correct rate applied to calculation
- ✅ Historical accuracy maintained

---

### Scenario 6: Payment Processing

#### Test Case 6.1: Record Advance Payment
**Steps:**
1. Go to Payments screen
2. Tap "Add Payment"
3. Select supplier (with 0 balance)
4. Select payment type: "Advance"
5. Enter amount: "5000"
6. Select date: Today
7. Tap "Save"

**Expected Results:**
- ✅ Advance payment allows negative balance
- ✅ Payment saved successfully
- ✅ Supplier balance becomes -5000 (credit)

#### Test Case 6.2: Record Partial Payment
**Steps:**
1. Ensure supplier has positive balance (12,625 from collection)
2. Record advance payment first (-5000)
3. Go to Payments
4. Tap "Add Payment"
5. Select same supplier
6. Select type: "Partial"
7. Enter amount: "5000"
8. Tap "Save"

**Expected Results:**
- ✅ Current balance shown (7,625)
- ✅ Can enter amount less than or equal to balance
- ✅ Payment saved
- ✅ New balance: 7,625 - 5,000 = 2,625

#### Test Case 6.3: Record Full Payment
**Steps:**
1. Supplier with balance 2,625
2. Record payment
3. Type: "Full"
4. Amount auto-filled: 2,625
5. Tap "Save"

**Expected Results:**
- ✅ Amount auto-populated with full balance
- ✅ Can't modify amount (full payment)
- ✅ Payment saved
- ✅ Balance becomes 0.00

---

### Scenario 7: Reporting and Analytics

#### Test Case 7.1: View Reports
**Steps:**
1. Login as admin
2. Go to Reports screen
3. Scroll through all sections

**Expected Results:**
- ✅ System Overview showing counts
- ✅ Financial Summary with totals
- ✅ Supplier Balances chart
- ✅ Collections Analysis table
- ✅ Payments Analysis breakdown
- ✅ Product Performance metrics
- ✅ Monthly Trends graph
- ✅ All data loads correctly

#### Test Case 7.2: Apply Date Filters
**Steps:**
1. On Reports screen
2. Tap "Last 7 Days" button
3. Observe data changes
4. Tap "Last 30 Days"
5. Tap "Custom" and select range

**Expected Results:**
- ✅ Quick filters work instantly
- ✅ Data refreshes for selected period
- ✅ Custom date picker functional
- ✅ Reports update accordingly
- ✅ Totals recalculate correctly

#### Test Case 7.3: Export PDF
**Steps:**
1. On Reports screen with data
2. Tap "Export PDF" button
3. Wait for generation

**Expected Results:**
- ✅ Loading indicator shown
- ✅ PDF generated successfully
- ✅ Can share/save PDF
- ✅ PDF contains all report data
- ✅ PDF properly formatted

---

### Scenario 8: Role-Based Access Control

#### Test Case 8.1: Admin Access
**Steps:**
1. Login as admin@example.com
2. Navigate through all screens

**Expected Results:**
- ✅ Can access all screens
- ✅ All CRUD buttons visible
- ✅ Can manage users
- ✅ Can manage roles
- ✅ Can view all reports

#### Test Case 8.2: Manager Access
**Steps:**
1. Logout
2. Login as manager@example.com
3. Navigate through screens

**Expected Results:**
- ✅ Can access most screens
- ✅ Can perform CRUD operations
- ✅ Cannot manage users
- ✅ Cannot manage roles
- ✅ Can view reports

#### Test Case 8.3: Collector Access
**Steps:**
1. Logout
2. Login as collector@example.com
3. Try to access screens

**Expected Results:**
- ✅ Can record collections
- ✅ Can view suppliers/products
- ✅ Cannot edit suppliers/products
- ✅ Cannot access payments
- ✅ Cannot access users/roles
- ✅ Limited report access

#### Test Case 8.4: Viewer Access
**Steps:**
1. Logout
2. Login as viewer@example.com
3. Try to access screens

**Expected Results:**
- ✅ Can view all data
- ✅ No edit buttons visible
- ✅ No delete options
- ✅ Cannot create new records
- ✅ Read-only access to reports

---

### Scenario 9: Offline Functionality

#### Test Case 9.1: Offline Mode
**Steps:**
1. Login and load some data
2. Turn off network (airplane mode)
3. Navigate between screens
4. Try to create a record

**Expected Results:**
- ✅ Sync status shows offline
- ✅ Can view cached data
- ✅ Navigation still works
- ✅ Create/edit queued for sync
- ✅ User notified of offline status

#### Test Case 9.2: Auto-Sync on Reconnect
**Steps:**
1. While offline, create a collection
2. Turn network back on
3. Observe sync indicator

**Expected Results:**
- ✅ Sync status shows syncing
- ✅ Queued operations uploaded
- ✅ Sync status shows online
- ✅ Data appears on server
- ✅ No data loss

#### Test Case 9.3: Conflict Resolution
**Steps:**
1. Device A: Edit supplier name to "Name A"
2. Device A: Go offline
3. Device B: Edit same supplier to "Name B"
4. Device B: Save (goes to server)
5. Device A: Go online, try to save

**Expected Results:**
- ✅ Conflict detected
- ✅ User notified
- ✅ Server version wins (Name B)
- ✅ Local changes discarded
- ✅ User can retry if needed

---

### Scenario 10: Edge Cases

#### Test Case 10.1: Empty States
**Steps:**
1. Fresh install or clear data
2. Navigate to each list screen

**Expected Results:**
- ✅ Friendly empty state message
- ✅ Helpful illustration/icon
- ✅ Call-to-action button
- ✅ No errors or crashes

#### Test Case 10.2: Long Text
**Steps:**
1. Create supplier with very long name (500+ characters)
2. Observe in list and detail views

**Expected Results:**
- ✅ Text truncated appropriately
- ✅ Full text visible on detail
- ✅ No layout breaking
- ✅ Scrollable if needed

#### Test Case 10.3: Special Characters
**Steps:**
1. Create supplier with name: "Test & Co. <Ltd>"
2. Create product with special chars
3. Save and view

**Expected Results:**
- ✅ Special chars saved correctly
- ✅ No XSS vulnerabilities
- ✅ Display correctly in UI
- ✅ Can search with special chars

#### Test Case 10.4: Decimal Numbers
**Steps:**
1. Record collection with quantity: 50.5555
2. Observe calculation
3. View in detail

**Expected Results:**
- ✅ Decimals handled correctly
- ✅ Calculation accurate
- ✅ Proper rounding (2 decimal places)
- ✅ Currency formatted correctly

#### Test Case 10.5: Future Dates
**Steps:**
1. Try to create collection with future date
2. Try to create rate with past effective date

**Expected Results:**
- ✅ Validation prevents future collections
- ✅ Past rates allowed (for corrections)
- ✅ Clear error messages
- ✅ Can select valid dates

---

## Performance Testing

### Test Case P.1: Large Dataset
**Steps:**
1. Load app with 1000+ suppliers
2. Navigate to supplier list
3. Search, filter, paginate

**Expected Results:**
- ✅ List loads in <2 seconds
- ✅ Smooth scrolling
- ✅ Search responsive
- ✅ No lag or freezing

### Test Case P.2: Network Latency
**Steps:**
1. Simulate slow network (3G)
2. Perform operations
3. Observe loading states

**Expected Results:**
- ✅ Loading indicators shown
- ✅ UI remains responsive
- ✅ Appropriate timeouts
- ✅ Retry options available

---

## Accessibility Testing

### Test Case A.1: Screen Reader
**Steps:**
1. Enable screen reader (TalkBack/VoiceOver)
2. Navigate through screens
3. Try to complete a task

**Expected Results:**
- ✅ All elements announced
- ✅ Proper labels on inputs
- ✅ Buttons clearly identified
- ✅ Navigation logical
- ✅ Can complete tasks

### Test Case A.2: Touch Targets
**Steps:**
1. Try tapping all buttons/links
2. Measure touch target sizes

**Expected Results:**
- ✅ All targets at least 44x44 points
- ✅ Adequate spacing between targets
- ✅ Easy to tap accurately
- ✅ No mis-taps

---

## Browser/Platform Testing

### Test Matrix
| Platform | Browser/Version | Status |
|----------|----------------|--------|
| Web | Chrome Latest | To Test |
| Web | Firefox Latest | To Test |
| Web | Safari Latest | To Test |
| Android | Native | To Test |
| iOS | Native | To Test |

---

## Defect Tracking Template

When issues are found, document as follows:

**Issue ID:** [Auto-increment]  
**Severity:** Critical/High/Medium/Low  
**Screen:** [Screen name]  
**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:** [What should happen]  
**Actual Result:** [What actually happened]  
**Screenshot:** [Attach if possible]  
**Platform:** Web/Android/iOS  
**Date Found:** [Date]  
**Status:** New/In Progress/Fixed/Closed

---

## Testing Sign-off

### Completion Criteria
- [ ] All scenarios tested
- [ ] All test cases executed
- [ ] All critical defects fixed
- [ ] All medium defects triaged
- [ ] Performance acceptable
- [ ] Accessibility compliant
- [ ] All platforms tested

### Sign-off
**Tested By:** ___________________  
**Date:** ___________________  
**Status:** Pass / Fail / Pass with Issues  
**Comments:** ___________________

---

## Notes for Testers

1. **Take Your Time:** Don't rush through tests
2. **Be Creative:** Try unexpected inputs and flows
3. **Document Everything:** Screenshots help developers
4. **Think Like Users:** Use realistic scenarios
5. **Report Positives Too:** Note what works well
6. **Retest Fixes:** Verify bugs are actually fixed
7. **Check Regression:** Ensure fixes don't break other things

---

**End of Manual Testing Guide**
