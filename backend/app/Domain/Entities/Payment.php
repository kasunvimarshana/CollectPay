<?php

namespace App\Domain\Entities;

use App\Domain\ValueObjects\Money;
use DateTime;

/**
 * Payment Entity
 * 
 * Represents a payment to a supplier.
 * Supports advance, partial, and full payments with audit trail.
 */
class Payment
{
    private ?int $id;
    private int $supplierId;
    private Money $amount;
    private string $paymentType; // 'advance', 'partial', 'full'
    private DateTime $paymentDate;
    private ?string $referenceNumber;
    private ?string $paymentMethod; // 'cash', 'bank_transfer', 'cheque', etc.
    private ?string $notes;
    private int $version;
    private DateTime $createdAt;
    private DateTime $updatedAt;
    private ?int $createdBy;

    public function __construct(
        int $supplierId,
        Money $amount,
        string $paymentType,
        DateTime $paymentDate,
        ?string $referenceNumber = null,
        ?string $paymentMethod = null,
        ?string $notes = null,
        int $version = 1,
        ?int $id = null,
        ?DateTime $createdAt = null,
        ?DateTime $updatedAt = null,
        ?int $createdBy = null
    ) {
        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->amount = $amount;
        $this->paymentType = $paymentType;
        $this->paymentDate = $paymentDate;
        $this->referenceNumber = $referenceNumber;
        $this->paymentMethod = $paymentMethod;
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
        
        $validTypes = ['advance', 'partial', 'full'];
        if (!in_array($this->paymentType, $validTypes)) {
            throw new \InvalidArgumentException('Invalid payment type. Must be one of: ' . implode(', ', $validTypes));
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

    public function getAmount(): Money
    {
        return $this->amount;
    }

    public function getPaymentType(): string
    {
        return $this->paymentType;
    }

    public function getPaymentDate(): DateTime
    {
        return $this->paymentDate;
    }

    public function getReferenceNumber(): ?string
    {
        return $this->referenceNumber;
    }

    public function getPaymentMethod(): ?string
    {
        return $this->paymentMethod;
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
     * Update payment details
     */
    public function updateDetails(
        ?string $referenceNumber = null,
        ?string $paymentMethod = null,
        ?string $notes = null
    ): void {
        if ($referenceNumber !== null) {
            $this->referenceNumber = $referenceNumber;
        }
        
        if ($paymentMethod !== null) {
            $this->paymentMethod = $paymentMethod;
        }
        
        if ($notes !== null) {
            $this->notes = $notes;
        }
        
        $this->version++;
        $this->updatedAt = new DateTime();
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplierId,
            'amount' => $this->amount->getAmount(),
            'currency' => $this->amount->getCurrency(),
            'payment_type' => $this->paymentType,
            'payment_date' => $this->paymentDate->format('Y-m-d H:i:s'),
            'reference_number' => $this->referenceNumber,
            'payment_method' => $this->paymentMethod,
            'notes' => $this->notes,
            'version' => $this->version,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'created_by' => $this->createdBy,
        ];
    }
}
