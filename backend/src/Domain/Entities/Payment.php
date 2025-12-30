<?php

declare(strict_types=1);

namespace Domain\Entities;

use Domain\ValueObjects\UUID;
use Domain\ValueObjects\Money;
use DateTimeImmutable;
use InvalidArgumentException;

/**
 * Payment Domain Entity
 * 
 * Represents a payment made to/from a supplier
 * Supports advance, partial, and final payments
 * Immutable for audit trail
 */
final class Payment
{
    public const TYPE_ADVANCE = 'advance';
    public const TYPE_PARTIAL = 'partial';
    public const TYPE_FINAL = 'final';

    private UUID $id;
    private UUID $supplierId;
    private Money $amount;
    private string $type;
    private DateTimeImmutable $paymentDate;
    private ?string $reference;
    private ?string $notes;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private int $version;

    private function __construct(
        UUID $id,
        UUID $supplierId,
        Money $amount,
        string $type,
        DateTimeImmutable $paymentDate,
        ?string $reference,
        ?string $notes,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt,
        int $version
    ) {
        $this->validateType($type);
        
        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->amount = $amount;
        $this->type = $type;
        $this->paymentDate = $paymentDate;
        $this->reference = $reference ? trim($reference) : null;
        $this->notes = $notes ? trim($notes) : null;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
        $this->version = $version;
    }

    public static function create(
        UUID $supplierId,
        Money $amount,
        string $type,
        DateTimeImmutable $paymentDate,
        ?string $reference = null,
        ?string $notes = null
    ): self {
        return new self(
            UUID::generate(),
            $supplierId,
            $amount,
            $type,
            $paymentDate,
            $reference,
            $notes,
            new DateTimeImmutable(),
            new DateTimeImmutable(),
            1
        );
    }

    public static function reconstitute(
        string $id,
        string $supplierId,
        float $amountValue,
        string $currency,
        string $type,
        DateTimeImmutable $paymentDate,
        ?string $reference,
        ?string $notes,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt,
        int $version
    ): self {
        return new self(
            UUID::fromString($id),
            UUID::fromString($supplierId),
            new Money($amountValue, $currency),
            $type,
            $paymentDate,
            $reference,
            $notes,
            $createdAt,
            $updatedAt,
            $version
        );
    }

    public function updateNotes(string $notes): self
    {
        return new self(
            $this->id,
            $this->supplierId,
            $this->amount,
            $this->type,
            $this->paymentDate,
            $this->reference,
            $notes,
            $this->createdAt,
            new DateTimeImmutable(),
            $this->version + 1
        );
    }

    private function validateType(string $type): void
    {
        $validTypes = [self::TYPE_ADVANCE, self::TYPE_PARTIAL, self::TYPE_FINAL];
        
        if (!in_array($type, $validTypes, true)) {
            throw new InvalidArgumentException(
                'Invalid payment type. Must be one of: ' . implode(', ', $validTypes)
            );
        }
    }

    // Getters
    public function id(): UUID
    {
        return $this->id;
    }

    public function supplierId(): UUID
    {
        return $this->supplierId;
    }

    public function amount(): Money
    {
        return $this->amount;
    }

    public function type(): string
    {
        return $this->type;
    }

    public function paymentDate(): DateTimeImmutable
    {
        return $this->paymentDate;
    }

    public function reference(): ?string
    {
        return $this->reference;
    }

    public function notes(): ?string
    {
        return $this->notes;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function updatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function version(): int
    {
        return $this->version;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->value(),
            'supplier_id' => $this->supplierId->value(),
            'amount' => $this->amount->amount(),
            'currency' => $this->amount->currency(),
            'type' => $this->type,
            'payment_date' => $this->paymentDate->format('Y-m-d H:i:s'),
            'reference' => $this->reference,
            'notes' => $this->notes,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'version' => $this->version,
        ];
    }
}
