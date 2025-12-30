/**
 * Conflict Resolution Service
 * Handles data conflicts during synchronization
 * Server is always the authoritative source of truth
 */

export interface ConflictData {
  localVersion: number;
  serverVersion: number;
  localData: any;
  serverData: any;
  entity: string;
  entityId: number;
}

export interface ConflictResolution {
  action: 'use_server' | 'merge' | 'retry';
  resolvedData?: any;
  reason: string;
}

class ConflictResolutionService {
  /**
   * Detect if there's a version conflict
   */
  hasConflict(localVersion: number, serverVersion: number): boolean {
    return localVersion !== serverVersion;
  }

  /**
   * Resolve conflict with server as source of truth
   * This implements the deterministic conflict resolution strategy
   */
  resolveConflict(conflict: ConflictData): ConflictResolution {
    // Server is always the authoritative source
    if (conflict.serverVersion > conflict.localVersion) {
      return {
        action: 'use_server',
        resolvedData: conflict.serverData,
        reason: 'Server has newer version - using server data as source of truth',
      };
    }

    // If versions are equal but data differs, still prefer server
    if (conflict.serverVersion === conflict.localVersion) {
      return {
        action: 'use_server',
        resolvedData: conflict.serverData,
        reason: 'Version match but data differs - using server data to maintain consistency',
      };
    }

    // Local version is newer (shouldn't happen in normal flow)
    // This indicates a sync issue - retry sync
    return {
      action: 'retry',
      reason: 'Local version newer than server - sync retry needed',
    };
  }

  /**
   * Merge non-conflicting fields (optional strategy for specific cases)
   * Only used when explicitly needed, server data takes precedence for conflicts
   */
  mergeData(localData: any, serverData: any, entity: string): any {
    // For most entities, server data takes precedence
    // This method is provided for future extension if needed
    return {
      ...serverData, // Server data always wins
      // Preserve local timestamps for audit
      local_modified_at: localData.updated_at,
      local_version: localData.version,
    };
  }

  /**
   * Validate data before sync attempt
   */
  validateSyncData(data: any, entity: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Common validations
    if (!data.id && data.id !== 0) {
      errors.push('Missing entity ID');
    }

    if (!data.version && data.version !== 0) {
      errors.push('Missing version number');
    }

    // Entity-specific validations
    switch (entity) {
      case 'collection':
        if (!data.supplier_id) errors.push('Missing supplier_id');
        if (!data.product_id) errors.push('Missing product_id');
        if (!data.quantity || data.quantity <= 0) errors.push('Invalid quantity');
        break;

      case 'payment':
        if (!data.supplier_id) errors.push('Missing supplier_id');
        if (!data.amount || data.amount <= 0) errors.push('Invalid amount');
        if (!data.type) errors.push('Missing payment type');
        break;

      case 'supplier':
        if (!data.name) errors.push('Missing supplier name');
        if (!data.code) errors.push('Missing supplier code');
        break;

      case 'product':
        if (!data.name) errors.push('Missing product name');
        if (!data.base_unit) errors.push('Missing base unit');
        break;

      case 'rate':
        if (!data.product_id) errors.push('Missing product_id');
        if (!data.rate || data.rate <= 0) errors.push('Invalid rate');
        if (!data.unit) errors.push('Missing unit');
        if (!data.effective_from) errors.push('Missing effective_from date');
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get conflict resolution strategy description
   */
  getStrategyDescription(): string {
    return `
Conflict Resolution Strategy:
1. Server is ALWAYS the authoritative source of truth
2. Version conflicts are resolved by accepting server data
3. Local changes that conflict are discarded
4. Users are notified of discarded changes
5. Optimistic locking prevents most conflicts before they occur
6. All operations are atomic and transactional
    `.trim();
  }

  /**
   * Log conflict for audit purposes
   */
  logConflict(conflict: ConflictData, resolution: ConflictResolution): void {
    const log = {
      timestamp: new Date().toISOString(),
      entity: conflict.entity,
      entityId: conflict.entityId,
      localVersion: conflict.localVersion,
      serverVersion: conflict.serverVersion,
      resolution: resolution.action,
      reason: resolution.reason,
    };

    console.log('[Conflict Resolution]', JSON.stringify(log, null, 2));

    // In production, this should be sent to a logging service
    // or stored locally for later review
  }

  /**
   * Prepare sync request with version information
   */
  prepareSyncRequest(localData: any): any {
    return {
      ...localData,
      version: localData.version || 1,
      sync_timestamp: Date.now(),
      client_id: this.getClientId(),
    };
  }

  /**
   * Get unique client ID for tracking multi-device operations
   */
  private getClientId(): string {
    // In a real app, this would be a persistent device identifier
    // For now, generate or retrieve from storage
    let clientId = localStorage.getItem('client_id');
    if (!clientId) {
      clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('client_id', clientId);
    }
    return clientId;
  }

  /**
   * Handle sync failure with retry logic
   */
  shouldRetry(attemptCount: number, error: any): boolean {
    // Network errors should be retried
    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
      return attemptCount < 3;
    }

    // Version conflicts should not be retried, resolve immediately
    if (error.code === 'VERSION_CONFLICT') {
      return false;
    }

    // Validation errors should not be retried
    if (error.code === 'VALIDATION_ERROR') {
      return false;
    }

    // Other errors: retry once
    return attemptCount < 1;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  getRetryDelay(attemptCount: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s...
    return Math.min(1000 * Math.pow(2, attemptCount), 30000);
  }
}

export default new ConflictResolutionService();
