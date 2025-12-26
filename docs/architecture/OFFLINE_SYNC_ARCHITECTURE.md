# Offline Support and Synchronization Architecture

## Overview

TrackVault implements a robust offline-first architecture that ensures uninterrupted data entry and operational continuity. The system allows users to work seamlessly without internet connectivity, with automatic synchronization when connection is restored.

## Key Features

### 1. **Offline Mode**
- Automatic detection of network connectivity status
- Visual indicators showing offline state
- Local persistence of all operations
- No functionality loss when offline

### 2. **Operation Queuing**
- All create, update, and delete operations are queued locally when offline
- Operations include metadata for tracking and conflict resolution
- Queue persists across app restarts
- Automatic retry mechanism with exponential backoff

### 3. **Automatic Synchronization**
- Triggers automatically when network connection is restored
- Batch processing for efficiency (10 operations per batch)
- Progress indicators during sync
- Success/failure notifications

### 4. **Conflict Detection and Resolution**
- Version-based optimistic locking prevents conflicts
- Server is the authoritative source of truth
- Deterministic conflict resolution strategy
- User notification for conflicts requiring manual intervention

### 5. **Multi-Device Support**
- Device-specific identifiers for tracking operation origins
- Concurrent operations across multiple devices supported
- Duplicate detection prevents data corruption
- Historical tracking of all operations

## Architecture Components

### Backend Components

#### 1. Database Schema

**Sync Fields (added to all entities)**
```php
device_id: string (nullable, indexed)
sync_metadata: json (nullable)
```

**Sync Operations Table**
```php
id: bigint (primary key)
device_id: string (indexed)
user_id: bigint (foreign key)
entity_type: string (supplier, product, collection, payment, product_rate)
entity_id: bigint (nullable)
operation_type: string (create, update, delete)
local_id: string (temporary device ID)
payload: json
status: string (pending, success, conflict, failed)
conflict_data: json (nullable)
error_message: text (nullable)
attempted_at: timestamp
completed_at: timestamp
timestamps
```

#### 2. API Endpoints

**POST /api/sync**
- Accepts batch operations from devices
- Implements conflict detection and resolution
- Returns detailed results for each operation

**GET /api/sync/pending**
- Retrieves pending operations for a device

### Frontend Components

#### 1. Device Management
- Generates unique device identifier
- Persists across app launches
- Format: `device_{timestamp}_{random}`

#### 2. Offline Storage
- Local data cache using AsyncStorage
- Sync queue with retry logic
- Operation metadata tracking

#### 3. Sync Manager
- Batch processing (10 operations per batch)
- Retry logic (max 3 retries)
- Progress tracking and notifications

#### 4. Network Monitoring
- Real-time connectivity detection
- Auto-sync on reconnection
- Visual offline indicators

## Synchronization Flow

### Offline Operation
```
User Action → Service Call → Network Check
                              ↓ (Offline)
                         Add to Queue → Local Storage
                              ↓
                    Return Temporary Response
```

### Network Restoration
```
Network Online → Auto-Sync Triggered
                      ↓
              Get Queued Operations
                      ↓
              Process in Batches
                      ↓
              Send to /api/sync
                      ↓
          Handle Results (success/conflict/error)
```

## Conflict Resolution Strategy

### Server-Authoritative Model
The backend is the **authoritative source of truth**.

1. **Version-Based Locking**
   - Every entity has a version number
   - Version increments on each update
   - Mismatched versions trigger conflicts

2. **Conflict Detection**
   - Version mismatch detected on server
   - Server returns conflict with both versions
   - Client notified for resolution

3. **Resolution Options**
   - Use Server Data (default)
   - Review Later
   - Force Update (with updated version)

## Data Consistency Guarantees

1. **Transactional Integrity** - All operations wrapped in transactions
2. **Duplicate Prevention** - Device ID + local ID tracking
3. **Historical Correctness** - Audit trail maintained
4. **Multi-User Safety** - Version control prevents lost updates

## Usage Examples

### Auto-Sync Integration
```typescript
import { useAutoSync } from './hooks/useAutoSync';

function App() {
  useAutoSync((successful, failed, conflicts) => {
    console.log(`Sync: ${successful} success, ${failed} failed`);
  });
  return <AppContent />;
}
```

### Manual Sync
```typescript
import { syncOfflineOperations } from './utils/syncManager';

await syncOfflineOperations(
  (current, total) => console.log(`${current}/${total}`),
  (successful, failed, conflicts) => showResults(successful, failed, conflicts)
);
```

## Security Considerations

1. **Authentication** - All sync operations require valid auth token
2. **Data Validation** - Server validates all incoming data
3. **Encryption** - Data encrypted in transit (HTTPS)
4. **Device ID** - Used for tracking, not authorization

## Performance Optimizations

- Batch processing (10 ops per batch)
- Retry with exponential backoff
- Local caching for frequently accessed data
- Efficient queue management

## Future Enhancements

1. **Delta Synchronization** - Only sync changed fields
2. **Intelligent Conflict Resolution** - Field-level merge
3. **Background Sync** - Periodic sync in background
4. **SQLite Storage** - Better performance for large datasets

## Conclusion

TrackVault's offline support provides a robust, production-ready solution ensuring data consistency, integrity, and correctness across multiple users and devices with the backend as the authoritative source of truth.

Key benefits:
- ✅ Zero downtime for users
- ✅ Automatic conflict detection
- ✅ Deterministic resolution
- ✅ Multi-device support
- ✅ Data integrity guaranteed
