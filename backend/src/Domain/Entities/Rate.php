<?php

namespace Src\Domain\Entities;

class Rate
{
    public function __construct(
        public readonly ?int $id,
        public readonly string $uuid,
        public string $name,
        public ?string $description,
        public float $amount,
        public string $currency,
        public string $rateType,
        public ?int $collectionId,
        public int $version,
        public string $effectiveFrom,
        public ?string $effectiveUntil,
        public bool $isActive,
        public ?array $metadata,
        public int $createdBy,
        public ?int $updatedBy,
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
            'amount' => $this->amount,
            'currency' => $this->currency,
            'rate_type' => $this->rateType,
            'collection_id' => $this->collectionId,
            'version' => $this->version,
            'effective_from' => $this->effectiveFrom,
            'effective_until' => $this->effectiveUntil,
            'is_active' => $this->isActive,
            'metadata' => $this->metadata,
            'created_by' => $this->createdBy,
            'updated_by' => $this->updatedBy,
            'synced_at' => $this->syncedAt,
            'device_id' => $this->deviceId,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
            'deleted_at' => $this->deletedAt,
        ];
    }
}
