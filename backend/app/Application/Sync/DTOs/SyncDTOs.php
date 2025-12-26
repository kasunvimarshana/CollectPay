<?php

namespace App\Application\Sync\DTOs;

class SyncRequestDTO
{
    public ?string $lastSyncToken = null;
    public ?string $lastSyncAt = null;
    public string $deviceId;
    public array $changes = [];
    public ?string $checksum = null;

    public static function fromRequest(array $data): self
    {
        $dto = new self();
        $dto->lastSyncToken = $data['last_sync_token'] ?? null;
        $dto->lastSyncAt = $data['last_sync_at'] ?? null;
        $dto->deviceId = $data['device_id'] ?? '';
        $dto->changes = $data['changes'] ?? [];
        $dto->checksum = $data['checksum'] ?? null;
        return $dto;
    }
}

class SyncResponseDTO
{
    public bool $success = false;
    public string $syncToken;
    public string $serverTime;
    public array $processed = [];
    public array $serverChanges = [];
    public array $conflicts = [];
    public array $errors = [];

    public function toArray(): array
    {
        return [
            'success' => $this->success,
            'sync_token' => $this->syncToken,
            'server_time' => $this->serverTime,
            'processed' => $this->processed,
            'server_changes' => $this->serverChanges,
            'conflicts' => array_map(fn($c) => $c->toArray(), $this->conflicts),
            'errors' => $this->errors,
        ];
    }
}

class ConflictDTO
{
    public string $entityType;
    public string $entityId;
    public string $action;
    public int $serverVersion;
    public array $serverData;
    public array $clientData;
    public string $resolution;
    public array $resolvedData;

    public function toArray(): array
    {
        return [
            'entity_type' => $this->entityType,
            'entity_id' => $this->entityId,
            'action' => $this->action,
            'server_version' => $this->serverVersion,
            'server_data' => $this->serverData,
            'client_data' => $this->clientData,
            'resolution' => $this->resolution,
            'resolved_data' => $this->resolvedData,
        ];
    }
}
