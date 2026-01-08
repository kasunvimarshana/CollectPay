# Offline Synchronization & Conflict Resolution Guide

## Overview

This system implements **deterministic multi-device synchronization** with the backend as the single authoritative source of truth. All conflicts are resolved in favor of the server data to maintain data integrity across all devices.

---

## Architecture

### Components

1. **LocalStorageService** (Frontend)
   - SQLite database for local caching
   - Pending sync queue
   - Offline data persistence

2. **SyncService** (Frontend)
   - Manages synchronization operations
   - Retry logic with exponential backoff
   - Batch synchronization

3. **ConflictResolutionService** (Frontend)
   - Detects version conflicts
   - Implements resolution strategy
   - Validates sync data

4. **CheckVersionConflict Middleware** (Backend)
   - Intercepts UPDATE requests
   - Compares version numbers
   - Returns HTTP 409 for conflicts

5. **Model Observers** (Backend)
   - Auto-increment version on updates
   - Ensure version consistency

---

## How It Works

### 1. Normal Operation (No Conflict)

```
User Action (Online)
    ↓
Create/Update Data
    ↓
Send to Backend (with version)
    ↓
Backend validates version
    ↓
Version matches ✅
    ↓
Update successful
    ↓
Increment version
    ↓
Return updated data
    ↓
Update local cache
```

### 2. Offline Operation

```
User Action (Offline)
    ↓
Save to local SQLite
    ↓
Add to pending_sync queue
    ↓
Connection restored
    ↓
SyncService starts
    ↓
Process pending items
    ↓
Send to backend
    ↓
[Continue to conflict check]
```

### 3. Conflict Detection & Resolution

```
Update Request
    ↓
CheckVersionConflict Middleware
    ↓
Compare versions
    ↓
Client version: 3
Server version: 5
    ↓
Version mismatch! ⚠️
    ↓
Return HTTP 409 Conflict
    ↓
Include server data
    ↓
ConflictResolutionService
    ↓
Resolution: Use server data ✅
    ↓
Update local cache
    ↓
Log conflict
    ↓
Notify user
```

---

## Conflict Resolution Strategy

### Principle: Server Always Wins

The system implements a **server-authoritative** strategy:

1. **Server version > Client version**
   - Accept server data completely
   - Discard local changes
   - Update local cache
   - Reason: Another user made changes

2. **Server version = Client version (but data differs)**
   - Still accept server data
   - Reason: Maintain consistency

3. **Server version < Client version**
   - This shouldn't happen in normal flow
   - Indicates sync error
   - Retry synchronization
   - Escalate if persistent

### Why Server Wins?

1. **Data Integrity**: Single source of truth prevents data corruption
2. **Consistency**: All devices see the same data
3. **Auditability**: Server maintains complete audit trail
4. **Security**: Server validates all changes
5. **Predictability**: Deterministic behavior

---

## Optimistic Locking

### How It Works

1. **Reading Data**
   ```json
   {
     "id": 1,
     "name": "ABC Suppliers",
     "version": 3
   }
   ```

2. **Updating Data**
   ```json
   {
     "id": 1,
     "name": "ABC Suppliers Ltd",
     "version": 3  ← Must match current version
   }
   ```

3. **Version Check**
   - Backend checks: received version (3) == current version (3)
   - Match ✅: Allow update, increment to version 4
   - Mismatch ❌: Return 409 Conflict with current data

---

## Sync Queue

### Structure

```sql
CREATE TABLE pending_sync (
  id INTEGER PRIMARY KEY,
  entity TEXT,           -- 'supplier', 'product', etc.
  action TEXT,           -- 'create', 'update', 'delete'
  data TEXT,             -- JSON encoded data
  timestamp INTEGER,     -- When queued
  synced INTEGER         -- 0=pending, 1=synced
);
```

### Processing

1. **Queue Items**
   - Offline actions saved to queue
   - Timestamp recorded
   - Marked as unsynced (0)

2. **Sync Process**
   - On connection: Start sync
   - Process FIFO (oldest first)
   - Retry on failure with backoff

3. **Success**
   - Mark as synced (1)
   - Remove from queue after confirmation
   - Update local cache

4. **Failure**
   - Log error
   - Check if should retry
   - Calculate backoff delay
   - Retry or mark as failed

---

## Retry Logic

### Exponential Backoff

```
Attempt 1: 0 seconds   (immediate)
Attempt 2: 1 second    (2^0 * 1000ms)
Attempt 3: 2 seconds   (2^1 * 1000ms)
Attempt 4: 4 seconds   (2^2 * 1000ms)
Attempt 5: 8 seconds   (2^3 * 1000ms)
Max:       30 seconds  (cap)
```

### Retry Conditions

**Should Retry:**
- Network errors (NETWORK_ERROR, TIMEOUT)
- Temporary server errors (5xx)
- Rate limiting (429)
- Max 3 attempts

**Should NOT Retry:**
- Version conflicts (409) - resolve immediately
- Validation errors (422) - fix data first
- Authentication errors (401, 403)
- Not found errors (404)

---

## Multi-Device Scenarios

### Scenario 1: Sequential Updates (No Conflict)

```
Device A (v1):
  Update supplier → v2 ✅

Device B (v2):
  Fetch latest → v2
  Update supplier → v3 ✅

Device A (v2):
  Fetch latest → v3 ✅
```

### Scenario 2: Concurrent Updates (Conflict)

```
Time    Device A            Device B
----    --------            --------
T0      Fetch (v1)          Fetch (v1)
T1      Edit offline        Edit offline
T2      Online: Update      —
        → Success (v2) ✅
T3      —                   Online: Update (v1)
                            → Conflict! ⚠️
T4      —                   Get server data (v2)
                            Accept server changes
                            Update local cache ✅
```

### Scenario 3: Offline then Conflict

```
Time    Device A            Device B
----    --------            --------
T0      Fetch (v1)          Fetch (v1)
T1      Go offline          Online: Update
        Queue update        → Success (v2) ✅
T2      Back online
        Sync queued item
        → Conflict! ⚠️
T3      Accept server (v2)
        Update local cache ✅
```

---

## Code Examples

### Frontend: Adding to Sync Queue

```typescript
// When offline
async function updateSupplier(supplier: Supplier) {
  await LocalStorageService.addToSyncQueue(
    'supplier',
    'update',
    supplier
  );
}
```

### Frontend: Syncing Pending Changes

```typescript
// When online
const result = await SyncService.syncPendingChanges();
console.log(`Synced: ${result.synced}, Failed: ${result.failed}`);
```

### Frontend: Handling Conflicts

```typescript
// Automatic handling in SyncService
if (error.response?.status === 409) {
  const serverData = error.response.data;
  const resolution = ConflictResolutionService.resolveConflict({
    localVersion: data.version,
    serverVersion: serverData.version,
    localData: data,
    serverData: serverData,
    entity: 'supplier',
    entityId: data.id,
  });
  
  // Always use server data
  await LocalStorageService.cacheSuppliers([resolution.resolvedData]);
}
```

### Backend: Version Check

```php
// CheckVersionConflict middleware
$clientVersion = $request->input('version');
$serverVersion = $model->version;

if ($clientVersion != $serverVersion) {
    return response()->json([
        'success' => false,
        'conflict' => true,
        'data' => [
            'client_version' => $clientVersion,
            'server_version' => $serverVersion,
            'current_data' => $model,
        ]
    ], 409);
}
```

### Backend: Auto-increment Version

```php
// SupplierObserver
public function updating(Supplier $supplier): void
{
    if ($supplier->isDirty() && !$supplier->isDirty('version')) {
        $supplier->version = ($supplier->version ?? 0) + 1;
    }
}
```

---

## Testing Synchronization

### Test Case 1: Normal Sync

```bash
# Device A: Create supplier
POST /api/suppliers
{ "name": "Test", "code": "T001" }
→ Response: { "id": 1, "version": 1 }

# Device B: Fetch suppliers
GET /api/suppliers
→ Response: [{ "id": 1, "version": 1 }] ✅
```

### Test Case 2: Conflict Detection

```bash
# Device A: Fetch supplier
GET /api/suppliers/1
→ Response: { "id": 1, "name": "Test", "version": 3 }

# Device B: Also fetch supplier
GET /api/suppliers/1
→ Response: { "id": 1, "name": "Test", "version": 3 }

# Device A: Update supplier
PUT /api/suppliers/1
{ "name": "Test Updated", "version": 3 }
→ Response: { "version": 4 } ✅

# Device B: Try to update (with stale version)
PUT /api/suppliers/1
{ "name": "Test Modified", "version": 3 }
→ Response: 409 Conflict
{
  "conflict": true,
  "client_version": 3,
  "server_version": 4,
  "current_data": { "name": "Test Updated", "version": 4 }
}
```

### Test Case 3: Offline Queue

```bash
# Device A goes offline
# Queue 3 updates

pending_sync:
1. supplier, update, {"id": 1, "name": "A"}
2. collection, create, {"supplier_id": 1, "quantity": 50}
3. payment, create, {"supplier_id": 1, "amount": 1000}

# Device A comes online
# SyncService processes queue FIFO

Result:
- Item 1: Synced ✅
- Item 2: Synced ✅
- Item 3: Synced ✅
- Queue cleared
```

---

## User Experience

### Conflict Notification

When a conflict occurs, users should be notified:

```
⚠️ Sync Conflict Detected

Your changes to "ABC Suppliers" could not be saved 
because another user modified this record.

Server data has been applied to maintain consistency.

Your changes:
- Phone: +94771234567

Server changes:
- Phone: +94779876543 ✅
- Address: New address added

[OK]
```

### Sync Status

Show sync status to users:

```
✅ All changes synced
⏳ 3 items pending sync
⚠️ 1 conflict resolved
❌ Network error - will retry
```

---

## Best Practices

### For Developers

1. **Always send version numbers**
   ```typescript
   const data = {
     ...formData,
     version: currentVersion
   };
   ```

2. **Handle 409 responses**
   ```typescript
   catch (error) {
     if (error.response?.status === 409) {
       // Handle conflict
     }
   }
   ```

3. **Update cache after sync**
   ```typescript
   await LocalStorageService.cacheSuppliers([serverData]);
   ```

4. **Log conflicts for audit**
   ```typescript
   ConflictResolutionService.logConflict(conflict, resolution);
   ```

### For Users

1. **Sync regularly** when online
2. **Check sync status** before critical operations
3. **Understand conflicts** are resolved by server
4. **Review changes** after conflict resolution
5. **Report persistent** sync issues

---

## Troubleshooting

### Problem: Items stuck in sync queue

**Solution:**
1. Check network connectivity
2. Verify authentication token
3. Check server logs for errors
4. Manually clear queue if needed:
   ```typescript
   await LocalStorageService.deleteSyncedItems();
   ```

### Problem: Frequent conflicts

**Solution:**
1. Ensure users fetch latest data before editing
2. Implement refresh mechanisms
3. Consider locking records during edit
4. Train users on conflict resolution

### Problem: Version mismatch errors

**Solution:**
1. Verify version field in database
2. Check observer is registered
3. Ensure middleware is active
4. Validate version in requests

---

## Monitoring

### Metrics to Track

1. **Sync Success Rate**
   - Successful syncs / Total sync attempts

2. **Conflict Rate**
   - Conflicts detected / Total updates

3. **Average Sync Time**
   - Time to process sync queue

4. **Failed Sync Items**
   - Items that exceeded retry limit

5. **Queue Size**
   - Number of items waiting to sync

---

## Conclusion

This synchronization system ensures:

✅ **Data Integrity** - Server is always authoritative
✅ **Consistency** - All devices see the same data
✅ **Reliability** - Automatic retry with backoff
✅ **Auditability** - Complete conflict logging
✅ **User Experience** - Transparent conflict resolution
✅ **Scalability** - Supports unlimited devices

The system is production-ready and has been tested with:
- Single device operations ✅
- Multi-device concurrent updates ✅
- Offline-online transitions ✅
- Conflict detection and resolution ✅
- Network failure scenarios ✅

---

**Version**: 1.0.0
**Date**: December 29, 2025
**Status**: Production Ready
