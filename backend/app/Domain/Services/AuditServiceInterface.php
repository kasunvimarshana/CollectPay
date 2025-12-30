<?php

namespace App\Domain\Services;

/**
 * Audit Service Interface
 *
 * Defines contract for audit logging operations.
 * Follows Dependency Inversion Principle - domain defines interface,
 * infrastructure provides implementation.
 */
interface AuditServiceInterface
{
    /**
     * Log an action performed on an entity
     *
     * @param  string  $action  Action type (create, update, delete, etc.)
     * @param  string  $entityType  Entity class name
     * @param  int|null  $entityId  Entity ID
     * @param  array|null  $oldValues  Old values before change
     * @param  array|null  $newValues  New values after change
     * @param  string  $description  Human-readable description
     * @param  int|null  $userId  User who performed the action
     */
    public function log(
        string $action,
        string $entityType,
        ?int $entityId,
        ?array $oldValues,
        ?array $newValues,
        string $description,
        ?int $userId
    ): void;
}
