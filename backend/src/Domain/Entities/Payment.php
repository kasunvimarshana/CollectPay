<?php

namespace Src\Domain\Entities;

class Payment
{
    public function __construct(
        public readonly ?int $id,
        public readonly string $uuid,
        public string $paymentReference,
        public int $collectionId,
        public ?int $rateId,
        public int $payerId,
        public float $amount,
        public string $currency,
        public string $status,
        public string $paymentMethod,
        public ?string $notes,
        public string $paymentDate,
        public ?string $processedAt,
        public bool $isAutomated,
        public ?array $metadata,
        public int $version,
        public int $createdBy,
        public ?int $updatedBy,
        public ?string $syncedAt,
        public ?string $deviceId,
        public string $idempotencyKey,
        public readonly ?string $createdAt,
        public readonly ?string $updatedAt,
        public readonly ?string $deletedAt
    ) {}

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'payment_reference' => $this->paymentReference,
            'collection_id' => $this->collectionId,
            'rate_id' => $this->rateId,
            'payer_id' => $this->payerId,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'status' => $this->status,
            'payment_method' => $this->paymentMethod,
            'notes' => $this->notes,
            'payment_date' => $this->paymentDate,
            'processed_at' => $this->processedAt,
            'is_automated' => $this->isAutomated,
            'metadata' => $this->metadata,
            'version' => $this->version,
            'created_by' => $this->createdBy,
            'updated_by' => $this->updatedBy,
            'synced_at' => $this->syncedAt,
            'device_id' => $this->deviceId,
            'idempotency_key' => $this->idempotencyKey,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
            'deleted_at' => $this->deletedAt,
        ];
    }
}
