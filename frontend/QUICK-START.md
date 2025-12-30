# Quick Start Guide: Offline-First React Native App

## For Developers

### Setup (First Time)

```bash
cd frontend
npm install
```

### Running the App

```bash
# Start Expo development server
npm start

# Or run on specific platform
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser
```

### Key Concepts

#### 1. All Data Works Offline

Every CRUD operation (Create, Read, Update, Delete) now works offline automatically:

```typescript
// This works whether you're online or offline!
const supplier = await supplierRepository.create(newSupplier);
```

#### 2. Automatic Synchronization

When you come back online, data syncs automatically:

```typescript
// The app handles this for you, but you can also trigger manually:
import { useSyncStore } from './presentation/state/useSyncStore';

const { sync } = useSyncStore();
await sync();
```

#### 3. Network Status UI

Always show users the network status:

```typescript
import { NetworkStatus } from './presentation/components/NetworkStatus';

function MyScreen() {
  return (
    <SafeAreaView>
      <NetworkStatus />
      {/* Rest of your UI */}
    </SafeAreaView>
  );
}
```

### Using Offline Repositories

#### Before (Online Only)
```typescript
import { ApiSupplierRepository } from './infrastructure/repositories/ApiSupplierRepository';

const repository = new ApiSupplierRepository();
```

#### After (Offline Support)
```typescript
import { ApiSupplierRepository } from './infrastructure/repositories/ApiSupplierRepository';
import { OfflineSupplierRepository } from './infrastructure/repositories/OfflineSupplierRepository';

const apiRepo = new ApiSupplierRepository();
const repository = new OfflineSupplierRepository(apiRepo);
```

That's it! The repository now:
- ✅ Works offline
- ✅ Caches data locally
- ✅ Syncs when online
- ✅ Handles conflicts
- ✅ Retries failures

### Testing Offline Scenarios

#### Simulate Offline Mode

**iOS Simulator:**
1. Swipe down from top-right for Control Center
2. Enable Airplane Mode

**Android Emulator:**
1. Swipe down from top
2. Enable Airplane Mode

**Or use Expo:**
```bash
# In Expo DevTools, toggle "Airplane Mode"
```

#### Test Workflow

1. **Go Offline**: Enable airplane mode
2. **Create Data**: Add suppliers, products, etc.
3. **Verify Local**: Data appears immediately in UI
4. **Check Queue**: NetworkStatus shows pending operations
5. **Go Online**: Disable airplane mode
6. **Verify Sync**: Queue processes automatically
7. **Check Server**: Data appears on backend

### Common Patterns

#### Check Network State

```typescript
import { useSyncStore } from './presentation/state/useSyncStore';

function MyComponent() {
  const { networkState } = useSyncStore();
  
  if (networkState.isOffline()) {
    return <OfflineNotice />;
  }
  
  return <NormalContent />;
}
```

#### Manual Sync Button

```typescript
import { useSyncStore } from './presentation/state/useSyncStore';

function SyncButton() {
  const { sync, isSyncing, networkState } = useSyncStore();
  
  return (
    <Button
      onPress={sync}
      disabled={!networkState.canSync() || isSyncing}
      title={isSyncing ? "Syncing..." : "Sync Now"}
    />
  );
}
```

#### Show Pending Operations

```typescript
import { useSyncStore } from './presentation/state/useSyncStore';

function PendingBadge() {
  const { pendingOperations } = useSyncStore();
  
  if (pendingOperations.length === 0) return null;
  
  return (
    <Badge>
      {pendingOperations.length} pending
    </Badge>
  );
}
```

### Troubleshooting

#### Data Not Syncing?

1. Check network status: Is the device actually online?
2. Check sync queue: How many operations are pending?
3. Check errors: Look for error messages in console
4. Manual sync: Try triggering sync manually

#### Sync Conflicts?

Conflicts are marked and queued for resolution. Check:
```typescript
const { pendingOperations } = useSyncStore();
const conflicts = pendingOperations.filter(
  op => op.getStatus() === SyncOperationStatus.CONFLICT
);
```

#### Performance Issues?

- Clear old completed operations regularly
- Consider pagination for large datasets
- Monitor AsyncStorage usage (6MB limit)

### Best Practices

#### 1. Always Use Offline Repositories

```typescript
// ✅ Good
const offlineRepo = new OfflineSupplierRepository(apiRepo);

// ❌ Bad
const apiRepo = new ApiSupplierRepository(); // No offline support
```

#### 2. Initialize Sync Store Early

```typescript
// In App.tsx
useEffect(() => {
  useSyncStore.getState().initialize();
}, []);
```

#### 3. Show Network Status

```typescript
// In every screen
<NetworkStatus />
```

#### 4. Handle Optimistic Updates

```typescript
// Data saves locally first
// UI updates immediately
// Background sync happens asynchronously
// Show loading states appropriately
```

#### 5. Test Offline Scenarios

Always test your features with:
- Airplane mode on
- Slow 3G network
- Intermittent connectivity
- Large sync queues

### Architecture Overview

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (UI, State Management, Components)     │
├─────────────────────────────────────────┤
│       Infrastructure Layer              │
│  (OfflineRepositories, Network,         │
│   LocalDatabase, SyncQueue)             │
├─────────────────────────────────────────┤
│        Application Layer                │
│  (UseCases: Enqueue, Sync, Resolve)     │
├─────────────────────────────────────────┤
│          Domain Layer                   │
│  (Entities, ValueObjects, Interfaces)   │
└─────────────────────────────────────────┘
         Dependencies flow inward →
```

### File Locations

```
frontend/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── SyncOperation.ts
│   │   ├── valueObjects/
│   │   │   ├── NetworkState.ts
│   │   │   └── ConflictResolutionStrategy.ts
│   │   └── repositories/
│   │       ├── SyncQueueRepository.ts
│   │       └── OfflineStorageRepository.ts
│   │
│   ├── application/
│   │   └── useCases/
│   │       ├── EnqueueOperationUseCase.ts
│   │       ├── ProcessSyncQueueUseCase.ts
│   │       └── ResolveConflictUseCase.ts
│   │
│   ├── infrastructure/
│   │   ├── storage/
│   │   │   └── LocalDatabaseService.ts
│   │   ├── network/
│   │   │   └── NetworkMonitoringService.ts
│   │   └── repositories/
│   │       ├── LocalSyncQueueRepository.ts
│   │       ├── OfflineSupplierRepository.ts
│   │       ├── OfflineProductRepository.ts
│   │       ├── OfflineCollectionRepository.ts
│   │       └── OfflinePaymentRepository.ts
│   │
│   └── presentation/
│       ├── state/
│       │   └── useSyncStore.ts
│       └── components/
│           └── NetworkStatus.tsx
│
├── OFFLINE-SUPPORT.md          # Detailed documentation
├── IMPLEMENTATION-COMPLETE.md  # Implementation summary
└── QUICK-START.md             # This file
```

### Additional Resources

- **Detailed Guide**: See [OFFLINE-SUPPORT.md](./OFFLINE-SUPPORT.md)
- **Implementation Details**: See [IMPLEMENTATION-COMPLETE.md](./IMPLEMENTATION-COMPLETE.md)
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)

### Getting Help

1. Check the documentation files above
2. Review code comments in source files
3. Look for TODOs marking future enhancements
4. Test in isolation to identify issues

### Contributing

When adding new features:

1. Follow Clean Architecture principles
2. Add offline support to new repositories
3. Update documentation
4. Add TypeScript types
5. Test offline scenarios
6. Run `npx tsc --noEmit` before committing

### Quick Commands

```bash
# Type checking
npx tsc --noEmit

# Start development
npm start

# Run on device
npm run ios      # or android

# Install dependencies
npm install

# Clear cache
npm start --clear
```

---

**Ready to build offline-first features!** 🚀
