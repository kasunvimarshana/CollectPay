# FieldLedger Offline Sync Strategy

Complete guide to understanding and implementing offline-first operations in FieldLedger.

## Overview

FieldLedger uses an **offline-first** architecture where:
1. All user actions are saved locally immediately
2. Operations sync to server automatically when online
3. Conflicts are detected and resolved deterministically
4. Zero data loss is guaranteed

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile Device                         │
│                                                          │
│  ┌───────────────┐                                      │
│  │  User Action  │                                      │
│  └───────┬───────┘                                      │
│          │                                               │
│          ▼                                               │
│  ┌───────────────────────────────────────────┐         │
│  │   Save to Local SQLite Database           │         │
│  │   - Mark as unsynced (synced=0)           │         │
│  │   - Generate UUID                          │         │
│  │   - Store timestamp                        │         │
│  └───────┬───────────────────────────────────┘         │
│          │                                               │
│          ▼                                               │
│  ┌───────────────────────────────────────────┐         │
│  │   Update UI (Optimistic Update)           │         │
│  └───────┬───────────────────────────────────┘         │
│          │                                               │
│          ▼                                               │
│  ┌───────────────────────────────────────────┐         │
│  │   Add to Sync Queue                       │         │
│  └───────┬───────────────────────────────────┘         │
│          │                                               │
│          ▼                                               │
│  ┌───────────────────────────────────────────┐         │
│  │   Network Available?                      │         │
│  └───────┬───────────────────────────────────┘         │
│          │                                               │
│    ┌─────┴─────┐                                        │
│    │           │                                         │
│   YES          NO                                        │
│    │           │                                         │
│    │           └──► Wait for network                    │
│    │                                                     │
│    ▼                                                     │
│  ┌───────────────────────────────────────────┐         │
│  │   Sync to Server                          │         │
│  └───────┬───────────────────────────────────┘         │
│          │                                               │
│          ▼                                               │
│  ┌───────────────────────────────────────────┐         │
│  │   Handle Response                         │         │
│  │   - Success: Mark synced (synced=1)       │         │
│  │   - Conflict: Apply resolution            │         │
│  │   - Error: Retry with backoff             │         │
│  └───────────────────────────────────────────┘         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Creating Data Offline

```typescript
// User creates a transaction
const transaction = {
  uuid: generateUUID(),
  supplier_id: 1,
  product_id: 1,
  quantity: 100,
  unit: 'kg',
  rate: 50.00,
  amount: 5000.00,
  transaction_date: new Date().toISOString(),
  created_by: userId,
  synced: 0, // Not synced yet
};

// Save to local database
await localDb.saveTransaction(transaction);

// UI shows the transaction immediately
// Background sync will handle server update
```

### 2. Automatic Synchronization

```typescript
// Sync manager runs periodically (every 60 seconds)
async function performSync() {
  // 1. Check network
  if (!isNetworkAvailable()) return;

  // 2. Get unsynced data
  const unsyncedTransactions = await localDb.getUnsyncedTransactions();
  const unsyncedPayments = await localDb.getUnsyncedPayments();

  // 3. Batch upload to server
  const result = await apiClient.syncTransactions(
    deviceId,
    unsyncedTransactions
  );

  // 4. Process results
  for (const item of result.synced) {
    await localDb.markTransactionSynced(item.uuid);
  }

  // 5. Handle conflicts
  for (const conflict of result.conflicts) {
    await handleConflict(conflict);
  }

  // 6. Pull server updates
  const updates = await apiClient.getUpdates(deviceId, lastSyncTime);
  await applyServerUpdates(updates);
}
```

## Conflict Resolution

### Conflict Detection

A conflict occurs when:
1. Server data has been updated since last sync
2. Client data has also been updated
3. Both updates happened after the last successful sync

```typescript
function detectConflict(serverData, clientData, lastSyncTime) {
  const serverUpdated = new Date(serverData.updated_at);
  const clientUpdated = new Date(clientData.updated_at);
  const lastSync = new Date(lastSyncTime);

  return (
    serverUpdated > lastSync &&
    clientUpdated > lastSync &&
    serverUpdated !== clientUpdated
  );
}
```

### Resolution Strategies

#### 1. Server Wins (Default)
```typescript
function resolveConflict_ServerWins(conflict) {
  // Keep server version
  await localDb.saveTransaction(conflict.server_data);
  
  // Save client version as backup
  await localDb.saveConflictBackup(conflict.client_data);
  
  // Notify user
  showConflictNotification(conflict);
}
```

#### 2. Client Wins
```typescript
function resolveConflict_ClientWins(conflict) {
  // Force upload client version
  await apiClient.forceUpdateTransaction(conflict.client_data);
  
  // Mark as synced
  await localDb.markTransactionSynced(conflict.client_data.uuid);
}
```

#### 3. Manual Resolution
```typescript
function resolveConflict_Manual(conflict) {
  // Show UI for user to choose
  const resolution = await showConflictDialog({
    serverVersion: conflict.server_data,
    clientVersion: conflict.client_data,
  });
  
  if (resolution === 'server') {
    await resolveConflict_ServerWins(conflict);
  } else if (resolution === 'client') {
    await resolveConflict_ClientWins(conflict);
  }
}
```

## UUID Generation

Every offline-created record gets a UUID:

```typescript
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

function generateUUID() {
  return uuidv4(); // e.g., '550e8400-e29b-41d4-a716-446655440000'
}
```

Benefits:
- Globally unique identifiers
- No ID conflicts when syncing
- Works offline
- Server can accept without modification

## Local Database Schema

### Transactions Table
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE NOT NULL,           -- Global identifier
  supplier_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  rate REAL NOT NULL,
  amount REAL NOT NULL,
  transaction_date TEXT NOT NULL,
  notes TEXT,
  created_by INTEGER NOT NULL,
  device_id INTEGER,
  synced_at TEXT,                      -- When synced to server
  created_at TEXT,
  updated_at TEXT,
  synced INTEGER DEFAULT 0             -- 0 = not synced, 1 = synced
);
```

### Sync Queue Table
```sql
CREATE TABLE sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,           -- 'transaction', 'payment'
  entity_uuid TEXT NOT NULL,           -- UUID of the entity
  operation TEXT NOT NULL,             -- 'create', 'update', 'delete'
  data TEXT NOT NULL,                  -- JSON data
  retry_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);
```

## Network Detection

```typescript
import * as Network from 'expo-network';

// Check network status
async function checkNetwork() {
  const state = await Network.getNetworkStateAsync();
  
  return {
    isConnected: state.isConnected,
    isInternetReachable: state.isInternetReachable,
    type: state.type, // wifi, cellular, ethernet, etc.
  };
}

// Monitor network changes
function monitorNetwork() {
  setInterval(async () => {
    const status = await checkNetwork();
    
    if (status.isConnected && status.isInternetReachable) {
      // Trigger sync
      await performSync();
    }
  }, 5000); // Check every 5 seconds
}
```

## Sync Strategies

### 1. Immediate Sync (Online)
```typescript
async function createTransaction(data) {
  // Save locally first (for offline fallback)
  await localDb.saveTransaction(data);
  
  try {
    // Try immediate sync
    if (isOnline) {
      const result = await apiClient.createTransaction(data);
      await localDb.markTransactionSynced(data.uuid);
    }
  } catch (error) {
    // Queue for later sync
    await addToSyncQueue(data);
  }
}
```

### 2. Batch Sync (Periodic)
```typescript
async function batchSync() {
  const unsynced = await localDb.getUnsyncedRecords();
  
  // Batch into groups of 50
  const batches = chunk(unsynced, 50);
  
  for (const batch of batches) {
    await apiClient.syncBatch(batch);
  }
}
```

### 3. Smart Sync (Priority-based)
```typescript
async function smartSync() {
  // High priority: Recent transactions
  const recentTransactions = await localDb.getUnsyncedTransactions({
    limit: 10,
    orderBy: 'created_at DESC',
  });
  
  await syncBatch(recentTransactions, 'high');
  
  // Medium priority: Older transactions
  const olderTransactions = await localDb.getUnsyncedTransactions({
    skip: 10,
    limit: 50,
  });
  
  await syncBatch(olderTransactions, 'medium');
}
```

## Error Handling

### Retry Logic
```typescript
async function syncWithRetry(data, maxRetries = 5) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await apiClient.sync(data);
      return { success: true };
    } catch (error) {
      retries++;
      
      if (retries >= maxRetries) {
        return { success: false, error };
      }
      
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      await sleep(Math.pow(2, retries) * 1000);
    }
  }
}
```

### Network Timeouts
```typescript
const apiClient = axios.create({
  timeout: 30000, // 30 seconds
  retry: 3,
  retryDelay: 1000,
});
```

## Best Practices

### 1. Always Save Locally First
```typescript
// ✅ Good
await localDb.save(data);
try {
  await apiClient.save(data);
} catch (error) {
  // Already saved locally
}

// ❌ Bad
try {
  await apiClient.save(data);
  await localDb.save(data);
} catch (error) {
  // Data lost if offline
}
```

### 2. Use Optimistic Updates
```typescript
// Update UI immediately
setState(newData);

// Save locally
await localDb.save(newData);

// Sync in background
syncInBackground(newData);
```

### 3. Handle Sync Failures Gracefully
```typescript
try {
  await performSync();
} catch (error) {
  // Don't block user
  console.error('Sync failed:', error);
  
  // Show unobtrusive notification
  showToast('Sync failed, will retry');
  
  // Schedule retry
  scheduleRetry();
}
```

### 4. Clear Old Synced Data
```typescript
// Clean up old synced records (keep last 30 days)
async function cleanupOldData() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  await localDb.deleteOldSyncedRecords(thirtyDaysAgo);
}
```

## Testing Offline Scenarios

### Simulate Offline
```typescript
// Disable network in simulator
// iOS: Toggle airplane mode
// Android: adb shell svc data disable

// Or mock network status
jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(() => ({
    isConnected: false,
    isInternetReachable: false,
  })),
}));
```

### Test Sync Recovery
```typescript
test('should sync after network recovery', async () => {
  // 1. Create data offline
  await createTransaction(testData);
  
  // 2. Verify saved locally
  const local = await localDb.getTransaction(testData.uuid);
  expect(local.synced).toBe(0);
  
  // 3. Simulate network recovery
  mockNetwork({ isConnected: true });
  
  // 4. Trigger sync
  await performSync();
  
  // 5. Verify synced
  const synced = await localDb.getTransaction(testData.uuid);
  expect(synced.synced).toBe(1);
});
```

## Monitoring & Debugging

### Sync Status Dashboard
```typescript
async function getSyncStatus() {
  const pendingTransactions = await localDb.getUnsyncedTransactions();
  const pendingPayments = await localDb.getUnsyncedPayments();
  const lastSync = await getLastSyncTime();
  
  return {
    pending_transactions: pendingTransactions.length,
    pending_payments: pendingPayments.length,
    last_sync: lastSync,
    status: pendingTransactions.length > 0 ? 'pending' : 'synced',
  };
}
```

### Sync Logs
```typescript
function logSync(operation, data, result) {
  console.log('[SYNC]', {
    timestamp: new Date().toISOString(),
    operation,
    data,
    result,
  });
}
```

## Troubleshooting

### Sync Not Working
1. Check network connectivity
2. Verify device is registered
3. Check auth token validity
4. Review error logs
5. Manually trigger sync

### Conflicts Not Resolving
1. Check conflict resolution strategy
2. Verify timestamp accuracy
3. Review conflict logs
4. Manual intervention if needed

### Data Loss Prevention
1. Never delete local data until synced
2. Keep sync backups
3. Regular sync monitoring
4. User notifications for sync issues

---

Last Updated: 2024-01-01
