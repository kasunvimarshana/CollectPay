<?php

namespace App\Domain\Entities;

/**
 * Payment Entity
 * 
 * Represents a payment made to a supplier (advance, partial, or final payment).
 * Tracks payment history for accurate balance calculations.
 */
class Payment
{
    private ?int $id;
    private int $supplierId;
    private float $amount;
    private string $type; // advance, partial, final
    private \DateTimeInterface $paymentDate;
    private int $paidBy;
    private ?string $notes;
    private ?string $reference; // Payment reference number
    private int $version;
    private string $syncId;
    private \DateTimeInterface $createdAt;
    private \DateTimeInterface $updatedAt;

    public const TYPE_ADVANCE = 'advance';
    public const TYPE_PARTIAL = 'partial';
    public const TYPE_FINAL = 'final';

    public function __construct(
        int $supplierId,
        float $amount,
        string $type,
        \DateTimeInterface $paymentDate,
        int $paidBy,
        ?string $notes = null,
        ?string $reference = null,
        ?int $id = null,
        int $version = 1,
        ?string $syncId = null
    ) {
        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->amount = $amount;
        $this->type = $type;
        $this->paymentDate = $paymentDate;
        $this->paidBy = $paidBy;
        $this->notes = $notes;
        $this->reference = $reference ?? $this->generateReference();
        $this->version = $version;
        $this->syncId = $syncId ?? $this->generateSyncId();
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    // Getters
    public function getId(): ?int { return $this->id; }
    public function getSupplierId(): int { return $this->supplierId; }
    public function getAmount(): float { return $this->amount; }
    public function getType(): string { return $this->type; }
    public function getPaymentDate(): \DateTimeInterface { return $this->paymentDate; }
    public function getPaidBy(): int { return $this->paidBy; }
    public function getNotes(): ?string { return $this->notes; }
    public function getReference(): ?string { return $this->reference; }
    public function getVersion(): int { return $this->version; }
    public function getSyncId(): string { return $this->syncId; }
    public function getCreatedAt(): \DateTimeInterface { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeInterface { return $this->updatedAt; }

    /**
     * Check if this is an advance payment
     */
    public function isAdvance(): bool
    {
        return $this->type === self::TYPE_ADVANCE;
    }

    /**
     * Check if this is a partial payment
     */
    public function isPartial(): bool
    {
        return $this->type === self::TYPE_PARTIAL;
    }

    /**
     * Check if this is a final payment
     */
    public function isFinal(): bool
    {
        return $this->type === self::TYPE_FINAL;
    }

    /**
     * Update payment details
     */
    public function update(
        float $amount,
        \DateTimeInterface $paymentDate,
        ?string $notes = null
    ): void {
        $this->amount = $amount;
        $this->paymentDate = $paymentDate;
        $this->notes = $notes;
        $this->version++;
        $this->updatedAt = new \DateTime();
    }

    /**
     * Generate a unique payment reference
     */
    private function generateReference(): string
    {
        return 'PAY-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
    }

    /**
     * Generate a unique sync ID for offline operations
     */
    private function generateSyncId(): string
    {
        return uniqid('pay_', true);
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
            'amount' => $this->amount,
            'type' => $this->type,
            'payment_date' => $this->paymentDate->format('Y-m-d H:i:s'),
            'paid_by' => $this->paidBy,
            'notes' => $this->notes,
            'reference' => $this->reference,
            'version' => $this->version,
            'sync_id' => $this->syncId,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
        ];
    }
}
