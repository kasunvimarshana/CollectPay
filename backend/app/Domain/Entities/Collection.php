<?php

namespace App\Domain\Entities;

use App\Domain\ValueObjects\Quantity;
use App\Domain\ValueObjects\Money;
use DateTime;

/**
 * Collection Entity
 * 
 * Represents a product collection from a supplier with multi-unit quantity tracking.
 */
class Collection
{
    private ?int $id;
    private int $supplierId;
    private int $productId;
    private Quantity $quantity;
    private DateTime $collectionDate;
    private ?int $rateId;
    private ?Money $totalAmount;
    private ?string $notes;
    private int $version;
    private DateTime $createdAt;
    private DateTime $updatedAt;
    private ?int $createdBy;

    public function __construct(
        int $supplierId,
        int $productId,
        Quantity $quantity,
        DateTime $collectionDate,
        ?int $rateId = null,
        ?Money $totalAmount = null,
        ?string $notes = null,
        int $version = 1,
        ?int $id = null,
        ?DateTime $createdAt = null,
        ?DateTime $updatedAt = null,
        ?int $createdBy = null
    ) {
        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->productId = $productId;
        $this->quantity = $quantity;
        $this->collectionDate = $collectionDate;
        $this->rateId = $rateId;
        $this->totalAmount = $totalAmount;
        $this->notes = $notes;
        $this->version = $version;
        $this->createdAt = $createdAt ?? new DateTime();
        $this->updatedAt = $updatedAt ?? new DateTime();
        $this->createdBy = $createdBy;
        
        $this->validate();
    }

    private function validate(): void
    {
        if ($this->supplierId <= 0) {
            throw new \InvalidArgumentException('Supplier ID must be positive');
        }
        
        if ($this->productId <= 0) {
            throw new \InvalidArgumentException('Product ID must be positive');
        }
        
        if ($this->version < 1) {
            throw new \InvalidArgumentException('Version must be at least 1');
        }
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

    public function getQuantity(): Quantity
    {
        return $this->quantity;
    }

    public function getCollectionDate(): DateTime
    {
        return $this->collectionDate;
    }

    public function getRateId(): ?int
    {
        return $this->rateId;
    }

    public function getTotalAmount(): ?Money
    {
        return $this->totalAmount;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function getVersion(): int
    {
        return $this->version;
    }

    public function getCreatedAt(): DateTime
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): DateTime
    {
        return $this->updatedAt;
    }

    public function getCreatedBy(): ?int
    {
        return $this->createdBy;
    }

    /**
     * Calculate total amount based on rate
     */
    public function calculateTotalAmount(ProductRate $rate): void
    {
        // Convert quantity to base unit for consistent calculation
        $quantityInBaseUnit = $this->quantity->toBaseUnit();
        $this->totalAmount = $rate->getRate()->multiply($quantityInBaseUnit);
        $this->rateId = $rate->getId();
        $this->updatedAt = new DateTime();
    }

    /**
     * Update quantity
     */
    public function updateQuantity(Quantity $quantity): void
    {
        $this->quantity = $quantity;
        $this->version++;
        $this->updatedAt = new DateTime();
        
        // Reset total amount if it was calculated - needs recalculation
        if ($this->totalAmount !== null) {
            $this->totalAmount = null;
        }
    }

    /**
     * Update notes
     */
    public function updateNotes(?string $notes): void
    {
        $this->notes = $notes;
        $this->updatedAt = new DateTime();
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplierId,
            'product_id' => $this->productId,
            'quantity_value' => $this->quantity->getValue(),
            'quantity_unit' => $this->quantity->getUnit(),
            'collection_date' => $this->collectionDate->format('Y-m-d H:i:s'),
            'rate_id' => $this->rateId,
            'total_amount' => $this->totalAmount ? $this->totalAmount->getAmount() : null,
            'total_currency' => $this->totalAmount ? $this->totalAmount->getCurrency() : null,
            'notes' => $this->notes,
            'version' => $this->version,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'created_by' => $this->createdBy,
        ];
    }
}
