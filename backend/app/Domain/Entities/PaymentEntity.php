<?php

namespace App\Domain\Entities;

use App\Domain\ValueObjects\Money;

/**
 * Payment Domain Entity
 * 
 * Represents a payment made to a supplier.
 * Contains business logic for payment validation.
 */
class PaymentEntity
{
    private ?int $id;
    private int $supplierId;
    private int $userId;
    private \DateTimeImmutable $paymentDate;
    private float $amount;
    private string $paymentType; // advance, partial, full
    private ?string $paymentMethod;
    private ?string $referenceNumber;
    private ?string $notes;
    private ?array $metadata;
    private int $version;

    public function __construct(
        int $supplierId,
        int $userId,
        \DateTimeImmutable $paymentDate,
        float $amount,
        string $paymentType,
        ?string $paymentMethod = null,
        ?string $referenceNumber = null,
        ?string $notes = null,
        ?array $metadata = null,
        int $version = 1,
        ?int $id = null
    ) {
        $this->validateAmount($amount);
        $this->validatePaymentType($paymentType);

        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->userId = $userId;
        $this->paymentDate = $paymentDate;
        $this->amount = $amount;
        $this->paymentType = $paymentType;
        $this->paymentMethod = $paymentMethod;
        $this->referenceNumber = $referenceNumber;
        $this->notes = $notes;
        $this->metadata = $metadata;
        $this->version = $version;
    }

    // Getters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getSupplierId(): int
    {
        return $this->supplierId;
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getPaymentDate(): \DateTimeImmutable
    {
        return $this->paymentDate;
    }

    public function getAmount(): float
    {
        return $this->amount;
    }

    public function getPaymentType(): string
    {
        return $this->paymentType;
    }

    public function getPaymentMethod(): ?string
    {
        return $this->paymentMethod;
    }

    public function getReferenceNumber(): ?string
    {
        return $this->referenceNumber;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function getMetadata(): ?array
    {
        return $this->metadata;
    }

    public function getVersion(): int
    {
        return $this->version;
    }

    // Business methods
    public function updateAmount(float $amount): void
    {
        $this->validateAmount($amount);
        $this->amount = $amount;
    }

    public function updatePaymentType(string $paymentType): void
    {
        $this->validatePaymentType($paymentType);
        $this->paymentType = $paymentType;
    }

    public function updatePaymentMethod(?string $paymentMethod): void
    {
        $this->paymentMethod = $paymentMethod;
    }

    public function updateReferenceNumber(?string $referenceNumber): void
    {
        $this->referenceNumber = $referenceNumber;
    }

    public function updateNotes(?string $notes): void
    {
        $this->notes = $notes;
    }

    public function incrementVersion(): void
    {
        $this->version++;
    }

    public function isAdvancePayment(): bool
    {
        return $this->paymentType === 'advance';
    }

    public function isPartialPayment(): bool
    {
        return $this->paymentType === 'partial';
    }

    public function isFullPayment(): bool
    {
        return $this->paymentType === 'full';
    }

    public function getAmountAsMoney(string $currency = 'USD'): Money
    {
        return new Money($this->amount, $currency);
    }

    // Validation methods
    private function validateAmount(float $amount): void
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Payment amount must be greater than zero');
        }

        if ($amount < 0.01) {
            throw new \InvalidArgumentException('Payment amount must be at least 0.01');
        }
    }

    private function validatePaymentType(string $paymentType): void
    {
        $validTypes = ['advance', 'partial', 'full'];
        
        if (!in_array($paymentType, $validTypes)) {
            throw new \InvalidArgumentException(
                "Invalid payment type. Must be one of: " . implode(', ', $validTypes)
            );
        }
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplierId,
            'user_id' => $this->userId,
            'payment_date' => $this->paymentDate->format('Y-m-d'),
            'amount' => $this->amount,
            'payment_type' => $this->paymentType,
            'payment_method' => $this->paymentMethod,
            'reference_number' => $this->referenceNumber,
            'notes' => $this->notes,
            'metadata' => $this->metadata,
            'version' => $this->version,
        ];
    }
}
