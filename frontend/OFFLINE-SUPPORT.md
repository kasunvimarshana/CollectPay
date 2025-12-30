# Offline Support Implementation Guide

## Overview

The FieldPay Ledger frontend now includes comprehensive offline support, allowing users to continue working without an internet connection. All data operations are queued and automatically synchronized when connectivity is restored.

## Architecture

### Clean Architecture Layers

#### 1. Domain Layer
- **SyncOperation**: Entity representing operations to be synchronized
- **NetworkState**: Value object representing network connectivity state
- **ConflictResolutionStrategy**: Value object defining conflict resolution strategies
- **SyncQueueRepository**: Interface for sync queue persistence
- **OfflineStorageRepository**: Interface for offline data storage

#### 2. Application Layer
- **EnqueueOperationUseCase**: Adds operations to sync queue
- **ProcessSyncQueueUseCase**: Processes pending sync operations
- **ResolveConflictUseCase**: Handles data conflicts during sync

#### 3. Infrastructure Layer
- **LocalDatabaseService**: Provides local key-value storage using AsyncStorage
- **NetworkMonitoringService**: Monitors network connectivity using NetInfo
- **LocalSyncQueueRepository**: Implements sync queue persistence
- **Offline*Repository**: Decorators that add offline support to existing repositories

#### 4. Presentation Layer
- **useSyncStore**: State management for sync operations
- **NetworkStatus**: UI component displaying network and sync status

## How It Works

### 1. Network State Monitoring

The `NetworkMonitoringService` continuously monitors network connectivity:

```typescript
// Automatically detects network changes
networkMonitor.addListener((state) => {
  if (state.canSync()) {
    // Auto-sync when coming back online
    sync();
  }
});
```

### 2. Offline-First Data Operations

All repository operations work offline-first:

```typescript
// Example: Creating a supplier offline
const supplier = await supplierRepository.create(newSupplier);

// Data is saved locally immediately
// Operation is queued for sync when online
// Returns the supplier entity without waiting for server
```

### 3. Sync Queue Management

Operations are queued when offline:

```typescript
// Operations include:
// - CREATE: New entities created offline
// - UPDATE: Entities modified offline
// - DELETE: Entities deleted offline

// Queue is processed automatically when:
// - Network connection is restored
// - User manually triggers sync
// - App comes to foreground (future)
```

### 4. Conflict Resolution

When conflicts occur during sync:

```typescript
// Strategies available:
// - SERVER_WINS: Server data takes precedence
// - CLIENT_WINS: Client data takes precedence
// - LATEST_TIMESTAMP: Most recent change wins
// - MERGE: Attempt to merge both changes
// - MANUAL: Require user intervention
```

## Usage Examples

### Basic Usage

```typescript
import { useSupplierStore } from './state/useSupplierStore';
import { useSyncStore } from './state/useSyncStore';

function MyComponent() {
  const { suppliers, createSupplier } = useSupplierStore();
  const { networkState, isSyncing, pendingOperations } = useSyncStore();

  // Works offline - data is cached and queued for sync
  const handleCreate = async () => {
    await createSupplier({
      name: 'New Supplier',
      code: 'SUP001',
      address: '123 Main St',
      phone: '+1234567890',
      email: 'supplier@example.com',
    });
  };

  return (
    <View>
      <NetworkStatus />
      {/* Your UI */}
    </View>
  );
}
```

### Manual Sync Trigger

```typescript
import { useSyncStore } from './state/useSyncStore';

function SyncButton() {
  const { sync, isSyncing, networkState } = useSyncStore();

  const handleSync = async () => {
    if (networkState.canSync()) {
      await sync();
    }
  };

  return (
    <Button 
      onPress={handleSync}
      disabled={!networkState.canSync() || isSyncing}
      title={isSyncing ? 'Syncing...' : 'Sync Now'}
    />
  );
}
```

### Checking Network State

```typescript
import { networkMonitor } from './infrastructure/network/NetworkMonitoringService';

// Get current state
const state = networkMonitor.getCurrentState();

if (state.isConnected()) {
  console.log('Online');
}

if (state.canSync()) {
  console.log('Can sync with server');
}

// Listen for changes
const unsubscribe = networkMonitor.addListener((newState) => {
  console.log('Network state changed:', newState);
});

// Clean up
unsubscribe();
```

## Data Flow

### Creating Data Offline

```
User Action
    ↓
Component calls store action
    ↓
Store calls use case
    ↓
Use case calls offline repository
    ↓
Repository checks network state
    ↓ (offline)
Save to local database
    ↓
Enqueue sync operation
    ↓
Return entity to UI (optimistic)
    ↓
UI updates immediately
```

### Syncing When Back Online

```
Network restored
    ↓
NetworkMonitor detects change
    ↓
Auto-trigger sync
    ↓
ProcessSyncQueueUseCase
    ↓
Process operations in order (FIFO)
    ↓
For each operation:
  - Mark as in progress
  - Call appropriate API endpoint
  - Handle success/failure
  - Update local cache
  - Remove from queue
    ↓
Notify UI of completion
```

## Error Handling

### Retry Logic

```typescript
// Failed operations are automatically retried
// Max attempts: 3 (configurable)
// Exponential backoff between retries

// Operations that fail after max attempts:
// - Remain in queue with FAILED status
// - Can be manually retried
// - User is notified
```

### Conflict Handling

```typescript
// When conflicts occur:
// 1. Operation marked with CONFLICT status
// 2. Server data stored in operation.conflictData
// 3. UI notifies user (if manual resolution needed)
// 4. User chooses resolution strategy
// 5. Operation retried with resolved data
```

## Configuration

### Sync Settings

```typescript
// In ProcessSyncQueueUseCase
const maxConcurrent = 5; // Max parallel sync operations
const maxAttempts = 3; // Max retry attempts

// In NetworkMonitoringService
// Polling interval: managed by NetInfo
```

### Storage Keys

```typescript
// Collections in local database:
// - sync_queue: Sync operations
// - suppliers: Cached suppliers
// - products: Cached products
// - collections: Cached collections
// - payments: Cached payments
// - rates: Cached rates
```

## Best Practices

### 1. Always Use Offline-Aware Repositories

```typescript
// ✅ Good
const apiRepository = new ApiSupplierRepository();
const repository = new OfflineSupplierRepository(apiRepository);

// ❌ Bad
const repository = new ApiSupplierRepository(); // No offline support
```

### 2. Initialize Sync Store Early

```typescript
// In App.tsx or root component
useEffect(() => {
  useSyncStore.getState().initialize();
}, []);
```

### 3. Show Network Status to Users

```typescript
// Always include NetworkStatus component
<NetworkStatus />
```

### 4. Handle Optimistic Updates

```typescript
// Data saved locally immediately
// UI updates optimistically
// Background sync happens asynchronously
// Handle sync failures gracefully
```

### 5. Test Offline Scenarios

```typescript
// Test with:
// - Airplane mode
// - Slow network
// - Intermittent connectivity
// - Large sync queues
```

## Limitations

### Current Limitations

1. **No Real-Time Sync**: Changes from other devices not reflected immediately
2. **Simple Conflict Resolution**: Basic strategies only
3. **AsyncStorage Limits**: 6MB limit on some platforms
4. **No Partial Sync**: All-or-nothing sync process
5. **No Background Sync**: Only syncs when app is active

### Future Enhancements

1. **WebSocket Integration**: Real-time updates
2. **SQLite/WatermelonDB**: Better performance for large datasets
3. **Background Sync**: Sync while app is closed
4. **Incremental Sync**: Sync only changed data
5. **Advanced Conflict Resolution**: Field-level merging
6. **Compression**: Reduce storage footprint
7. **Encryption**: Encrypt offline data at rest

## Troubleshooting

### Common Issues

**Issue**: Data not syncing
- **Solution**: Check network connectivity, view sync queue size, manually trigger sync

**Issue**: Sync conflicts
- **Solution**: Review conflict resolution strategy, resolve manually if needed

**Issue**: Storage limit exceeded
- **Solution**: Clear old completed operations, implement pagination

**Issue**: Slow performance
- **Solution**: Consider WatermelonDB for better performance with large datasets

## Security Considerations

### Current Implementation

- Local data stored in AsyncStorage (unencrypted)
- Network requests use HTTPS
- Auth tokens stored in SecureStore
- No sensitive data logged

### Recommended Enhancements

1. Encrypt offline data at rest
2. Implement data expiration policies
3. Add integrity checks for cached data
4. Secure sync queue operations
5. Implement data sanitization

## Testing

### Test Scenarios

1. **Create data offline → Sync when online**
2. **Update data offline → Sync when online**
3. **Delete data offline → Sync when online**
4. **Multiple operations → Sync in order**
5. **Sync failure → Retry logic**
6. **Conflict → Resolution strategies**
7. **Network fluctuation → Graceful handling**
8. **Large queue → Performance**

### Example Test

```typescript
// Test offline creation and sync
describe('Offline Supplier Creation', () => {
  it('should create supplier offline and sync when online', async () => {
    // 1. Go offline
    networkMonitor.setOffline();
    
    // 2. Create supplier
    const supplier = await repository.create(newSupplier);
    
    // 3. Verify local storage
    const cached = await localDatabase.get('suppliers', supplier.getId());
    expect(cached).toBeDefined();
    
    // 4. Verify sync queue
    const queue = await syncQueue.getPendingOperations();
    expect(queue.length).toBe(1);
    
    // 5. Go online
    networkMonitor.setOnline();
    
    // 6. Trigger sync
    await sync();
    
    // 7. Verify queue cleared
    const queueAfter = await syncQueue.getPendingOperations();
    expect(queueAfter.length).toBe(0);
  });
});
```

## Summary

The offline support implementation follows Clean Architecture principles:
- **Domain**: Pure business logic for sync and network state
- **Application**: Use cases coordinating offline/online operations
- **Infrastructure**: Concrete implementations with AsyncStorage and NetInfo
- **Presentation**: UI components and state management

This ensures:
- ✅ Testability
- ✅ Maintainability
- ✅ Scalability
- ✅ Framework independence
- ✅ Clear separation of concerns
