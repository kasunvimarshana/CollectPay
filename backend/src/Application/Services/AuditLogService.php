<?php

namespace LedgerFlow\Application\Services;

use PDO;

class AuditLogService
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function log(string $action, string $entity, string $entityId, ?string $userId = null, ?array $data = null): void
    {
        try {
            $stmt = $this->db->prepare('
                INSERT INTO audit_logs (id, user_id, action, entity, entity_id, data, created_at)
                VALUES (:id, :user_id, :action, :entity, :entity_id, :data, :created_at)
            ');

            $stmt->execute([
                'id' => uniqid('audit_', true),
                'user_id' => $userId,
                'action' => $action,
                'entity' => $entity,
                'entity_id' => $entityId,
                'data' => $data ? json_encode($data) : null,
                'created_at' => date('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            // Log error but don't fail the main operation
            error_log('Audit log error: ' . $e->getMessage());
        }
    }

    public function getLogsByEntity(string $entity, string $entityId): array
    {
        $stmt = $this->db->prepare('
            SELECT * FROM audit_logs 
            WHERE entity = :entity AND entity_id = :entity_id 
            ORDER BY created_at DESC
        ');
        $stmt->execute([
            'entity' => $entity,
            'entity_id' => $entityId
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getLogsByUser(string $userId): array
    {
        $stmt = $this->db->prepare('
            SELECT * FROM audit_logs 
            WHERE user_id = :user_id 
            ORDER BY created_at DESC
        ');
        $stmt->execute(['user_id' => $userId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAllLogs(int $limit = 100, int $offset = 0): array
    {
        $stmt = $this->db->prepare('
            SELECT * FROM audit_logs 
            ORDER BY created_at DESC 
            LIMIT :limit OFFSET :offset
        ');
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
