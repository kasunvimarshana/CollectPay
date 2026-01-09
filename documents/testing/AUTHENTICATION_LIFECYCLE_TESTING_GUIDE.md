# Authentication Lifecycle Enhancement - Testing Guide

## Overview
This document provides comprehensive testing instructions for the enhanced authentication lifecycle, including token refresh, expiry tracking, auto-login, and session management.

## Automated Test Coverage

### Test Statistics
- **Total Tests**: 134 passing
- **New Tests Added**: 28
- **Test Files**: 11

### Test Coverage Breakdown

#### 1. AuthService Token Lifecycle Tests (17 tests)
Location: `src/application/services/__tests__/AuthService.tokenLifecycle.test.ts`

**Token Expiry Tracking (5 tests)**
- ✅ Store token expiry time on login
- ✅ Detect expired token
- ✅ Detect token about to expire (within 5-minute buffer)
- ✅ Detect valid token (not expired)
- ✅ Assume expired if no expiry stored

**Token Refresh (4 tests)**
- ✅ Successfully refresh token
- ✅ Handle refresh failure
- ✅ Handle network error during refresh
- ✅ Prevent multiple simultaneous refresh calls (singleton pattern)

**Token Validation and Refresh (4 tests)**
- ✅ Validate token without refresh if not expired
- ✅ Refresh token if expired
- ✅ Return false if no token exists
- ✅ Clear auth data if refresh fails

**Auto-login with Token Validation (3 tests)**
- ✅ Successfully auto-login with valid token
- ✅ Fail auto-login with expired token and failed refresh
- ✅ Auto-refresh expired token on auto-login

**Logout with Token Cleanup (1 test)**
- ✅ Clear token expiry on logout

#### 2. AuthContext Integration Tests (11 tests)
Location: `src/presentation/contexts/__tests__/AuthContext.integration.test.tsx`

**Complete Login Flow (1 test)**
- ✅ Handle complete login lifecycle

**Auto-login on App Start (3 tests)**
- ✅ Auto-login with valid token
- ✅ Fail auto-login with invalid token
- ✅ Auto-refresh expired token on startup

**App State Changes (2 tests)**
- ✅ Validate token when app comes to foreground
- ✅ Logout if token invalid on foreground

**401 Unauthorized Response Handling (1 test)**
- ✅ Logout on 401 unauthorized callback

**Network State Transitions (2 tests)**
- ✅ Maintain auth state during network failure
- ✅ Handle token refresh failure on network recovery

**Multiple Device Scenarios (1 test)**
- ✅ Handle token invalidated on another device

**Session Persistence (1 test)**
- ✅ Persist session across app restarts

## Manual Testing Instructions

### Prerequisites
1. Backend server running at `http://localhost:8000`
2. Frontend app running with `npm start`
3. Test user credentials:
   - Email: `admin@ledger.com`
   - Password: `password`

### Test Scenarios

#### Scenario 1: Basic Login and Auto-Login
**Objective**: Verify basic login and automatic login on app restart

**Steps**:
1. Start the app (fresh install or after logout)
2. Login with valid credentials
3. Navigate to different screens
4. Close the app completely
5. Reopen the app

**Expected Results**:
- ✅ Login succeeds and user is authenticated
- ✅ On app restart, user is automatically logged in
- ✅ Token is validated on startup (check logs for validation messages)
- ✅ User data is loaded from cache immediately
- ✅ User data is refreshed from server in background

**Verification**:
- Check AsyncStorage: `@app_token`, `@app_token_expiry`, `@app_user`
- Check logs for: "Token validation failed during auto-login" (should not appear with valid token)

---

#### Scenario 2: Token Expiry and Automatic Refresh
**Objective**: Verify automatic token refresh before expiry

**Setup**:
1. Modify `TOKEN_REFRESH_BUFFER_MS` in `AuthService.ts` to 3500000 (58 minutes)
2. Login to the app
3. Wait for token to approach expiry (normally 1 hour)

**Steps**:
1. Login to the app
2. Leave app running in foreground
3. Wait until token is within refresh buffer (for testing, modify buffer to 58 minutes)
4. Bring app to background and then foreground

**Expected Results**:
- ✅ Token is automatically refreshed when it approaches expiry
- ✅ User remains authenticated throughout
- ✅ No disruption to user experience
- ✅ Check logs for: "Token expired, attempting refresh" and "Token refreshed successfully"

**Verification**:
- Check logs for token refresh messages
- Verify `@app_token_expiry` is updated in AsyncStorage
- Verify new token is stored in `@app_token`

---

#### Scenario 3: Expired Token on App Start
**Objective**: Verify handling of expired token on app startup

**Setup**:
1. Login to the app
2. Manually modify `@app_token_expiry` in AsyncStorage to a past timestamp
   ```javascript
   // In React Native debugger or using AsyncStorage
   AsyncStorage.setItem('@app_token_expiry', Date.now() - 1000000)
   ```
3. Close and reopen the app

**Expected Results**:
- ✅ App attempts to refresh token
- ✅ If refresh succeeds, user is logged in
- ✅ If refresh fails, user is logged out
- ✅ Check logs for: "Token expired, attempting refresh"

**Verification**:
- Check logs for token validation and refresh attempts
- Verify user state in the app (authenticated or not)

---

#### Scenario 4: 401 Unauthorized Response Handling
**Objective**: Verify automatic logout on 401 responses

**Setup**:
1. Login to the app
2. On backend, invalidate the token (e.g., change JWT secret or blacklist token)
3. Perform any API action in the app

**Expected Results**:
- ✅ App receives 401 response
- ✅ User is automatically logged out
- ✅ Redirected to login screen
- ✅ Auth data is cleared from AsyncStorage
- ✅ Check logs for: "Received 401 Unauthorized response"

**Verification**:
- Verify user is logged out
- Check AsyncStorage - all auth keys should be cleared
- Verify user is on login screen

---

#### Scenario 5: App State Changes (Foreground/Background)
**Objective**: Verify token validation on app foreground

**Steps**:
1. Login to the app
2. Send app to background (home button)
3. Wait 10-30 seconds
4. Bring app back to foreground

**Expected Results**:
- ✅ Token is validated when app comes to foreground
- ✅ If token is valid, user remains authenticated
- ✅ If token is expired but can be refreshed, it's refreshed automatically
- ✅ If token can't be refreshed, user is logged out
- ✅ Check logs for: "App became active, validating token"

**Verification**:
- Check logs for token validation on app state change
- Verify user remains authenticated (or logged out if token invalid)

---

#### Scenario 6: Network Failure During Operations
**Objective**: Verify graceful handling of network failures

**Setup**:
1. Login to the app
2. Disconnect from network (airplane mode or disable WiFi)

**Steps**:
1. Navigate through the app
2. View cached data
3. Attempt operations that require network

**Expected Results**:
- ✅ User remains authenticated with cached data
- ✅ Cached data is displayed
- ✅ Operations are queued for sync when online
- ✅ No authentication errors shown
- ✅ Check logs for: "Failed to refresh user data from server"

**Verification**:
- User can view cached data
- No crashes or authentication errors
- User state is preserved

---

#### Scenario 7: Network Recovery
**Objective**: Verify token validation on network recovery

**Setup**:
1. Login to the app
2. Disconnect from network
3. Wait or modify token expiry to make it expired
4. Reconnect to network

**Steps**:
1. Start with app offline and token expired
2. Reconnect network
3. Bring app to foreground or perform an action

**Expected Results**:
- ✅ Token is validated when network recovers
- ✅ If token can be refreshed, it's refreshed automatically
- ✅ If token can't be refreshed, user is logged out
- ✅ Pending operations are synced

**Verification**:
- Check logs for token refresh attempts
- Verify sync operations complete
- Verify user authentication state

---

#### Scenario 8: Logout
**Objective**: Verify complete logout and cleanup

**Steps**:
1. Login to the app
2. Navigate to Home screen
3. Tap Logout button
4. Confirm logout in dialog

**Expected Results**:
- ✅ Logout API call is made to backend
- ✅ Even if API fails, local cleanup occurs
- ✅ User is redirected to login screen
- ✅ All auth data is cleared from AsyncStorage
- ✅ Check logs for logout process

**Verification**:
- Check AsyncStorage - all auth keys (`@app_token`, `@app_token_expiry`, `@app_user`) should be cleared
- Verify user is on login screen
- Verify cannot access protected screens without re-login

---

#### Scenario 9: Multi-Device Token Invalidation
**Objective**: Verify behavior when token is invalidated on another device

**Setup**:
1. Login on Device A
2. Login on Device B with same credentials (if backend invalidates old token)
   OR
   Logout from Device B (if backend blacklists token)

**Steps**:
1. On Device A, perform any API action
2. Observe behavior

**Expected Results**:
- ✅ Device A receives 401 response
- ✅ User is automatically logged out on Device A
- ✅ User is redirected to login screen on Device A
- ✅ Check logs for: "Received 401 Unauthorized response"

**Verification**:
- User is logged out on Device A
- User can login again successfully

---

#### Scenario 10: Session Persistence Across Restarts
**Objective**: Verify session persists correctly across multiple app restarts

**Steps**:
1. Login to the app
2. Close app completely
3. Reopen app
4. Verify auto-login
5. Close app again
6. Reopen app

**Expected Results**:
- ✅ Session persists across multiple restarts
- ✅ Token is validated each time
- ✅ User data is loaded from cache
- ✅ Token is refreshed if needed

**Verification**:
- Check logs for token validation on each startup
- Verify user remains authenticated across restarts

---

## Performance Testing

### Test Token Refresh Performance
**Objective**: Verify token refresh doesn't impact app performance

**Steps**:
1. Login to the app
2. Force token expiry
3. Perform multiple simultaneous API calls

**Expected Results**:
- ✅ Only one token refresh occurs (singleton pattern)
- ✅ All API calls wait for refresh to complete
- ✅ All API calls succeed after refresh

---

## Security Testing

### Test Token Storage Security
**Objective**: Verify tokens are stored securely

**Verification**:
- ✅ Tokens stored in AsyncStorage (device encrypted)
- ✅ No tokens in logs (in production)
- ✅ Tokens cleared on logout

### Test Token Refresh Security
**Objective**: Verify refresh mechanism is secure

**Verification**:
- ✅ Refresh endpoint requires valid token
- ✅ Failed refresh clears auth data
- ✅ 401 responses trigger logout

---

## Edge Cases to Test

### 1. Rapid App State Changes
- Quickly switch between foreground/background multiple times
- Verify no duplicate token refreshes

### 2. Poor Network Conditions
- Slow network during token refresh
- Network timeout during refresh
- Verify graceful handling

### 3. Backend Downtime
- Backend unavailable during token refresh
- Verify user experience and error handling

### 4. Invalid Token Format
- Manually corrupt token in AsyncStorage
- Verify app handles gracefully

---

## Common Issues and Troubleshooting

### Issue: "Token validation failed during auto-login" appears repeatedly
**Cause**: Token expiry not stored or token actually expired
**Solution**: 
- Verify `@app_token_expiry` exists in AsyncStorage
- Ensure backend returns `expires_in` in login response

### Issue: User logged out unexpectedly
**Cause**: Token refresh failed or 401 response
**Solution**:
- Check logs for "Token refresh failed" or "Received 401"
- Verify backend token is still valid
- Check network connectivity

### Issue: Multiple token refresh calls
**Cause**: Singleton pattern not working
**Solution**:
- Verify `refreshPromise` is properly set and cleared
- Check for race conditions in code

---

## Logs to Monitor

### Success Logs
- "Token refreshed successfully"
- "App became active, validating token"

### Warning Logs
- "Received 401 Unauthorized response"
- "Token validation failed during auto-login"
- "Failed to refresh user data from server"
- "Token expired, attempting refresh"
- "Unauthorized event received, logging out user"

### Error Logs
- "Token refresh failed"
- "Token refresh error"
- "Token validation error on app foreground"
- "Logout error"

---

## Automated Testing Commands

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- AuthService.tokenLifecycle.test.ts
npm test -- AuthContext.integration.test.tsx

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

---

## Success Criteria

✅ All 134 automated tests pass
✅ No TypeScript compilation errors
✅ Token refresh works automatically
✅ Auto-login with valid token succeeds
✅ Auto-login with expired token triggers refresh
✅ 401 responses trigger logout
✅ App state changes trigger token validation
✅ Network failures handled gracefully
✅ Session persists across app restarts
✅ Logout clears all auth data

---

## Notes for Production

1. **Token Refresh Buffer**: Currently set to 5 minutes. Adjust if needed.
2. **Logging**: Ensure sensitive data (tokens) are not logged in production.
3. **Error Handling**: All auth errors are handled gracefully with user logout.
4. **Performance**: Singleton refresh pattern prevents duplicate API calls.
5. **Security**: Tokens stored in AsyncStorage (encrypted on device).
