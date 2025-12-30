<?php

namespace App\Infrastructure\Services;

use App\Domain\Services\AuditServiceInterface;
use App\Models\AuditLog;

/**
 * Eloquent Audit Service
 *
 * Infrastructure implementation of audit logging using Laravel's Eloquent.
 * Bridges domain interface with framework-specific implementation.
 */
class EloquentAuditService implements AuditServiceInterface
{
    /**
     * {@inheritDoc}
     */
    public function log(
        string $action,
        string $entityType,
        ?int $entityId,
        ?array $oldValues,
        ?array $newValues,
        string $description,
        ?int $userId
    ): void {
        AuditLog::log(
            $action,
            $entityType,
            $entityId,
            $oldValues,
            $newValues,
            $description,
            $userId
        );
    }
}
