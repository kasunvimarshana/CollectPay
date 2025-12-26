# Offline Sync - Deployment Guide

## Prerequisites

- Laravel 11+ backend running
- React Native (Expo) frontend running
- Database access (MySQL, PostgreSQL, or SQLite)
- PHP 8.2+
- Node.js 18+

## Backend Deployment

### Step 1: Run Database Migrations

```bash
cd backend

# Run the new migrations
php artisan migrate

# Verify migrations
php artisan migrate:status
```

Expected new migrations:
- `2025_12_26_183000_add_sync_fields_to_tables.php`
- `2025_12_26_183001_create_sync_operations_table.php`

### Step 2: Verify Database Schema

Check that the following fields were added to all entity tables:
- `device_id` (string, nullable, indexed)
- `sync_metadata` (json, nullable)

Check that `sync_operations` table was created with fields:
- `id`, `device_id`, `user_id`, `entity_type`, `entity_id`
- `operation_type`, `local_id`, `payload`, `status`
- `conflict_data`, `error_message`, `attempted_at`, `completed_at`
- `created_at`, `updated_at`

### Step 3: Test Sync Endpoint

```bash
# Test the sync endpoint (requires authentication)
curl -X POST http://localhost:8000/api/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "test_device_123",
    "operations": []
  }'

# Expected response:
# {"success":true,"results":[]}
```

### Step 4: Configure API Routes

The routes should already be configured in `routes/api.php`:
```php
Route::post('/sync', [SyncController::class, 'sync']);
Route::get('/sync/pending', [SyncController::class, 'getPendingOperations']);
```

Verify routes:
```bash
php artisan route:list | grep sync
```

### Step 5: Update API Documentation

If using Swagger/OpenAPI:
```bash
php artisan l5-swagger:generate
```

Visit `http://localhost:8000/api/documentation` to verify new endpoints.

## Frontend Deployment

### Step 1: Install Dependencies

All required dependencies should already be in `package.json`:
```json
{
  "@react-native-async-storage/async-storage": "^2.2.0",
  "@react-native-community/netinfo": "^11.3.0",
  "expo-secure-store": "^15.0.8"
}
```

If not installed:
```bash
cd frontend
npm install
```

### Step 2: Verify File Structure

Ensure the following files exist:
```
frontend/src/
├── utils/
│   ├── deviceManager.ts      (device ID generation)
│   ├── offlineStorage.ts     (enhanced with device_id)
│   ├── syncManager.ts        (batch sync implementation)
│   └── offlineService.ts     (service wrapper)
├── hooks/
│   ├── useNetworkStatus.ts   (network monitoring)
│   └── useAutoSync.ts        (auto-sync on reconnect)
└── components/
    └── OfflineIndicator.tsx  (visual indicator)
```

### Step 3: Update App Entry Point

Ensure auto-sync is enabled in your main App component:

```typescript
// App.tsx or similar
import { useAutoSync } from './src/hooks/useAutoSync';
import OfflineIndicator from './src/components/OfflineIndicator';

export default function App() {
  // Enable auto-sync
  useAutoSync((successful, failed, conflicts) => {
    console.log('Sync completed:', { successful, failed, conflicts });
  });

  return (
    <NavigationContainer>
      <OfflineIndicator />
      <YourNavigation />
    </NavigationContainer>
  );
}
```

### Step 4: Test Offline Functionality

1. **Test Device ID Generation**:
```typescript
import { getDeviceId } from './src/utils/deviceManager';

const deviceId = await getDeviceId();
console.log('Device ID:', deviceId);
// Should be format: device_{timestamp}_{random}
```

2. **Test Queue Operations**:
```typescript
import { addToSyncQueue, getSyncQueue } from './src/utils/offlineStorage';

// Add test operation
await addToSyncQueue({
  type: 'create',
  entity: 'supplier',
  data: { name: 'Test', code: 'TEST' },
  timestamp: new Date().toISOString(),
  retryCount: 0,
});

// Verify queue
const queue = await getSyncQueue();
console.log('Queue:', queue);
```

3. **Test Network Monitoring**:
```typescript
import { useNetworkStatus } from './src/hooks/useNetworkStatus';

function TestComponent() {
  const { isConnected } = useNetworkStatus();
  console.log('Connected:', isConnected);
  return null;
}
```

### Step 5: Update API Client Configuration

Ensure API client has correct base URL:

```typescript
// src/api/client.ts
const apiClient = axios.create({
  baseURL: 'http://your-server.com/api', // Update this
  timeout: 10000,
});
```

## Testing Checklist

### Backend Tests

- [ ] Migration runs successfully without errors
- [ ] Sync fields added to all entity tables
- [ ] Sync operations table created with correct schema
- [ ] POST /api/sync endpoint responds correctly
- [ ] GET /api/sync/pending endpoint responds correctly
- [ ] Swagger documentation updated (if applicable)

### Frontend Tests

- [ ] Device ID generates and persists correctly
- [ ] Network status detected accurately
- [ ] Offline indicator displays when offline
- [ ] Operations queue when offline
- [ ] Auto-sync triggers on reconnection
- [ ] Manual sync button works
- [ ] Sync progress displays correctly
- [ ] Conflict notifications appear when needed

### Integration Tests

- [ ] Create operation works offline and syncs online
- [ ] Update operation works offline and syncs online
- [ ] Delete operation works offline and syncs online
- [ ] Concurrent updates from multiple devices handled
- [ ] Version conflicts detected and resolved
- [ ] Duplicate operations prevented
- [ ] Retry logic works for failed operations
- [ ] Large queues (50+ operations) process correctly

## Monitoring and Maintenance

### Backend Monitoring

Monitor sync operations table:
```sql
-- Check pending operations
SELECT device_id, COUNT(*) 
FROM sync_operations 
WHERE status = 'pending' 
GROUP BY device_id;

-- Check failed operations
SELECT * 
FROM sync_operations 
WHERE status = 'failed' 
ORDER BY created_at DESC 
LIMIT 10;

-- Check conflicts
SELECT * 
FROM sync_operations 
WHERE status = 'conflict' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Frontend Monitoring

Add monitoring in production:
```typescript
import { getSyncQueueCount } from './utils/syncManager';

// Regular queue monitoring
setInterval(async () => {
  const count = await getSyncQueueCount();
  if (count > 100) {
    console.warn('Large sync queue detected:', count);
    // Alert user or send telemetry
  }
}, 60000); // Check every minute
```

### Cleanup Tasks

Periodically clean old sync operations:
```sql
-- Delete old successful operations (keep for 30 days)
DELETE FROM sync_operations 
WHERE status = 'success' 
AND completed_at < NOW() - INTERVAL 30 DAY;

-- Delete old failed operations (keep for 7 days)
DELETE FROM sync_operations 
WHERE status = 'failed' 
AND attempted_at < NOW() - INTERVAL 7 DAY;
```

## Troubleshooting

### Issue: Migrations Fail

**Symptoms**: Migration error about existing columns

**Solution**:
```bash
# Check current schema
php artisan db:show

# If columns exist, skip migration
php artisan migrate:rollback --step=1
# Or manually mark as migrated
php artisan migrate --pretend
```

### Issue: Sync Endpoint Returns 404

**Symptoms**: POST /api/sync returns 404

**Solution**:
```bash
# Clear route cache
php artisan route:clear
php artisan route:cache

# Verify route exists
php artisan route:list | grep sync
```

### Issue: Device ID Not Persisting

**Symptoms**: New device ID generated every time

**Solution**:
```typescript
// Check SecureStore availability
import * as SecureStore from 'expo-secure-store';

const test = await SecureStore.isAvailableAsync();
console.log('SecureStore available:', test);

// Use AsyncStorage as fallback
```

### Issue: Operations Not Syncing

**Symptoms**: Queue grows but sync doesn't trigger

**Solution**:
1. Check network status detection
2. Verify auto-sync hook is enabled
3. Check console for sync errors
4. Manually trigger sync to test

```typescript
import { syncOfflineOperations } from './utils/syncManager';
await syncOfflineOperations();
```

## Performance Optimization

### Backend

1. **Add indexes for common queries**:
```sql
CREATE INDEX idx_sync_operations_device_status 
ON sync_operations(device_id, status);

CREATE INDEX idx_sync_operations_entity 
ON sync_operations(entity_type, entity_id);
```

2. **Configure queue processing**:
```php
// config/sync.php
return [
    'batch_size' => env('SYNC_BATCH_SIZE', 50),
    'max_retries' => env('SYNC_MAX_RETRIES', 3),
    'retry_delay' => env('SYNC_RETRY_DELAY', 60), // seconds
];
```

### Frontend

1. **Adjust batch size for slow networks**:
```typescript
// syncManager.ts
const BATCH_SIZE = 5; // Reduce for slow networks
```

2. **Implement queue size limits**:
```typescript
const MAX_QUEUE_SIZE = 500;

if ((await getSyncQueueCount()) > MAX_QUEUE_SIZE) {
  Alert.alert('Queue Full', 'Please sync before continuing');
}
```

## Security Considerations

1. **Validate all sync operations**:
```php
// SyncController.php
// Already implemented - validates entity types, operation types, etc.
```

2. **Rate limiting**:
```php
// routes/api.php
Route::middleware(['throttle:60,1'])->group(function () {
    Route::post('/sync', [SyncController::class, 'sync']);
});
```

3. **Audit logging**:
```php
// Add to SyncController
Log::info('Sync operation', [
    'user_id' => $request->user()->id,
    'device_id' => $request->device_id,
    'operation_count' => count($request->operations),
]);
```

## Rollback Procedure

If you need to rollback the offline sync feature:

### Backend Rollback

```bash
cd backend

# Rollback migrations
php artisan migrate:rollback --step=2

# Remove controller and model (optional)
rm app/Http/Controllers/API/SyncController.php
rm app/Models/SyncOperation.php

# Restore routes
# Edit routes/api.php and remove sync routes

# Clear caches
php artisan route:clear
php artisan cache:clear
```

### Frontend Rollback

```bash
cd frontend

# Revert to previous version of files
git checkout HEAD~1 -- src/utils/syncManager.ts
git checkout HEAD~1 -- src/utils/offlineStorage.ts

# Remove new files
rm src/utils/deviceManager.ts
rm src/utils/offlineService.ts
rm src/hooks/useAutoSync.ts

# Update App.tsx to remove auto-sync hook
```

## Support and Documentation

- **Architecture**: `docs/architecture/OFFLINE_SYNC_ARCHITECTURE.md`
- **Quick Reference**: `docs/architecture/OFFLINE_SYNC_QUICKREF.md`
- **API Documentation**: `http://localhost:8000/api/documentation`
- **GitHub Issues**: Report bugs and request features

## Success Criteria

Deployment is successful when:

✅ All migrations run without errors
✅ Sync endpoints respond correctly
✅ Device ID persists across app restarts
✅ Operations queue when offline
✅ Auto-sync triggers on reconnection
✅ Manual sync completes successfully
✅ Conflicts are detected and handled
✅ No data loss under concurrent access
✅ Performance is acceptable (< 1s per batch)
✅ Users can work seamlessly offline

## Next Steps

After successful deployment:

1. Monitor sync operation logs for errors
2. Collect user feedback on offline experience
3. Optimize batch size based on usage patterns
4. Implement advanced features (delta sync, field-level merge)
5. Add analytics for sync performance metrics
