<?php

declare(strict_types=1);

namespace Application\DTOs;

final class CreateCollectionDTO
{
    public function __construct(
        public readonly string $supplierId,
        public readonly string $productId,
        public readonly float $quantityAmount,
        public readonly string $quantityUnit,
        public readonly string $collectionDate,
        public readonly ?string $notes = null
    ) {}
}
