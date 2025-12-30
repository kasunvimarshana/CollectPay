<?php

namespace App\Domain\Entities;

/**
 * Payment Entity
 * 
 * Represents a payment transaction (advance, partial, or final).
 */
class Payment
{
    private ?int $id;
    private int $supplierId;
    private float $amount;
    private string $paymentType;
    private ?string $notes;
    private \DateTimeInterface $paidAt;
    private int $createdBy;
    private \DateTimeInterface $createdAt;
    private \DateTimeInterface $updatedAt;

    public function __construct(
        ?int $id,
        int $supplierId,
        float $amount,
        string $paymentType,
        ?string $notes,
        \DateTimeInterface $paidAt,
        int $createdBy,
        ?\DateTimeInterface $createdAt = null,
        ?\DateTimeInterface $updatedAt = null
    ) {
        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->setAmount($amount);
        $this->setPaymentType($paymentType);
        $this->notes = $notes;
        $this->paidAt = $paidAt;
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

    public function getAmount(): float
    {
        return $this->amount;
    }

    public function setAmount(float $amount): void
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Amount must be positive');
        }
        $this->amount = round($amount, 2);
    }

    public function getPaymentType(): string
    {
        return $this->paymentType;
    }

    public function setPaymentType(string $type): void
    {
        $validTypes = ['advance', 'partial', 'final'];
        if (!in_array($type, $validTypes)) {
            throw new \InvalidArgumentException('Invalid payment type');
        }
        $this->paymentType = $type;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): void
    {
        $this->notes = $notes;
    }

    public function getPaidAt(): \DateTimeInterface
    {
        return $this->paidAt;
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

    public function isAdvance(): bool
    {
        return $this->paymentType === 'advance';
    }

    public function isPartial(): bool
    {
        return $this->paymentType === 'partial';
    }

    public function isFinal(): bool
    {
        return $this->paymentType === 'final';
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplierId,
            'amount' => $this->amount,
            'payment_type' => $this->paymentType,
            'notes' => $this->notes,
            'paid_at' => $this->paidAt->format('Y-m-d H:i:s'),
            'created_by' => $this->createdBy,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
        ];
    }
}
