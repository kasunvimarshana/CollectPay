<?php

declare(strict_types=1);

namespace Infrastructure\Logging;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

/**
 * Audit Logger Service
 * Provides centralized audit logging functionality
 */
final class AuditLogger
{
    public function log(
        string $entityType,
        string $entityId,
        string $action,
        ?array $oldValues = null,
        ?array $newValues = null
    ): void {
        $userId = Auth::check() ? Auth::id() : null;
        $ipAddress = request()->ip();
        $userAgent = request()->userAgent();

        DB::table('audit_logs')->insert([
            'user_id' => $userId,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'action' => $action,
            'old_values' => $oldValues ? json_encode($oldValues) : null,
            'new_values' => $newValues ? json_encode($newValues) : null,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'created_at' => now(),
        ]);
    }

    public function logCreate(string $entityType, string $entityId, array $values): void
    {
        $this->log($entityType, $entityId, 'create', null, $values);
    }

    public function logUpdate(string $entityType, string $entityId, array $oldValues, array $newValues): void
    {
        $this->log($entityType, $entityId, 'update', $oldValues, $newValues);
    }

    public function logDelete(string $entityType, string $entityId, array $values): void
    {
        $this->log($entityType, $entityId, 'delete', $values, null);
    }
}
