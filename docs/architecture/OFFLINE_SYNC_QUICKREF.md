# Offline Sync - Quick Reference Guide

## Setup

### 1. Enable Auto-Sync in App

```typescript
// App.tsx
import { useAutoSync } from './src/hooks/useAutoSync';

function App() {
  useAutoSync(); // Automatically syncs when network is restored
  return <Navigation />;
}
```

### 2. Add Offline Indicator

```typescript
// Layout.tsx
import OfflineIndicator from './components/OfflineIndicator';

function Layout() {
  return (
    <>
      <OfflineIndicator />
      <Content />
    </>
  );
}
```

## Making Services Offline-Capable

### Option 1: Use Offline Service Wrapper (Recommended)

```typescript
import { makeOfflineCapable } from './utils/offlineService';
import { collectionService } from './api/collection';

const offlineCollectionService = makeOfflineCapable(
  collectionService,
  'collection'
);

// Use normally - offline mode handled automatically
await offlineCollectionService.create(data);
```

### Option 2: Manual Queue Management

```typescript
import { addToSyncQueue } from './utils/offlineStorage';

try {
  await apiService.create(data);
} catch (error) {
  if (isNetworkError(error)) {
    await addToSyncQueue({
      type: 'create',
      entity: 'collection',
      data: data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    });
  }
}
```

## Manual Sync Operations

```typescript
import { 
  syncOfflineOperations, 
  showSyncResults,
  getSyncQueueCount 
} from './utils/syncManager';

// Check queue count
const count = await getSyncQueueCount();

// Trigger sync with progress
await syncOfflineOperations(
  (current, total) => {
    console.log(`Syncing ${current}/${total}`);
  },
  (successful, failed, conflicts) => {
    showSyncResults(successful, failed, conflicts);
  }
);
```

## Network Status Monitoring

```typescript
import { useNetworkStatus } from './hooks/useNetworkStatus';

function MyComponent() {
  const { isConnected, isChecking } = useNetworkStatus();
  
  if (!isConnected) {
    return <OfflineBanner />;
  }
  
  return <NormalView />;
}
```

## Backend: Add Sync Support to New Entities

### 1. Migration

```php
Schema::table('your_table', function (Blueprint $table) {
    $table->string('device_id')->nullable()->after('version');
    $table->json('sync_metadata')->nullable()->after('device_id');
    $table->index('device_id');
});
```

### 2. Model

```php
protected $fillable = [
    // ... existing fields
    'device_id',
    'sync_metadata',
];

protected $casts = [
    // ... existing casts
    'sync_metadata' => 'array',
];
```

### 3. Controller (already handled by SyncController)

No changes needed - SyncController handles all entities automatically.

## Testing Offline Sync

### Scenario 1: Basic Offline Operation

```typescript
// 1. Disconnect network
// 2. Create a record
const result = await offlineService.create(data);
console.log(result._offline); // true
console.log(result._pending); // true

// 3. Reconnect network
// 4. Auto-sync triggers
// 5. Verify record on server
```

### Scenario 2: Conflict Resolution

```typescript
// Device A: Update record offline
// Device B: Update same record online
// Device A: Come online
// Expected: Conflict detected, user notified
```

### Scenario 3: Large Queue

```typescript
// Queue 50 operations while offline
// Reconnect
// Verify batch processing (5 batches of 10)
// Verify all operations complete successfully
```

## Common Patterns

### Show Pending Badge

```typescript
const [pendingCount, setPendingCount] = useState(0);

useEffect(() => {
  const updateCount = async () => {
    const count = await getSyncQueueCount();
    setPendingCount(count);
  };
  
  updateCount();
  const interval = setInterval(updateCount, 5000);
  return () => clearInterval(interval);
}, []);

return pendingCount > 0 ? <Badge>{pendingCount}</Badge> : null;
```

### Handle Temporary IDs

```typescript
import { isTempId } from './utils/offlineService';

if (isTempId(record.id)) {
  // Show "pending sync" indicator
  return <PendingBadge />;
}
```

### Custom Sync Callback

```typescript
useAutoSync((successful, failed, conflicts) => {
  if (conflicts > 0) {
    navigation.navigate('ConflictResolution');
  }
  
  if (successful > 0) {
    showToast('Data synchronized');
    refreshData();
  }
});
```

## Troubleshooting

### Queue Not Processing

```typescript
// Check queue contents
import { getSyncQueue } from './utils/offlineStorage';
const queue = await getSyncQueue();
console.log('Queue:', queue);

// Clear queue (use with caution!)
import { clearSyncQueue } from './utils/offlineStorage';
await clearSyncQueue();
```

### Force Immediate Sync

```typescript
import { syncOfflineOperations } from './utils/syncManager';

// Bypass auto-sync, trigger immediately
await syncOfflineOperations();
```

### Debug Device ID

```typescript
import { getDeviceId, clearDeviceId } from './utils/deviceManager';

const deviceId = await getDeviceId();
console.log('Device ID:', deviceId);

// Reset device ID (testing only)
await clearDeviceId();
```

## Best Practices

1. **Always use offline-capable services** for user-initiated operations
2. **Show offline indicators** prominently in UI
3. **Display pending operation count** so users know data is queued
4. **Test with network fluctuations** to ensure robustness
5. **Monitor sync queue size** and alert if it grows too large
6. **Validate data before queuing** to catch errors early
7. **Log sync operations** for debugging and monitoring

## API Reference

### Key Functions

- `getDeviceId()` - Get unique device identifier
- `addToSyncQueue(operation)` - Add operation to sync queue
- `getSyncQueue()` - Get all queued operations
- `syncOfflineOperations(onProgress, onComplete)` - Sync all operations
- `getSyncQueueCount()` - Get count of pending operations
- `makeOfflineCapable(service, entityType)` - Wrap service for offline support

### Key Hooks

- `useNetworkStatus()` - Monitor network connectivity
- `useAutoSync(onComplete?)` - Auto-sync on reconnection

### Key Components

- `<OfflineIndicator />` - Visual offline status indicator

## Configuration

```typescript
// syncManager.ts
const MAX_RETRY_COUNT = 3;      // Max retries per operation
const BATCH_SIZE = 10;          // Operations per batch

// Adjust based on your needs
```
