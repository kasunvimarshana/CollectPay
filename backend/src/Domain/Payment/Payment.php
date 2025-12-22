<?php

namespace Domain\Payment;

use Domain\Shared\ValueObjects\Money;
use Domain\Shared\ValueObjects\Uuid;
use DateTimeImmutable;

/**
 * Payment Entity - Manages payment records
 */
final class Payment
{
    private Uuid $id;
    private Uuid $supplierId;
    private Uuid $paidBy;
    private Money $amount;
    private PaymentType $type;
    private PaymentMethod $method;
    private PaymentStatus $status;
    private ?string $referenceNumber;
    private ?string $notes;
    private DateTimeImmutable $paymentDate;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?string $syncId;

    private function __construct(
        Uuid $id,
        Uuid $supplierId,
        Uuid $paidBy,
        Money $amount,
        PaymentType $type,
        PaymentMethod $method,
        DateTimeImmutable $paymentDate,
        ?string $referenceNumber = null,
        ?string $notes = null,
        ?string $syncId = null
    ) {
        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->paidBy = $paidBy;
        $this->amount = $amount;
        $this->type = $type;
        $this->method = $method;
        $this->status = PaymentStatus::pending();
        $this->referenceNumber = $referenceNumber;
        $this->notes = $notes;
        $this->paymentDate = $paymentDate;
        $this->createdAt = new DateTimeImmutable();
        $this->updatedAt = new DateTimeImmutable();
        $this->syncId = $syncId;
    }

    public static function create(
        Uuid $supplierId,
        Uuid $paidBy,
        Money $amount,
        PaymentType $type,
        PaymentMethod $method,
        DateTimeImmutable $paymentDate,
        ?string $referenceNumber = null,
        ?string $notes = null,
        ?string $syncId = null
    ): self {
        return new self(
            Uuid::generate(),
            $supplierId,
            $paidBy,
            $amount,
            $type,
            $method,
            $paymentDate,
            $referenceNumber,
            $notes,
            $syncId
        );
    }

    public static function reconstitute(
        Uuid $id,
        Uuid $supplierId,
        Uuid $paidBy,
        Money $amount,
        PaymentType $type,
        PaymentMethod $method,
        PaymentStatus $status,
        ?string $referenceNumber,
        ?string $notes,
        DateTimeImmutable $paymentDate,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt,
        ?string $syncId
    ): self {
        $payment = new self(
            $id,
            $supplierId,
            $paidBy,
            $amount,
            $type,
            $method,
            $paymentDate,
            $referenceNumber,
            $notes,
            $syncId
        );
        $payment->status = $status;
        $payment->createdAt = $createdAt;
        $payment->updatedAt = $updatedAt;
        return $payment;
    }

    public function confirm(): void
    {
        $this->status = PaymentStatus::confirmed();
        $this->updatedAt = new DateTimeImmutable();
    }

    public function cancel(string $reason): void
    {
        $this->status = PaymentStatus::cancelled();
        $this->notes = ($this->notes ? $this->notes . ' | ' : '') . "Cancelled: {$reason}";
        $this->updatedAt = new DateTimeImmutable();
    }

    public function updateDetails(
        Money $amount,
        PaymentMethod $method,
        ?string $referenceNumber,
        ?string $notes
    ): void {
        $this->amount = $amount;
        $this->method = $method;
        $this->referenceNumber = $referenceNumber;
        $this->notes = $notes;
        $this->updatedAt = new DateTimeImmutable();
    }

    // Getters
    public function id(): Uuid
    {
        return $this->id;
    }

    public function supplierId(): Uuid
    {
        return $this->supplierId;
    }

    public function paidBy(): Uuid
    {
        return $this->paidBy;
    }

    public function amount(): Money
    {
        return $this->amount;
    }

    public function type(): PaymentType
    {
        return $this->type;
    }

    public function method(): PaymentMethod
    {
        return $this->method;
    }

    public function status(): PaymentStatus
    {
        return $this->status;
    }

    public function referenceNumber(): ?string
    {
        return $this->referenceNumber;
    }

    public function notes(): ?string
    {
        return $this->notes;
    }

    public function paymentDate(): DateTimeImmutable
    {
        return $this->paymentDate;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function updatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function syncId(): ?string
    {
        return $this->syncId;
    }
}
