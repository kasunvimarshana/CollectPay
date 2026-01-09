/**
 * ConflictResolutionService Unit Tests
 */

import ConflictResolutionService, {
  ConflictData,
  ConflictResolution,
} from '../ConflictResolutionService';

describe('ConflictResolutionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage mock
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      key: jest.fn(),
      length: 0,
    };
  });

  describe('hasConflict', () => {
    it('should return true when versions differ', () => {
      expect(ConflictResolutionService.hasConflict(1, 2)).toBe(true);
      expect(ConflictResolutionService.hasConflict(5, 3)).toBe(true);
    });

    it('should return false when versions match', () => {
      expect(ConflictResolutionService.hasConflict(1, 1)).toBe(false);
      expect(ConflictResolutionService.hasConflict(10, 10)).toBe(false);
    });
  });

  describe('resolveConflict', () => {
    const mockConflict: ConflictData = {
      localVersion: 1,
      serverVersion: 2,
      localData: { id: 1, name: 'Local', version: 1 },
      serverData: { id: 1, name: 'Server', version: 2 },
      entity: 'supplier',
      entityId: 1,
    };

    it('should use server data when server version is newer', () => {
      const result = ConflictResolutionService.resolveConflict(mockConflict);

      expect(result.action).toBe('use_server');
      expect(result.resolvedData).toEqual(mockConflict.serverData);
      expect(result.reason).toContain('Server has newer version');
    });

    it('should use server data when versions match but data differs', () => {
      const conflict: ConflictData = {
        ...mockConflict,
        localVersion: 2,
        serverVersion: 2,
      };

      const result = ConflictResolutionService.resolveConflict(conflict);

      expect(result.action).toBe('use_server');
      expect(result.resolvedData).toEqual(mockConflict.serverData);
      expect(result.reason).toContain('Version match but data differs');
    });

    it('should retry when local version is newer than server', () => {
      const conflict: ConflictData = {
        ...mockConflict,
        localVersion: 3,
        serverVersion: 2,
      };

      const result = ConflictResolutionService.resolveConflict(conflict);

      expect(result.action).toBe('retry');
      expect(result.reason).toContain('sync retry needed');
    });
  });

  describe('mergeData', () => {
    it('should prioritize server data in merge', () => {
      const localData = {
        id: 1,
        name: 'Local Name',
        updated_at: '2024-01-01',
        version: 1,
      };

      const serverData = {
        id: 1,
        name: 'Server Name',
        updated_at: '2024-01-02',
        version: 2,
      };

      const result = ConflictResolutionService.mergeData(localData, serverData, 'supplier');

      expect(result.name).toBe('Server Name');
      expect(result.version).toBe(2);
      expect(result.local_modified_at).toBe(localData.updated_at);
      expect(result.local_version).toBe(localData.version);
    });
  });

  describe('validateSyncData', () => {
    it('should validate common fields (id and version)', () => {
      // For update action, ID is required
      const invalidData1 = { version: 1, name: 'Test', code: 'TEST' };
      const result1 = ConflictResolutionService.validateSyncData(invalidData1, 'supplier', 'update');
      expect(result1.valid).toBe(false);
      expect(result1.errors).toContain('Missing entity ID');

      // For update action, version is required
      const invalidData2 = { id: 1, name: 'Test', code: 'TEST' };
      const result2 = ConflictResolutionService.validateSyncData(invalidData2, 'supplier', 'update');
      expect(result2.valid).toBe(false);
      expect(result2.errors).toContain('Missing version number for update');
    });

    it('should validate collection entity', () => {
      const invalidCollection = { id: 1, version: 1 };
      const result = ConflictResolutionService.validateSyncData(invalidCollection, 'collection');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing supplier_id');
      expect(result.errors).toContain('Missing product_id');
      expect(result.errors).toContain('Invalid quantity');
    });

    it('should validate payment entity', () => {
      const invalidPayment = { id: 1, version: 1 };
      const result = ConflictResolutionService.validateSyncData(invalidPayment, 'payment');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing supplier_id');
      expect(result.errors).toContain('Invalid amount');
      expect(result.errors).toContain('Missing payment type');
    });

    it('should validate supplier entity', () => {
      const invalidSupplier = { id: 1, version: 1 };
      const result = ConflictResolutionService.validateSyncData(invalidSupplier, 'supplier');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing supplier name');
      expect(result.errors).toContain('Missing supplier code');
    });

    it('should validate product entity', () => {
      const invalidProduct = { id: 1, version: 1 };
      const result = ConflictResolutionService.validateSyncData(invalidProduct, 'product');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing product name');
      expect(result.errors).toContain('Missing base unit');
    });

    it('should validate rate entity', () => {
      const invalidRate = { id: 1, version: 1 };
      const result = ConflictResolutionService.validateSyncData(invalidRate, 'rate');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing product_id');
      expect(result.errors).toContain('Invalid rate');
      expect(result.errors).toContain('Missing unit');
      expect(result.errors).toContain('Missing effective_from date');
    });

    it('should pass validation for valid data', () => {
      const validSupplier = {
        id: 1,
        version: 1,
        name: 'Test Supplier',
        code: 'SUP001',
      };

      const result = ConflictResolutionService.validateSyncData(validSupplier, 'supplier');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('getStrategyDescription', () => {
    it('should return strategy description', () => {
      const description = ConflictResolutionService.getStrategyDescription();

      expect(description).toContain('Server is ALWAYS the authoritative source');
      expect(description).toContain('Version conflicts');
      expect(description).toContain('Optimistic locking');
    });
  });

  describe('logConflict', () => {
    it('should log conflict details', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const conflict: ConflictData = {
        localVersion: 1,
        serverVersion: 2,
        localData: { id: 1 },
        serverData: { id: 1 },
        entity: 'supplier',
        entityId: 1,
      };

      const resolution: ConflictResolution = {
        action: 'use_server',
        resolvedData: conflict.serverData,
        reason: 'Test reason',
      };

      ConflictResolutionService.logConflict(conflict, resolution);

      expect(warnSpy).toHaveBeenCalled();
      const logCall = warnSpy.mock.calls[0];
      expect(logCall[0]).toContain('[WARN]');
      expect(logCall[0]).toContain('[CONFLICT]');

      warnSpy.mockRestore();
    });
  });

  describe('prepareSyncRequest', () => {
    it('should add version and sync metadata', () => {
      const localData = {
        id: 1,
        name: 'Test',
      };

      const result = ConflictResolutionService.prepareSyncRequest(localData);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Test');
      expect(result.version).toBe(1);
      expect(result.sync_timestamp).toBeDefined();
      expect(result.client_id).toBeDefined();
    });

    it('should preserve existing version', () => {
      const localData = {
        id: 1,
        name: 'Test',
        version: 5,
      };

      const result = ConflictResolutionService.prepareSyncRequest(localData);

      expect(result.version).toBe(5);
    });
  });

  describe('shouldRetry', () => {
    it('should retry network errors up to 3 times', () => {
      const networkError = { code: 'NETWORK_ERROR' };

      expect(ConflictResolutionService.shouldRetry(0, networkError)).toBe(true);
      expect(ConflictResolutionService.shouldRetry(1, networkError)).toBe(true);
      expect(ConflictResolutionService.shouldRetry(2, networkError)).toBe(true);
      expect(ConflictResolutionService.shouldRetry(3, networkError)).toBe(false);
    });

    it('should retry timeout errors up to 3 times', () => {
      const timeoutError = { code: 'TIMEOUT' };

      expect(ConflictResolutionService.shouldRetry(0, timeoutError)).toBe(true);
      expect(ConflictResolutionService.shouldRetry(2, timeoutError)).toBe(true);
      expect(ConflictResolutionService.shouldRetry(3, timeoutError)).toBe(false);
    });

    it('should not retry version conflicts', () => {
      const versionError = { code: 'VERSION_CONFLICT' };

      expect(ConflictResolutionService.shouldRetry(0, versionError)).toBe(false);
      expect(ConflictResolutionService.shouldRetry(1, versionError)).toBe(false);
    });

    it('should not retry validation errors', () => {
      const validationError = { code: 'VALIDATION_ERROR' };

      expect(ConflictResolutionService.shouldRetry(0, validationError)).toBe(false);
      expect(ConflictResolutionService.shouldRetry(1, validationError)).toBe(false);
    });

    it('should retry other errors once', () => {
      const otherError = { code: 'UNKNOWN_ERROR' };

      expect(ConflictResolutionService.shouldRetry(0, otherError)).toBe(true);
      expect(ConflictResolutionService.shouldRetry(1, otherError)).toBe(false);
    });
  });

  describe('getRetryDelay', () => {
    it('should implement exponential backoff', () => {
      expect(ConflictResolutionService.getRetryDelay(0)).toBe(1000); // 1 second
      expect(ConflictResolutionService.getRetryDelay(1)).toBe(2000); // 2 seconds
      expect(ConflictResolutionService.getRetryDelay(2)).toBe(4000); // 4 seconds
      expect(ConflictResolutionService.getRetryDelay(3)).toBe(8000); // 8 seconds
    });

    it('should cap at 30 seconds', () => {
      expect(ConflictResolutionService.getRetryDelay(10)).toBe(30000); // capped at 30s
      expect(ConflictResolutionService.getRetryDelay(20)).toBe(30000); // capped at 30s
    });
  });
});
