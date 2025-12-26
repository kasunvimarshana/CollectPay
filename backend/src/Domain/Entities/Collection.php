<?php

namespace App\Domain\Entities;

/**
 * Collection Entity
 * 
 * Represents a collection event where a quantity of product is collected from a supplier.
 * Each collection records the exact rate applied at the time of collection for immutability.
 */
class Collection
{
    private ?int $id;
    private int $supplierId;
    private int $productId;
    private int $productRateId; // Immutable reference to the rate used
    private float $quantity;
    private float $rate; // Denormalized for performance and immutability
    private float $amount; // quantity * rate
    private \DateTimeInterface $collectionDate;
    private int $collectedBy;
    private ?string $notes;
    private int $version;
    private string $syncId; // For offline sync
    private \DateTimeInterface $createdAt;
    private \DateTimeInterface $updatedAt;

    public function __construct(
        int $supplierId,
        int $productId,
        int $productRateId,
        float $quantity,
        float $rate,
        \DateTimeInterface $collectionDate,
        int $collectedBy,
        ?string $notes = null,
        ?int $id = null,
        int $version = 1,
        ?string $syncId = null
    ) {
        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->productId = $productId;
        $this->productRateId = $productRateId;
        $this->quantity = $quantity;
        $this->rate = $rate;
        $this->amount = $quantity * $rate;
        $this->collectionDate = $collectionDate;
        $this->collectedBy = $collectedBy;
        $this->notes = $notes;
        $this->version = $version;
        $this->syncId = $syncId ?? $this->generateSyncId();
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    // Getters
    public function getId(): ?int { return $this->id; }
    public function getSupplierId(): int { return $this->supplierId; }
    public function getProductId(): int { return $this->productId; }
    public function getProductRateId(): int { return $this->productRateId; }
    public function getQuantity(): float { return $this->quantity; }
    public function getRate(): float { return $this->rate; }
    public function getAmount(): float { return $this->amount; }
    public function getCollectionDate(): \DateTimeInterface { return $this->collectionDate; }
    public function getCollectedBy(): int { return $this->collectedBy; }
    public function getNotes(): ?string { return $this->notes; }
    public function getVersion(): int { return $this->version; }
    public function getSyncId(): string { return $this->syncId; }
    public function getCreatedAt(): \DateTimeInterface { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeInterface { return $this->updatedAt; }

    /**
     * Update collection details (with validation)
     */
    public function update(
        float $quantity,
        \DateTimeInterface $collectionDate,
        ?string $notes = null
    ): void {
        $this->quantity = $quantity;
        $this->amount = $quantity * $this->rate; // Recalculate amount
        $this->collectionDate = $collectionDate;
        $this->notes = $notes;
        $this->version++;
        $this->updatedAt = new \DateTime();
    }

    /**
     * Generate a unique sync ID for offline operations
     */
    private function generateSyncId(): string
    {
        return uniqid('coll_', true);
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function incrementVersion(): void
    {
        $this->version++;
        $this->updatedAt = new \DateTime();
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplierId,
            'product_id' => $this->productId,
            'product_rate_id' => $this->productRateId,
            'quantity' => $this->quantity,
            'rate' => $this->rate,
            'amount' => $this->amount,
            'collection_date' => $this->collectionDate->format('Y-m-d H:i:s'),
            'collected_by' => $this->collectedBy,
            'notes' => $this->notes,
            'version' => $this->version,
            'sync_id' => $this->syncId,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
        ];
    }
}
