<?php

namespace Src\Domain\Entities;

class Collection
{
    public function __construct(
        public readonly ?int $id,
        public readonly string $uuid,
        public string $name,
        public ?string $description,
        public int $createdBy,
        public ?int $updatedBy,
        public string $status,
        public ?array $metadata,
        public int $version,
        public ?string $syncedAt,
        public ?string $deviceId,
        public readonly ?string $createdAt,
        public readonly ?string $updatedAt,
        public readonly ?string $deletedAt
    ) {}

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'description' => $this->description,
            'created_by' => $this->createdBy,
            'updated_by' => $this->updatedBy,
            'status' => $this->status,
            'metadata' => $this->metadata,
            'version' => $this->version,
            'synced_at' => $this->syncedAt,
            'device_id' => $this->deviceId,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
            'deleted_at' => $this->deletedAt,
        ];
    }
}
