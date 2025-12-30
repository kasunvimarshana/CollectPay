<?php

namespace App\Domain\Entities;

/**
 * Payment Domain Entity
 *
 * Represents a payment made to or by a supplier.
 * This is a pure domain object with business logic and no framework dependencies.
 */
class PaymentEntity
{
    private ?int $id;

    private int $supplierId;

    private float $amount;

    private string $paymentType;

    private \DateTimeInterface $paymentDate;

    private ?string $paymentMethod;

    private ?string $referenceNumber;

    private ?string $notes;

    private int $recordedBy;

    private array $metadata;

    private int $version;

    private ?\DateTimeInterface $createdAt;

    private ?\DateTimeInterface $updatedAt;

    public function __construct(
        int $supplierId,
        float $amount,
        string $paymentType,
        \DateTimeInterface $paymentDate,
        int $recordedBy,
        ?string $paymentMethod = null,
        ?string $referenceNumber = null,
        ?string $notes = null,
        array $metadata = [],
        int $version = 1,
        ?int $id = null,
        ?\DateTimeInterface $createdAt = null,
        ?\DateTimeInterface $updatedAt = null
    ) {
        $this->validateAmount($amount);
        $this->validatePaymentType($paymentType);

        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->amount = $amount;
        $this->paymentType = $paymentType;
        $this->paymentDate = $paymentDate;
        $this->paymentMethod = $paymentMethod;
        $this->referenceNumber = $referenceNumber;
        $this->notes = $notes;
        $this->recordedBy = $recordedBy;
        $this->metadata = $metadata;
        $this->version = $version;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
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

    public function getAmount(): float
    {
        return $this->amount;
    }

    public function getPaymentType(): string
    {
        return $this->paymentType;
    }

    public function getPaymentDate(): \DateTimeInterface
    {
        return $this->paymentDate;
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

    public function getRecordedBy(): int
    {
        return $this->recordedBy;
    }

    public function getMetadata(): array
    {
        return $this->metadata;
    }

    public function getVersion(): int
    {
        return $this->version;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    // Business methods
    public function isAdvancePayment(): bool
    {
        return $this->paymentType === 'advance';
    }

    public function isPartialPayment(): bool
    {
        return $this->paymentType === 'partial';
    }

    public function isFinalPayment(): bool
    {
        return $this->paymentType === 'final';
    }

    public function isAdjustment(): bool
    {
        return $this->paymentType === 'adjustment';
    }

    public function updateAmount(float $amount): void
    {
        $this->validateAmount($amount);
        $this->amount = $amount;
        $this->incrementVersion();
    }

    public function updatePaymentType(string $paymentType): void
    {
        $this->validatePaymentType($paymentType);
        $this->paymentType = $paymentType;
        $this->incrementVersion();
    }

    public function updateDetails(
        ?float $amount = null,
        ?string $paymentType = null,
        ?string $paymentMethod = null,
        ?string $referenceNumber = null,
        ?string $notes = null
    ): void {
        $changed = false;

        if ($amount !== null) {
            $this->validateAmount($amount);
            $this->amount = $amount;
            $changed = true;
        }

        if ($paymentType !== null) {
            $this->validatePaymentType($paymentType);
            $this->paymentType = $paymentType;
            $changed = true;
        }

        if ($paymentMethod !== null) {
            $this->paymentMethod = $paymentMethod;
            $changed = true;
        }

        if ($referenceNumber !== null) {
            $this->referenceNumber = $referenceNumber;
            $changed = true;
        }

        if ($notes !== null) {
            $this->notes = $notes;
            $changed = true;
        }

        if ($changed) {
            $this->incrementVersion();
        }
    }

    public function updateMetadata(array $metadata): void
    {
        $this->metadata = array_merge($this->metadata, $metadata);
        $this->incrementVersion();
    }

    public function incrementVersion(): void
    {
        $this->version++;
    }

    // Validation methods (business rules)
    private function validateAmount(float $amount): void
    {
        if ($amount < 0) {
            throw new \InvalidArgumentException('Payment amount cannot be negative');
        }
    }

    private function validatePaymentType(string $paymentType): void
    {
        $validTypes = ['advance', 'partial', 'final', 'adjustment'];
        if (! in_array($paymentType, $validTypes)) {
            throw new \InvalidArgumentException('Invalid payment type. Must be one of: '.implode(', ', $validTypes));
        }
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplierId,
            'amount' => $this->amount,
            'payment_type' => $this->paymentType,
            'payment_date' => $this->paymentDate->format('Y-m-d'),
            'payment_method' => $this->paymentMethod,
            'reference_number' => $this->referenceNumber,
            'notes' => $this->notes,
            'recorded_by' => $this->recordedBy,
            'metadata' => $this->metadata,
            'version' => $this->version,
            'created_at' => $this->createdAt?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt?->format('Y-m-d H:i:s'),
        ];
    }
}
