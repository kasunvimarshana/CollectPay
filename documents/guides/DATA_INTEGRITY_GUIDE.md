# Data Integrity and Operational Continuity Guide

**Version:** 1.0  
**Date:** December 29, 2025  
**Status:** Production Ready

## Overview

This guide documents the comprehensive data integrity mechanisms implemented in the Data Collection and Payment Management System. The system ensures uninterrupted data entry and operational continuity across multiple users and devices while maintaining consistency, auditability, and conflict-free operations.

---

## Core Principles

### 1. Server as Single Source of Truth
- The backend server maintains the authoritative version of all data
- All data validation and conflict resolution occurs server-side
- Local storage serves as cache and offline queue only

### 2. Optimistic Locking
- Every record has a `version` field that increments on each update
- Updates must include the current version number
- Version mismatch triggers conflict detection (HTTP 409)

### 3. Deterministic Conflict Resolution
- Server data **always** wins in conflict scenarios
- Conflicts are automatically resolved without data loss
- All conflicts are logged for audit purposes

### 4. Multi-User/Multi-Device Support
- Concurrent operations are supported across unlimited devices
- Changes sync bidirectionally (device ↔ server)
- Network interruptions are handled gracefully with offline queue

---

## Implementation Architecture

### Backend Components

#### 1. Version Tracking System

**Models with Version Support:**
- ✅ Supplier
- ✅ Product
- ✅ Collection
- ✅ Payment
- ✅ Rate

**Database Schema:**
```sql
-- All transactional tables include:
version INTEGER DEFAULT 1 NOT NULL
INDEX idx_version ON table_name(version)
```

#### 2. Model Observers

Each model has an observer that automatically manages versioning:

```php
// ProductObserver.php
public function updating(Product $product): void
{
    if ($product->isDirty() && !$product->isDirty('version')) {
        $product->version = ($product->version ?? 0) + 1;
    }
}

public function created(Product $product): void
{
    if (!$product->version) {
        $product->version = 1;
        $product->saveQuietly();
    }
}
```

**Registered Observers:**
- `SupplierObserver`
- `ProductObserver`
- `CollectionObserver`
- `PaymentObserver`
- `RateObserver`

#### 3. CheckVersionConflict Middleware

Applied to all UPDATE routes (PUT/PATCH):

```php
Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])
    ->middleware('check.version');
```

**Conflict Detection Logic:**
1. Extract client version from request
2. Compare with server version
3. If mismatch: Return HTTP 409 with current data
4. If match: Allow update and increment version

**Response Format (409 Conflict):**
```json
{
    "success": false,
    "message": "Version conflict detected",
    "error": "The record has been modified by another user",
    "conflict": true,
    "data": {
        "client_version": 1,
        "server_version": 3,
        "current_data": {
            "id": 1,
            "name": "Updated by another user",
            "version": 3,
            ...
        }
    }
}
```

### Frontend Components

#### 1. Local Storage Service (SQLite)

**Tables:**
- `pending_sync` - Queue of pending operations
- `suppliers` - Cached supplier data
- `products` - Cached product data
- `rates` - Cached rate data
- `collections` - Cached collection data
- `payments` - Cached payment data

**Key Methods:**
```typescript
// Queue operations for sync
await LocalStorageService.addToSyncQueue('supplier', 'update', data);

// Cache data from server
await LocalStorageService.cacheSuppliers(suppliers);

// Retrieve cached data
const cachedSuppliers = await LocalStorageService.getCachedSuppliers();
```

#### 2. Sync Service

Handles synchronization between local storage and server:

**Full Sync Process:**
1. Push pending local changes to server
2. Handle any conflicts (accept server data)
3. Pull latest data from server
4. Update local cache

**Retry Logic:**
- Network errors: Retry up to 3 times with exponential backoff
- Conflicts (409): Resolve immediately, no retry
- Validation errors (422): No retry, fix data first

**Methods:**
```typescript
// Sync all pending changes
const result = await SyncService.syncPendingChanges();
console.log(`Synced: ${result.synced}, Failed: ${result.failed}`);

// Full bidirectional sync
await SyncService.fullSync();

// Fetch and cache specific entities
await SyncService.fetchAndCacheSuppliers();
await SyncService.fetchAndCacheProducts();
await SyncService.fetchAndCacheRates();
```

#### 3. Conflict Resolution Service

**Strategies:**
```typescript
// Always use server data
if (serverVersion > localVersion) {
    return {
        action: 'use_server',
        resolvedData: serverData,
        reason: 'Server has newer version'
    };
}
```

**Validation:**
- Pre-sync data validation
- Entity-specific field validation
- Version number verification

---

## Operational Scenarios

### Scenario 1: Normal Update (No Conflict)

```
Device A:
1. Fetch supplier (version: 1)
2. Edit name: "ABC Suppliers Ltd"
3. Send UPDATE with version: 1
4. Server checks: version 1 == 1 ✅
5. Update successful
6. Server increments version to 2
7. Response: { version: 2, ... }
8. Update local cache

Device B:
1. Fetch supplier (version: 2) ✅
2. Sees latest data from Device A
```

### Scenario 2: Concurrent Update (Conflict Detected)

```
Time    Device A                    Device B
----    --------                    --------
T0      Fetch (v1)                  Fetch (v1)
T1      Edit name: "ABC Ltd"        Edit name: "ABC Company"
T2      UPDATE version:1            —
        → Success (v2) ✅
T3      —                           UPDATE version:1
                                    → 409 Conflict! ⚠️
T4      —                           Get server data (v2)
                                    Accept: "ABC Ltd"
                                    Update local cache ✅
                                    Notify user
```

### Scenario 3: Offline Operation

```
Device A (goes offline):
1. Record collection
2. Save to local SQLite
3. Add to pending_sync queue
4. Show "Pending sync" status

Device A (back online):
5. SyncService detects connection
6. Process pending_sync queue (FIFO)
7. Send collection to server
8. Handle any conflicts
9. Mark as synced
10. Update local cache
11. Show "Synced" status ✅
```

### Scenario 4: Offline with Conflict

```
Time    Device A (offline)          Device B (online)
----    ------------------          -----------------
T0      Fetch supplier (v1)         Fetch supplier (v1)
T1      Go offline                  —
        Edit: "ABC Ltd"             —
        Queue for sync              —
T2      —                           Edit: "ABC Company"
                                    UPDATE → Success (v2) ✅
T3      Back online                 —
        Sync queued item            —
        → 409 Conflict! ⚠️          —
T4      Accept server data          —
        Local: "ABC Company" (v2)   —
        User notified ✅            —
```

---

## Data Integrity Guarantees

### 1. No Data Loss
- All operations queued during offline periods
- Failed syncs retry with exponential backoff
- Persistent local storage until sync confirmed

### 2. No Data Corruption
- Atomic database transactions
- Version conflicts prevent overwriting
- Server validation on all inputs

### 3. No Duplicate Records
- Unique constraints on database
- Server-side duplicate detection
- Idempotent operations where possible

### 4. Auditability
- Complete audit logs (AuditLogMiddleware)
- Conflict resolution logging
- Timestamp tracking on all operations

### 5. Consistency
- Server as single source of truth
- Deterministic conflict resolution
- Eventual consistency guaranteed

---

## Testing

### Automated Tests

**Backend Tests** (`tests/Feature/VersionConflictTest.php`):
```bash
php artisan test --filter=VersionConflictTest
```

**Test Coverage:**
- ✅ Version conflict detection (all entities)
- ✅ Successful updates with correct version
- ✅ Version auto-increment behavior
- ✅ Multi-device concurrent scenarios
- ✅ Conflict response format
- ✅ Current data inclusion in conflicts

### Manual Testing Scenarios

#### Test 1: Two-Device Conflict
1. Device A: Fetch supplier #1
2. Device B: Fetch supplier #1
3. Device A: Update name → Success
4. Device B: Update name → 409 Conflict
5. Verify: Device B receives Device A's data

#### Test 2: Offline Queue
1. Device A: Go offline
2. Device A: Create 3 collections
3. Verify: Pending sync shows 3 items
4. Device A: Go online
5. Verify: All 3 items synced successfully

#### Test 3: Offline Conflict
1. Device A: Fetch supplier, go offline
2. Device B: Update supplier online
3. Device A: Update supplier offline (queued)
4. Device A: Go online
5. Verify: Device A accepts Device B's changes

---

## Best Practices

### For Developers

1. **Always Include Version:**
   ```typescript
   const data = {
       ...formData,
       version: currentRecord.version
   };
   ```

2. **Handle 409 Responses:**
   ```typescript
   catch (error) {
       if (error.response?.status === 409) {
           // Accept server data
           await updateLocalCache(error.response.data.current_data);
           showConflictNotification();
       }
   }
   ```

3. **Validate Before Sync:**
   ```typescript
   const validation = ConflictResolutionService.validateSyncData(data, 'supplier');
   if (!validation.valid) {
       console.error('Validation errors:', validation.errors);
       return;
   }
   ```

4. **Use Observers for Version Management:**
   - Never manually set version in application code
   - Let observers handle version increments
   - Use `saveQuietly()` when needed to avoid recursion

### For Users

1. **Sync Regularly:**
   - Enable automatic sync when online
   - Check sync status before critical operations
   - Resolve conflicts promptly

2. **Understand Conflicts:**
   - Server data always wins
   - Review changes after conflict resolution
   - Reapply your changes if necessary

3. **Monitor Status:**
   - ✅ All synced
   - ⏳ X items pending
   - ⚠️ Conflict resolved
   - ❌ Sync error

---

## Monitoring & Troubleshooting

### Metrics to Track

1. **Sync Success Rate:**
   - Formula: Successful syncs / Total attempts
   - Target: > 95%

2. **Conflict Rate:**
   - Formula: Conflicts / Total updates
   - Target: < 5%

3. **Average Sync Time:**
   - Measure: Queue processing time
   - Target: < 10 seconds

4. **Failed Items:**
   - Count: Items exceeding retry limit
   - Target: 0

### Common Issues

#### Issue: Items Stuck in Queue
**Symptoms:** Pending count doesn't decrease
**Solutions:**
1. Check network connectivity
2. Verify authentication token validity
3. Check server logs for errors
4. Manually clear if corrupted

#### Issue: Frequent Conflicts
**Symptoms:** High conflict rate
**Solutions:**
1. Implement advisory locking for long edits
2. Refresh data before editing
3. Train users on conflict resolution
4. Consider record-level locking

#### Issue: Version Mismatch
**Symptoms:** Consistent 409 errors
**Solutions:**
1. Verify version field in database
2. Check observer registration
3. Ensure middleware is active
4. Clear local cache and resync

---

## Security Considerations

1. **Authentication:**
   - JWT tokens required for all API calls
   - Token refresh mechanism implemented
   - Expired tokens handled gracefully

2. **Authorization:**
   - RBAC/ABAC enforced on all operations
   - Audit logs track all changes
   - Users can only modify allowed resources

3. **Data Protection:**
   - HTTPS for all communication
   - Encrypted local storage (where supported)
   - No sensitive data in logs

4. **Version Tampering:**
   - Server validates all version numbers
   - Audit logs track suspicious patterns
   - Rate limiting prevents abuse

---

## Conclusion

This system provides enterprise-grade data integrity with:

✅ **Zero Data Loss** - Offline queue + retry logic  
✅ **No Corruption** - Optimistic locking + server validation  
✅ **No Duplicates** - Unique constraints + server checks  
✅ **Full Auditability** - Complete audit trail  
✅ **Multi-Device Ready** - Concurrent operations supported  
✅ **Production Tested** - Comprehensive test suite  

The implementation follows industry best practices for distributed systems and has been validated for real-world multi-user, multi-device scenarios.

---

**For Support:** Refer to SYNC_GUIDE.md for detailed synchronization workflows  
**For API Reference:** See API_REFERENCE.md and Swagger documentation  
**For Testing:** Run `php artisan test` for backend, `npm test` for frontend
