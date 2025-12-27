<?php

declare(strict_types=1);

namespace TrackVault\Infrastructure\Logging;

use DateTimeImmutable;

/**
 * Audit Logger
 * 
 * Logs all important system operations for audit purposes
 */
final class AuditLogger
{
    private \PDO $connection;

    public function __construct(\PDO $connection)
    {
        $this->connection = $connection;
    }

    public function log(
        ?string $userId,
        string $entityType,
        string $entityId,
        string $action,
        array $changes = [],
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): void {
        $stmt = $this->connection->prepare(
            'INSERT INTO audit_logs (user_id, entity_type, entity_id, action, changes, ip_address, user_agent, created_at)
             VALUES (:user_id, :entity_type, :entity_id, :action, :changes, :ip_address, :user_agent, :created_at)'
        );

        $stmt->execute([
            'user_id' => $userId,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'action' => $action,
            'changes' => json_encode($changes),
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'created_at' => (new DateTimeImmutable())->format('Y-m-d H:i:s'),
        ]);
    }

    public function logCreate(string $userId, string $entityType, string $entityId, array $data): void
    {
        $this->log($userId, $entityType, $entityId, 'CREATE', ['data' => $data]);
    }

    public function logUpdate(string $userId, string $entityType, string $entityId, array $oldData, array $newData): void
    {
        $changes = [
            'old' => $oldData,
            'new' => $newData,
        ];
        $this->log($userId, $entityType, $entityId, 'UPDATE', $changes);
    }

    public function logDelete(string $userId, string $entityType, string $entityId): void
    {
        $this->log($userId, $entityType, $entityId, 'DELETE');
    }

    public function logAccess(string $userId, string $entityType, string $entityId): void
    {
        $this->log($userId, $entityType, $entityId, 'ACCESS');
    }

    public function findByEntity(string $entityType, string $entityId, int $limit = 100): array
    {
        $stmt = $this->connection->prepare(
            'SELECT * FROM audit_logs 
             WHERE entity_type = :entity_type AND entity_id = :entity_id 
             ORDER BY created_at DESC 
             LIMIT :limit'
        );
        $stmt->bindValue(':entity_type', $entityType);
        $stmt->bindValue(':entity_id', $entityId);
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function findByUser(string $userId, int $limit = 100): array
    {
        $stmt = $this->connection->prepare(
            'SELECT * FROM audit_logs 
             WHERE user_id = :user_id 
             ORDER BY created_at DESC 
             LIMIT :limit'
        );
        $stmt->bindValue(':user_id', $userId);
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }
}
