<?php

namespace App\Application\DTOs;

/**
 * Payment Data Transfer Object
 *
 * Used to transfer payment data between layers.
 * Implements immutability and validation at the application layer.
 */
class PaymentDTO
{
    public readonly int $supplierId;

    public readonly float $amount;

    public readonly string $paymentType;

    public readonly string $paymentDate;

    public readonly int $recordedBy;

    public readonly ?string $paymentMethod;

    public readonly ?string $referenceNumber;

    public readonly ?string $notes;

    public readonly array $metadata;

    public readonly ?int $id;

    public readonly int $version;

    public function __construct(
        int $supplierId,
        float $amount,
        string $paymentType,
        string $paymentDate,
        int $recordedBy,
        ?string $paymentMethod = null,
        ?string $referenceNumber = null,
        ?string $notes = null,
        array $metadata = [],
        ?int $id = null,
        int $version = 1
    ) {
        $this->supplierId = $supplierId;
        $this->amount = $amount;
        $this->paymentType = $paymentType;
        $this->paymentDate = $paymentDate;
        $this->recordedBy = $recordedBy;
        $this->paymentMethod = $paymentMethod;
        $this->referenceNumber = $referenceNumber;
        $this->notes = $notes;
        $this->metadata = $metadata;
        $this->id = $id;
        $this->version = $version;
    }

    /**
     * Create DTO from array (e.g., from HTTP request)
     */
    public static function fromArray(array $data): self
    {
        return new self(
            supplierId: $data['supplier_id'],
            amount: (float) $data['amount'],
            paymentType: $data['payment_type'],
            paymentDate: $data['payment_date'],
            recordedBy: $data['recorded_by'] ?? $data['paid_by'],
            paymentMethod: $data['payment_method'] ?? null,
            referenceNumber: $data['reference_number'] ?? null,
            notes: $data['notes'] ?? null,
            metadata: $data['metadata'] ?? [],
            id: $data['id'] ?? null,
            version: $data['version'] ?? 1
        );
    }

    /**
     * Convert DTO to array
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplierId,
            'amount' => $this->amount,
            'payment_type' => $this->paymentType,
            'payment_date' => $this->paymentDate,
            'recorded_by' => $this->recordedBy,
            'payment_method' => $this->paymentMethod,
            'reference_number' => $this->referenceNumber,
            'notes' => $this->notes,
            'metadata' => $this->metadata,
            'version' => $this->version,
        ];
    }
}
