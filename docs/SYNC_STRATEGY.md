# CollectPay - Synchronization Strategy

## Overview

CollectPay implements a sophisticated **offline-first, bidirectional synchronization** system that ensures zero data loss and strong consistency across all devices and network conditions.

## Core Principles

1. **Online-First Operation**: Always attempts real-time remote persistence when connected
2. **Offline Resilience**: Continues operation without interruption when offline
3. **Controlled Auto-Sync**: Event-driven synchronization, not polling-based
4. **Zero Data Loss**: Guaranteed delivery with idempotent operations
5. **Strong Consistency**: Deterministic conflict resolution
6. **Multi-Device Support**: Concurrent access with proper conflict handling

## Synchronization Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile Application                        │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   Local    │  │   Sync     │  │  Network   │           │
│  │  Database  │◄─┤   Queue    │◄─┤  Monitor   │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│         ▲              │                │                   │
│         │              ▼                ▼                   │
│         │        ┌────────────────────────┐                │
│         │        │   Sync Service         │                │
│         │        │  • Push Changes        │                │
│         │        │  • Pull Changes        │                │
│         │        │  • Resolve Conflicts   │                │
│         │        └────────────────────────┘                │
│         │                  │                                │
└─────────┼──────────────────┼────────────────────────────────┘
          │                  │
          │          ┌───────▼───────┐
          │          │   API Layer   │
          │          │   (HTTPS)     │
          │          └───────┬───────┘
          │                  │
          │                  ▼
┌─────────┼──────────────────────────────────────────────────┐
│         │           Backend Server                          │
│         │                                                   │
│  ┌──────▼──────┐  ┌────────────┐  ┌────────────┐         │
│  │  Database   │◄─┤   Sync     │◄─┤   Auth     │         │
│  │  (MySQL)    │  │  Service   │  │  Service   │         │
│  └─────────────┘  └────────────┘  └────────────┘         │
│                         │                                   │
│                         ▼                                   │
│                   ┌────────────┐                           │
│                   │  Conflict  │                           │
│                   │ Resolution │                           │
│                   └────────────┘                           │
└──────────────────────────────────────────────────────────┘
```

## Sync Triggers

### 1. Network Regain Event
```typescript
// Automatic sync when network connectivity is restored
network.addListener((status) => {
  if (status === 'online') {
    sync.sync();
  }
});
```

### 2. App Foreground Event
```typescript
// Sync when app comes to foreground
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    sync.sync();
  }
});
```

### 3. Successful Authentication
```typescript
// Sync immediately after login
auth.login(email, password).then(() => {
  sync.sync();
});
```

### 4. Manual User Trigger
```typescript
// User presses sync button
<Button onPress={() => sync.sync()} />
```

## Sync Process

### Phase 1: Preparation

1. **Check Network Connectivity**
   ```typescript
   if (!await network.isOnline()) {
     return; // Queue operations for later
   }
   ```

2. **Gather Pending Changes**
   ```sql
   SELECT * FROM sync_queue 
   WHERE status = 'pending' 
   ORDER BY created_at ASC 
   LIMIT 100
   ```

3. **Prepare Batch**
   ```typescript
   const batch = pendingChanges.map(item => ({
     entity_type: item.entity_type,
     operation: item.operation,
     data: JSON.parse(item.payload)
   }));
   ```

### Phase 2: Push (Client → Server)

1. **Send Batch to Server**
   ```http
   POST /api/v1/sync/push
   Content-Type: application/json
   Authorization: Bearer {token}

   {
     "device_id": "uuid",
     "batch": [...]
   }
   ```

2. **Server Processing**
   - Validate authentication
   - Check permissions
   - Begin transaction
   - Process each item:
     - Check for conflicts (version, timestamp)
     - Apply changes or flag conflicts
     - Update entity versions
   - Commit transaction
   - Return results

3. **Handle Push Results**
   ```typescript
   for (const success of results.success) {
     // Update local entity with server version
     await updateLocal(success.entity);
   }

   for (const conflict of results.conflicts) {
     // Apply server-wins strategy
     await updateLocal(conflict.server_data);
     // Notify user
     notify('Conflict resolved', conflict.message);
   }

   for (const error of results.errors) {
     // Log error, retry later
     logError(error);
   }
   ```

### Phase 3: Pull (Server → Client)

1. **Request Server Changes**
   ```http
   POST /api/v1/sync/pull
   
   {
     "device_id": "uuid",
     "last_sync_at": "2024-01-15T10:00:00Z",
     "entity_types": ["suppliers", "products", ...]
   }
   ```

2. **Server Filtering**
   ```sql
   SELECT * FROM suppliers 
   WHERE updated_at > ? 
   ORDER BY updated_at ASC 
   LIMIT 100
   ```

3. **Apply Server Changes Locally**
   ```typescript
   for (const supplier of changes.suppliers) {
     await upsertSupplier(supplier);
   }
   
   for (const collection of changes.collections) {
     await upsertCollection(collection);
   }
   ```

### Phase 4: Finalization

1. **Update Last Sync Timestamp**
   ```typescript
   lastSyncAt = new Date().toISOString();
   await storage.setItem('last_sync_at', lastSyncAt);
   ```

2. **Clear Processed Queue Items**
   ```sql
   DELETE FROM sync_queue 
   WHERE status = 'completed'
   ```

3. **Notify UI**
   ```typescript
   notifyListeners('success', 'Sync completed');
   ```

## Conflict Resolution

### Detection Methods

#### 1. Version-Based Conflict
```typescript
// Client has version 5, Server has version 7
if (serverVersion > clientVersion) {
  // Conflict: Server has newer changes
  return {
    status: 'conflict',
    type: 'version',
    client_version: 5,
    server_version: 7
  };
}
```

#### 2. Timestamp-Based Conflict
```typescript
// Client timestamp: 10:00, Server timestamp: 10:05
if (serverTimestamp > clientTimestamp) {
  return {
    status: 'conflict',
    type: 'timestamp',
    message: 'Server data is newer'
  };
}
```

#### 3. Concurrent Modification
```typescript
// Both client and server modified same entity
if (bothModified && versionsMatch) {
  return {
    status: 'conflict',
    type: 'concurrent',
    message: 'Concurrent modifications detected'
  };
}
```

### Resolution Strategies

#### Strategy 1: Server Wins (Default)
```typescript
function resolveConflict(conflict) {
  // Always use server data
  return conflict.server_data;
}
```

#### Strategy 2: Last Write Wins
```typescript
function resolveConflict(conflict) {
  if (conflict.server_timestamp > conflict.client_timestamp) {
    return conflict.server_data;
  } else {
    return conflict.client_data;
  }
}
```

#### Strategy 3: Manual Resolution (Future)
```typescript
function resolveConflict(conflict) {
  // Show UI to user for manual resolution
  showConflictDialog(conflict);
  return await getUserChoice();
}
```

## Idempotent Operations

### UUID-Based Idempotency

```typescript
// Collections and payments use UUIDs
const collection = {
  uuid: Crypto.randomUUID(),
  supplier_id: 1,
  product_id: 1,
  quantity: 10
};

// Server checks for existing UUID
const existing = await Collection.where('uuid', collection.uuid).first();
if (existing) {
  // Already synced, skip
  return { status: 'success', message: 'Already exists' };
}
```

### Safe Retry Logic

```typescript
async function syncWithRetry(maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await sync();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await delay(attempt * 5000); // Exponential backoff
    }
  }
}
```

## Data Integrity

### Transactional Operations

```typescript
// Backend ensures atomicity
DB::transaction(function() {
  foreach ($batch as $item) {
    processItem($item);
  }
  // All or nothing
});
```

### Version Control

```typescript
// Auto-increment on every update
static::saving(function ($model) {
  if ($model->isDirty()) {
    $model->version++;
  }
});
```

### Audit Trail

```sql
-- Every entity tracks changes
created_at TIMESTAMP
updated_at TIMESTAMP
last_sync_at TIMESTAMP
created_by INTEGER REFERENCES users(id)
updated_by INTEGER REFERENCES users(id)
```

## Optimization Strategies

### 1. Batch Processing
- Process up to 100 items per sync
- Reduces network requests
- Improves performance

### 2. Incremental Sync
- Only sync changes since last sync
- Uses `last_sync_at` timestamp
- Minimizes data transfer

### 3. Selective Sync
- User can choose entities to sync
- Reduces bandwidth usage
- Faster sync times

### 4. Background Sync
- Non-blocking operations
- UI remains responsive
- Progress indicators shown

### 5. Compression
```typescript
// Future: Compress payloads
const compressed = gzip(JSON.stringify(batch));
```

## Network Efficiency

### Minimize Data Usage

1. **Only sync deltas**
   ```sql
   WHERE updated_at > last_sync_at
   ```

2. **Pagination**
   ```typescript
   LIMIT 100 OFFSET 0
   ```

3. **Field selection** (Future)
   ```typescript
   SELECT id, name, version, updated_at
   ```

4. **Binary protocol** (Future)
   - Protocol Buffers
   - MessagePack

## Error Handling

### Network Errors
```typescript
try {
  await sync();
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    // Queue for retry
    queueForRetry();
  }
}
```

### Authentication Errors
```typescript
if (error.status === 401) {
  // Token expired, refresh
  await auth.refreshToken();
  await sync();
}
```

### Validation Errors
```typescript
if (error.status === 422) {
  // Invalid data, log and skip
  logValidationError(error);
  markAsError(item);
}
```

## Monitoring & Debugging

### Sync Status Indicators

```typescript
// UI shows current sync state
enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  ERROR = 'error',
  CONFLICT = 'conflict'
}
```

### Sync Logs

```typescript
// Log all sync operations
logger.info('Sync started', { deviceId, timestamp });
logger.info('Push phase', { items: batch.length });
logger.info('Pull phase', { changes: changes.length });
logger.info('Sync completed', { duration, status });
```

### Metrics

- Total syncs performed
- Success rate
- Conflict rate
- Average sync duration
- Data transferred

## Testing Sync

### Manual Tests

1. **Create offline**
   - Disable network
   - Create collection
   - Enable network
   - Verify syncs

2. **Concurrent modification**
   - Modify on device A
   - Modify on device B
   - Sync both
   - Verify resolution

3. **Network interruption**
   - Start sync
   - Disable network mid-sync
   - Re-enable
   - Verify recovery

### Automated Tests

```typescript
describe('SyncService', () => {
  it('should handle offline creation', async () => {
    network.setOffline();
    await collection.create(data);
    expect(syncQueue.pending()).toBe(1);
    
    network.setOnline();
    await sync.sync();
    expect(syncQueue.pending()).toBe(0);
  });
});
```

## Best Practices

1. ✅ **Always use UUIDs** for offline-created entities
2. ✅ **Implement version control** for conflict detection
3. ✅ **Use transactions** for atomic operations
4. ✅ **Handle all error cases** gracefully
5. ✅ **Provide user feedback** on sync status
6. ✅ **Log sync operations** for debugging
7. ✅ **Test offline scenarios** thoroughly
8. ✅ **Implement retry logic** with backoff
9. ✅ **Validate data** before syncing
10. ✅ **Monitor performance** and optimize

## Future Enhancements

1. **WebSocket Support**: Real-time bidirectional sync
2. **Differential Sync**: Only send changed fields
3. **Compression**: Reduce bandwidth usage
4. **Priority Queue**: High-priority entities sync first
5. **Smart Sync**: AI-based sync scheduling
6. **Peer-to-Peer**: Device-to-device sync
7. **Conflict UI**: Manual resolution interface
8. **Sync Analytics**: Detailed performance metrics

---

This synchronization strategy ensures **reliable, efficient, and predictable data synchronization** across all devices and network conditions while maintaining data integrity and consistency.
