# Offline Sync - Testing Guide

## Overview

This guide provides comprehensive test scenarios for validating the offline sync functionality.

## Test Environment Setup

### Prerequisites

- Backend server running locally or on test environment
- Frontend app running on device/simulator
- Network proxy tool (optional, for network manipulation)
- Multiple devices/simulators for multi-device tests

### Test Data Setup

```bash
# Backend: Seed test data
cd backend
php artisan db:seed

# Or create specific test data
php artisan tinker
>>> User::factory()->count(3)->create();
>>> Supplier::factory()->count(10)->create();
>>> Product::factory()->count(5)->create();
```

## Unit Tests

### Backend Unit Tests

#### Test 1: Sync Fields Migration

```php
// tests/Unit/MigrationTest.php
public function test_sync_fields_added_to_tables()
{
    $this->assertTrue(Schema::hasColumn('suppliers', 'device_id'));
    $this->assertTrue(Schema::hasColumn('suppliers', 'sync_metadata'));
    $this->assertTrue(Schema::hasColumn('collections', 'device_id'));
    $this->assertTrue(Schema::hasColumn('payments', 'device_id'));
}
```

#### Test 2: SyncOperation Model

```php
// tests/Unit/SyncOperationTest.php
public function test_sync_operation_can_be_marked_as_success()
{
    $operation = SyncOperation::factory()->create(['status' => 'pending']);
    $operation->markAsSuccess(123);
    
    $this->assertEquals('success', $operation->status);
    $this->assertEquals(123, $operation->entity_id);
    $this->assertNotNull($operation->completed_at);
}

public function test_sync_operation_can_be_marked_as_conflict()
{
    $operation = SyncOperation::factory()->create();
    $conflictData = ['client_version' => 1, 'server_version' => 2];
    $operation->markAsConflict($conflictData);
    
    $this->assertEquals('conflict', $operation->status);
    $this->assertEquals($conflictData, $operation->conflict_data);
}
```

#### Test 3: Version Control

```php
// tests/Unit/VersionControlTest.php
public function test_version_increments_on_update()
{
    $supplier = Supplier::factory()->create(['version' => 1]);
    $supplier->update(['name' => 'Updated Name']);
    
    // Version should remain 1 (controlled by controller)
    $this->assertEquals(1, $supplier->fresh()->version);
}
```

### Frontend Unit Tests

#### Test 1: Device ID Generation

```typescript
// __tests__/deviceManager.test.ts
import { getDeviceId, clearDeviceId } from '../src/utils/deviceManager';

describe('Device ID Manager', () => {
  it('should generate device ID with correct format', async () => {
    await clearDeviceId();
    const deviceId = await getDeviceId();
    
    expect(deviceId).toMatch(/^device_\d+_[a-z0-9]+$/);
  });

  it('should persist device ID', async () => {
    const deviceId1 = await getDeviceId();
    const deviceId2 = await getDeviceId();
    
    expect(deviceId1).toBe(deviceId2);
  });
});
```

#### Test 2: Queue Operations

```typescript
// __tests__/offlineStorage.test.ts
import { addToSyncQueue, getSyncQueue, removeFromSyncQueue } from '../src/utils/offlineStorage';

describe('Offline Storage', () => {
  it('should add operation to queue', async () => {
    const operation = {
      type: 'create' as const,
      entity: 'supplier' as const,
      data: { name: 'Test' },
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    await addToSyncQueue(operation);
    const queue = await getSyncQueue();
    
    expect(queue.length).toBeGreaterThan(0);
    expect(queue[0].type).toBe('create');
  });

  it('should remove operation from queue', async () => {
    const queue = await getSyncQueue();
    const firstOp = queue[0];
    
    await removeFromSyncQueue(firstOp.id);
    const newQueue = await getSyncQueue();
    
    expect(newQueue.length).toBe(queue.length - 1);
  });
});
```

## Integration Tests

### Backend Integration Tests

#### Test 1: Sync Endpoint - Empty Operations

```php
// tests/Feature/SyncControllerTest.php
public function test_sync_with_empty_operations()
{
    $user = User::factory()->create();
    
    $response = $this->actingAs($user)->postJson('/api/sync', [
        'device_id' => 'test_device_123',
        'operations' => [],
    ]);
    
    $response->assertStatus(200);
    $response->assertJson(['success' => true, 'results' => []]);
}
```

#### Test 2: Sync Endpoint - Create Operation

```php
public function test_sync_create_operation()
{
    $user = User::factory()->create();
    
    $response = $this->actingAs($user)->postJson('/api/sync', [
        'device_id' => 'test_device_123',
        'operations' => [
            [
                'local_id' => 'local_123',
                'entity' => 'supplier',
                'operation' => 'create',
                'data' => [
                    'name' => 'Test Supplier',
                    'code' => 'TEST-001',
                ],
                'timestamp' => now()->toISOString(),
            ],
        ],
    ]);
    
    $response->assertStatus(200);
    $response->assertJsonPath('results.0.status', 'success');
    $this->assertDatabaseHas('suppliers', ['code' => 'TEST-001']);
}
```

#### Test 3: Sync Endpoint - Version Conflict

```php
public function test_sync_detects_version_conflict()
{
    $user = User::factory()->create();
    $supplier = Supplier::factory()->create(['version' => 2]);
    
    $response = $this->actingAs($user)->postJson('/api/sync', [
        'device_id' => 'test_device_123',
        'operations' => [
            [
                'local_id' => 'local_123',
                'entity' => 'supplier',
                'operation' => 'update',
                'data' => [
                    'id' => $supplier->id,
                    'name' => 'Updated Name',
                    'version' => 1, // Outdated version
                ],
                'timestamp' => now()->toISOString(),
            ],
        ],
    ]);
    
    $response->assertStatus(200);
    $response->assertJsonPath('results.0.status', 'conflict');
}
```

#### Test 4: Sync Endpoint - Duplicate Detection

```php
public function test_sync_detects_duplicates()
{
    $user = User::factory()->create();
    
    // First sync
    $this->actingAs($user)->postJson('/api/sync', [
        'device_id' => 'test_device_123',
        'operations' => [
            [
                'local_id' => 'local_123',
                'entity' => 'supplier',
                'operation' => 'create',
                'data' => [
                    'name' => 'Test Supplier',
                    'code' => 'TEST-DUP',
                ],
                'timestamp' => now()->toISOString(),
            ],
        ],
    ]);
    
    // Duplicate sync
    $response = $this->actingAs($user)->postJson('/api/sync', [
        'device_id' => 'test_device_123',
        'operations' => [
            [
                'local_id' => 'local_123', // Same local_id
                'entity' => 'supplier',
                'operation' => 'create',
                'data' => [
                    'name' => 'Test Supplier',
                    'code' => 'TEST-DUP',
                ],
                'timestamp' => now()->toISOString(),
            ],
        ],
    ]);
    
    $response->assertJsonPath('results.0.status', 'duplicate');
    $this->assertDatabaseCount('suppliers', 1); // Only one record
}
```

### Frontend Integration Tests

#### Test 1: Auto-Sync on Reconnection

```typescript
// __tests__/integration/autoSync.test.ts
import NetInfo from '@react-native-community/netinfo';
import { addToSyncQueue } from '../src/utils/offlineStorage';
import { useAutoSync } from '../src/hooks/useAutoSync';

describe('Auto-Sync', () => {
  it('should trigger sync when network reconnects', async () => {
    // Add operation while offline
    await addToSyncQueue({
      type: 'create',
      entity: 'supplier',
      data: { name: 'Test', code: 'TEST' },
      timestamp: new Date().toISOString(),
      retryCount: 0,
    });
    
    // Simulate network disconnection
    NetInfo.configure({
      reachabilityUrl: 'https://offline-test.com',
      reachabilityTest: async () => false,
    });
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate network reconnection
    NetInfo.configure({
      reachabilityUrl: 'https://online-test.com',
      reachabilityTest: async () => true,
    });
    
    // Verify sync was triggered (check logs or queue)
  });
});
```

## Manual Test Scenarios

### Scenario 1: Basic Offline Operation

**Objective**: Verify basic offline functionality

**Steps**:
1. Open app while online
2. Navigate to Suppliers screen
3. Turn off network (airplane mode)
4. Create a new supplier
5. Verify offline indicator appears (red bar)
6. Verify supplier appears in list (with pending badge)
7. Turn on network
8. Verify auto-sync triggers
9. Verify supplier syncs successfully
10. Refresh from server and verify data matches

**Expected Result**: ✅ Supplier created offline, synced when online, data consistent

### Scenario 2: Multiple Offline Operations

**Objective**: Verify queue handles multiple operations

**Steps**:
1. Go offline
2. Create 5 suppliers
3. Update 3 suppliers
4. Delete 2 suppliers
5. Verify offline indicator shows "10 pending"
6. Go online
7. Observe sync progress (10 operations)
8. Verify all operations complete successfully

**Expected Result**: ✅ All 10 operations synced, queue cleared

### Scenario 3: Version Conflict

**Objective**: Verify conflict detection

**Setup**: Two devices (Device A and Device B)

**Steps**:
1. Device A: Go offline
2. Device B: Update supplier "Test Co" name to "Test Company"
3. Device A: Update same supplier name to "Test Corporation"
4. Device A: Go online
5. Observe conflict notification
6. Verify server data preserved ("Test Company")

**Expected Result**: ✅ Conflict detected, user notified, server data wins

### Scenario 4: Large Queue

**Objective**: Verify batch processing

**Steps**:
1. Go offline
2. Create 50 suppliers
3. Go online
4. Observe batch processing (5 batches of 10)
5. Verify progress indicator updates
6. Verify all 50 suppliers synced

**Expected Result**: ✅ Efficient batch processing, all synced successfully

### Scenario 5: Network Interruption During Sync

**Objective**: Verify resilience

**Steps**:
1. Queue 20 operations offline
2. Go online to trigger sync
3. After 5 operations complete, turn off network
4. Observe partial sync (5 successful)
5. Turn on network again
6. Verify remaining 15 operations retry
7. Verify all 20 eventually complete

**Expected Result**: ✅ Partial sync handled gracefully, retry works

### Scenario 6: Concurrent Multi-Device Operations

**Objective**: Verify multi-device support

**Setup**: Two devices (Device A and Device B)

**Steps**:
1. Both devices online
2. Device A: Create supplier "Alpha"
3. Device B: Create supplier "Beta"
4. Device A: Go offline
5. Device A: Create supplier "Gamma"
6. Device B: Create supplier "Delta"
7. Device A: Go online
8. Verify all 4 suppliers exist on server
9. Verify no duplicates
10. Verify both devices show all suppliers

**Expected Result**: ✅ All operations synced, no conflicts, data consistent

### Scenario 7: Retry Logic

**Objective**: Verify retry mechanism

**Steps**:
1. Go offline
2. Create supplier "Retry Test"
3. Mock server to return errors
4. Go online
5. Observe first sync attempt fail
6. Wait for retry (with backoff)
7. Observe second attempt fail
8. Wait for third attempt
9. Fix server (remove mock)
10. Observe fourth attempt succeed

**Expected Result**: ✅ Operation retried up to max attempts, succeeded after fix

### Scenario 8: App Restart with Queue

**Objective**: Verify queue persistence

**Steps**:
1. Go offline
2. Create 5 suppliers
3. Verify queue has 5 operations
4. Close app (force quit)
5. Reopen app while still offline
6. Verify offline indicator shows "5 pending"
7. Go online
8. Verify all 5 operations sync

**Expected Result**: ✅ Queue persists across app restarts

### Scenario 9: Duplicate Prevention

**Objective**: Verify duplicate detection

**Steps**:
1. Go offline
2. Create supplier "Duplicate Test"
3. Go online, sync completes
4. Go offline again
5. Manually trigger sync (button)
6. Observe sync completes without errors
7. Verify only one "Duplicate Test" on server

**Expected Result**: ✅ Duplicate sync prevented, only one record created

### Scenario 10: Mixed Success and Failure

**Objective**: Verify error handling

**Steps**:
1. Go offline
2. Create supplier with valid data "Valid"
3. Create supplier with invalid data (missing required field)
4. Update existing supplier with valid data
5. Delete non-existent supplier
6. Go online
7. Observe sync results:
   - Create "Valid": Success
   - Create invalid: Failed
   - Update: Success
   - Delete: Not found
8. Verify partial sync notification

**Expected Result**: ✅ Valid operations succeed, invalid fail gracefully

## Performance Tests

### Test 1: Large Queue Performance

**Objective**: Verify acceptable performance with large queue

**Steps**:
1. Queue 500 operations
2. Measure sync time
3. Verify all operations complete within reasonable time

**Acceptance Criteria**: < 5 minutes for 500 operations (< 0.6s per operation)

### Test 2: Memory Usage

**Objective**: Verify reasonable memory usage

**Steps**:
1. Queue 1000 operations
2. Monitor memory usage
3. Verify no memory leaks

**Acceptance Criteria**: Memory growth < 50MB for 1000 operations

### Test 3: Storage Limits

**Objective**: Verify storage handling

**Steps**:
1. Queue operations until storage limit reached
2. Verify graceful handling
3. Verify user notification

**Acceptance Criteria**: Alert shown when queue > 500 operations

## Stress Tests

### Test 1: Rapid Operations

**Objective**: Verify handling of rapid operations

**Steps**:
1. Create 100 suppliers as fast as possible
2. Verify all operations queued
3. Verify all sync successfully

### Test 2: Concurrent Sync Requests

**Objective**: Verify server handles concurrent syncs

**Steps**:
1. Trigger sync from 10 devices simultaneously
2. Each device has 50 operations
3. Verify all syncs complete without errors

### Test 3: Network Flapping

**Objective**: Verify resilience to unstable network

**Steps**:
1. Queue 50 operations
2. Alternate online/offline every 5 seconds during sync
3. Verify all operations eventually complete

## Security Tests

### Test 1: Authentication Required

```bash
# Try sync without auth token
curl -X POST http://localhost:8000/api/sync \
  -H "Content-Type: application/json" \
  -d '{"device_id":"test","operations":[]}'

# Expected: 401 Unauthenticated
```

### Test 2: Malicious Payload

```bash
# Try SQL injection
curl -X POST http://localhost:8000/api/sync \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"device_id":"test","operations":[{"entity":"supplier; DROP TABLE suppliers;--"}]}'

# Expected: 422 Validation Error
```

### Test 3: Data Validation

```bash
# Try invalid entity type
curl -X POST http://localhost:8000/api/sync \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"device_id":"test","operations":[{"entity":"invalid_entity","operation":"create","data":{},"timestamp":"2025-01-01T00:00:00Z","local_id":"test"}]}'

# Expected: 422 Validation Error
```

## Test Coverage Goals

- **Backend**: > 80% code coverage
- **Frontend**: > 70% code coverage
- **Integration**: All critical paths tested
- **Manual**: All scenarios pass
- **Performance**: All acceptance criteria met

## Continuous Testing

### Automated Tests

```bash
# Backend
cd backend
php artisan test --filter SyncController

# Frontend
cd frontend
npm test -- --testPathPattern=sync
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test Offline Sync
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Backend Tests
        run: |
          cd backend
          php artisan test --filter Sync
      - name: Frontend Tests
        run: |
          cd frontend
          npm test -- --testPathPattern=sync
```

## Test Reporting

### Bug Report Template

```markdown
**Test Scenario**: [e.g., Scenario 3: Version Conflict]
**Expected Result**: [e.g., Conflict detected, user notified]
**Actual Result**: [e.g., No conflict detected, data overwritten]
**Steps to Reproduce**:
1. ...
2. ...
**Environment**:
- OS: [e.g., iOS 17.0]
- Device: [e.g., iPhone 14]
- App Version: [e.g., 2.4.0]
**Logs**: [Attach logs]
**Screenshots**: [Attach screenshots]
```

## Success Criteria

All tests pass when:

✅ All unit tests pass (100%)
✅ All integration tests pass (100%)
✅ All manual scenarios pass
✅ Performance criteria met
✅ Security tests pass
✅ No data loss observed
✅ No data corruption observed
✅ Conflicts handled correctly
✅ User experience is smooth
