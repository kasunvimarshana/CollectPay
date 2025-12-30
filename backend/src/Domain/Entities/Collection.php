<?php

namespace App\Domain\Entities;

/**
 * Collection Entity
 * 
 * Represents a collection record with multi-unit support and rate snapshot.
 */
class Collection
{
    private ?int $id;
    private int $supplierId;
    private int $productId;
    private float $quantity;
    private string $unit;
    private float $rateApplied;
    private float $totalValue;
    private \DateTimeInterface $collectedAt;
    private int $createdBy;
    private \DateTimeInterface $createdAt;
    private \DateTimeInterface $updatedAt;

    public function __construct(
        ?int $id,
        int $supplierId,
        int $productId,
        float $quantity,
        string $unit,
        float $rateApplied,
        \DateTimeInterface $collectedAt,
        int $createdBy,
        ?\DateTimeInterface $createdAt = null,
        ?\DateTimeInterface $updatedAt = null
    ) {
        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->productId = $productId;
        $this->setQuantity($quantity);
        $this->setUnit($unit);
        $this->setRateApplied($rateApplied);
        $this->totalValue = $this->calculateTotalValue();
        $this->collectedAt = $collectedAt;
        $this->createdBy = $createdBy;
        $this->createdAt = $createdAt ?? new \DateTimeImmutable();
        $this->updatedAt = $updatedAt ?? new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getSupplierId(): int
    {
        return $this->supplierId;
    }

    public function getProductId(): int
    {
        return $this->productId;
    }

    public function getQuantity(): float
    {
        return $this->quantity;
    }

    public function setQuantity(float $quantity): void
    {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be positive');
        }
        $this->quantity = $quantity;
        $this->totalValue = $this->calculateTotalValue();
    }

    public function getUnit(): string
    {
        return $this->unit;
    }

    public function setUnit(string $unit): void
    {
        $validUnits = ['kg', 'g', 'lb', 'oz', 'l', 'ml', 'unit'];
        if (!in_array($unit, $validUnits)) {
            throw new \InvalidArgumentException('Invalid unit');
        }
        $this->unit = $unit;
    }

    public function getRateApplied(): float
    {
        return $this->rateApplied;
    }

    public function setRateApplied(float $rate): void
    {
        if ($rate < 0) {
            throw new \InvalidArgumentException('Rate cannot be negative');
        }
        $this->rateApplied = $rate;
        $this->totalValue = $this->calculateTotalValue();
    }

    public function getTotalValue(): float
    {
        return $this->totalValue;
    }

    private function calculateTotalValue(): float
    {
        return round($this->quantity * $this->rateApplied, 2);
    }

    public function getCollectedAt(): \DateTimeInterface
    {
        return $this->collectedAt;
    }

    public function getCreatedBy(): int
    {
        return $this->createdBy;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function touch(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplierId,
            'product_id' => $this->productId,
            'quantity' => $this->quantity,
            'unit' => $this->unit,
            'rate_applied' => $this->rateApplied,
            'total_value' => $this->totalValue,
            'collected_at' => $this->collectedAt->format('Y-m-d H:i:s'),
            'created_by' => $this->createdBy,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
        ];
    }
}
