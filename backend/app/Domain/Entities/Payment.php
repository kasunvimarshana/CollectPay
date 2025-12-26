<?php

namespace App\Domain\Entities;

/**
 * Payment Domain Entity
 * 
 * Represents a payment transaction in the system.
 * Supports advance, partial, and final payment types.
 * 
 * Following Clean Architecture principles - pure domain entity.
 */
class Payment
{
    private ?int $id;
    private int $supplierId;
    private float $amount;
    private string $paymentType; // advance, partial, final
    private \DateTimeInterface $paymentDate;
    private int $paidBy;
    private ?string $reference;
    private ?string $notes;
    private \DateTimeInterface $createdAt;
    private \DateTimeInterface $updatedAt;
    private ?int $version;

    // Payment types
    public const TYPE_ADVANCE = 'advance';
    public const TYPE_PARTIAL = 'partial';
    public const TYPE_FINAL = 'final';

    public function __construct(
        int $supplierId,
        float $amount,
        string $paymentType,
        \DateTimeInterface $paymentDate,
        int $paidBy,
        ?string $reference = null,
        ?string $notes = null,
        ?int $id = null,
        ?\DateTimeInterface $createdAt = null,
        ?\DateTimeInterface $updatedAt = null,
        ?int $version = null
    ) {
        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->amount = $amount;
        $this->paymentType = $paymentType;
        $this->paymentDate = $paymentDate;
        $this->paidBy = $paidBy;
        $this->reference = $reference;
        $this->notes = $notes;
        $this->createdAt = $createdAt ?? new \DateTime();
        $this->updatedAt = $updatedAt ?? new \DateTime();
        $this->version = $version ?? 0;
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

    public function getPaidBy(): int
    {
        return $this->paidBy;
    }

    public function getReference(): ?string
    {
        return $this->reference;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function getVersion(): ?int
    {
        return $this->version;
    }

    // Business logic methods
    public function isAdvance(): bool
    {
        return $this->paymentType === self::TYPE_ADVANCE;
    }

    public function isPartial(): bool
    {
        return $this->paymentType === self::TYPE_PARTIAL;
    }

    public function isFinal(): bool
    {
        return $this->paymentType === self::TYPE_FINAL;
    }

    public function updateAmount(float $newAmount): void
    {
        if ($newAmount <= 0) {
            throw new \InvalidArgumentException('Amount must be positive');
        }
        
        $this->amount = $newAmount;
        $this->touch();
    }

    public function updateReference(?string $reference): void
    {
        $this->reference = $reference;
        $this->touch();
    }

    public function updateNotes(?string $notes): void
    {
        $this->notes = $notes;
        $this->touch();
    }

    private function touch(): void
    {
        $this->updatedAt = new \DateTime();
        $this->version = ($this->version ?? 0) + 1;
    }

    // Factory method
    public static function create(
        int $supplierId,
        float $amount,
        string $paymentType,
        \DateTimeInterface $paymentDate,
        int $paidBy,
        ?string $reference = null,
        ?string $notes = null
    ): self {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Amount must be positive');
        }

        if (!self::isValidPaymentType($paymentType)) {
            throw new \InvalidArgumentException('Invalid payment type');
        }

        return new self(
            supplierId: $supplierId,
            amount: $amount,
            paymentType: $paymentType,
            paymentDate: $paymentDate,
            paidBy: $paidBy,
            reference: $reference,
            notes: $notes
        );
    }

    // Validation
    public function validate(): array
    {
        $errors = [];

        if ($this->supplierId <= 0) {
            $errors[] = 'Supplier ID is required';
        }

        if ($this->amount <= 0) {
            $errors[] = 'Amount must be positive';
        }

        if (!self::isValidPaymentType($this->paymentType)) {
            $errors[] = 'Invalid payment type';
        }

        if ($this->paidBy <= 0) {
            $errors[] = 'Paid by user ID is required';
        }

        return $errors;
    }

    public function isValid(): bool
    {
        return empty($this->validate());
    }

    // Static helpers
    public static function getValidPaymentTypes(): array
    {
        return [
            self::TYPE_ADVANCE,
            self::TYPE_PARTIAL,
            self::TYPE_FINAL,
        ];
    }

    public static function isValidPaymentType(string $type): bool
    {
        return in_array($type, self::getValidPaymentTypes(), true);
    }
}
