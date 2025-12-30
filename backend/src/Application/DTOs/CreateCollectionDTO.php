<?php

declare(strict_types=1);

namespace Application\DTOs;

/**
 * Create Collection DTO
 */
final class CreateCollectionDTO
{
    public function __construct(
        public readonly string $supplierId,
        public readonly string $productId,
        public readonly string $rateId,
        public readonly float $quantityValue,
        public readonly string $quantityUnit,
        public readonly float $totalAmount,
        public readonly string $totalAmountCurrency,
        public readonly string $collectionDate,
        public readonly string $collectedBy,
        public readonly ?string $notes = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            $data['supplier_id'],
            $data['product_id'],
            $data['rate_id'],
            (float) $data['quantity_value'],
            $data['quantity_unit'],
            (float) $data['total_amount'],
            $data['total_amount_currency'] ?? 'USD',
            $data['collection_date'],
            $data['collected_by'],
            $data['notes'] ?? null
        );
    }
}
