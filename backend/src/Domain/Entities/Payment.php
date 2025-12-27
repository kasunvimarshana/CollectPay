<?php

declare(strict_types=1);

namespace TrackVault\Domain\Entities;

use TrackVault\Domain\ValueObjects\PaymentId;
use TrackVault\Domain\ValueObjects\SupplierId;
use TrackVault\Domain\ValueObjects\UserId;
use TrackVault\Domain\ValueObjects\Money;
use DateTimeImmutable;

/**
 * Payment Entity
 * 
 * Represents a payment transaction (advance, partial, or full)
 */
final class Payment
{
    public const TYPE_ADVANCE = 'advance';
    public const TYPE_PARTIAL = 'partial';
    public const TYPE_FULL = 'full';

    private PaymentId $id;
    private SupplierId $supplierId;
    private UserId $processedBy;
    private Money $amount;
    private string $type;
    private string $paymentMethod;
    private ?string $reference;
    private DateTimeImmutable $paymentDate;
    private array $metadata;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?DateTimeImmutable $deletedAt;
    private int $version;

    public function __construct(
        PaymentId $id,
        SupplierId $supplierId,
        UserId $processedBy,
        Money $amount,
        string $type,
        string $paymentMethod,
        DateTimeImmutable $paymentDate,
        ?string $reference = null,
        array $metadata = [],
        ?DateTimeImmutable $createdAt = null,
        ?DateTimeImmutable $updatedAt = null,
        ?DateTimeImmutable $deletedAt = null,
        int $version = 1
    ) {
        $this->validateType($type);
        
        $this->id = $id;
        $this->supplierId = $supplierId;
        $this->processedBy = $processedBy;
        $this->amount = $amount;
        $this->type = $type;
        $this->paymentMethod = $paymentMethod;
        $this->reference = $reference;
        $this->paymentDate = $paymentDate;
        $this->metadata = $metadata;
        $this->createdAt = $createdAt ?? new DateTimeImmutable();
        $this->updatedAt = $updatedAt ?? new DateTimeImmutable();
        $this->deletedAt = $deletedAt;
        $this->version = $version;
    }

    private function validateType(string $type): void
    {
        if (!in_array($type, [self::TYPE_ADVANCE, self::TYPE_PARTIAL, self::TYPE_FULL], true)) {
            throw new \InvalidArgumentException("Invalid payment type: {$type}");
        }
    }

    public function getId(): PaymentId
    {
        return $this->id;
    }

    public function getSupplierId(): SupplierId
    {
        return $this->supplierId;
    }

    public function getProcessedBy(): UserId
    {
        return $this->processedBy;
    }

    public function getAmount(): Money
    {
        return $this->amount;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getPaymentMethod(): string
    {
        return $this->paymentMethod;
    }

    public function getReference(): ?string
    {
        return $this->reference;
    }

    public function getPaymentDate(): DateTimeImmutable
    {
        return $this->paymentDate;
    }

    public function getMetadata(): array
    {
        return $this->metadata;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function getDeletedAt(): ?DateTimeImmutable
    {
        return $this->deletedAt;
    }

    public function getVersion(): int
    {
        return $this->version;
    }

    public function isDeleted(): bool
    {
        return $this->deletedAt !== null;
    }

    public function update(
        Money $amount,
        string $type,
        string $paymentMethod,
        DateTimeImmutable $paymentDate,
        ?string $reference,
        array $metadata
    ): self {
        $this->validateType($type);
        
        return new self(
            $this->id,
            $this->supplierId,
            $this->processedBy,
            $amount,
            $type,
            $paymentMethod,
            $paymentDate,
            $reference,
            $metadata,
            $this->createdAt,
            new DateTimeImmutable(),
            $this->deletedAt,
            $this->version + 1
        );
    }

    public function delete(): self
    {
        return new self(
            $this->id,
            $this->supplierId,
            $this->processedBy,
            $this->amount,
            $this->type,
            $this->paymentMethod,
            $this->paymentDate,
            $this->reference,
            $this->metadata,
            $this->createdAt,
            new DateTimeImmutable(),
            new DateTimeImmutable(),
            $this->version + 1
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id->toString(),
            'supplier_id' => $this->supplierId->toString(),
            'processed_by' => $this->processedBy->toString(),
            'amount' => $this->amount->getAmount(),
            'currency' => $this->amount->getCurrency(),
            'type' => $this->type,
            'payment_method' => $this->paymentMethod,
            'reference' => $this->reference,
            'payment_date' => $this->paymentDate->format('Y-m-d H:i:s'),
            'metadata' => $this->metadata,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deletedAt?->format('Y-m-d H:i:s'),
            'version' => $this->version,
        ];
    }
}
