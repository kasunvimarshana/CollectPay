<?php

namespace App\Application\DTOs;

/**
 * Create Product DTO
 * 
 * Data Transfer Object for creating a new product.
 * Decouples HTTP layer from domain layer.
 */
class CreateProductDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $code,
        public readonly string $defaultUnit,
        public readonly array $supportedUnits,
        public readonly ?string $description = null,
        public readonly ?array $metadata = null,
        public readonly bool $isActive = true
    ) {
    }

    /**
     * Create DTO from array
     * 
     * @param array $data
     * @return self
     */
    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            code: $data['code'],
            defaultUnit: $data['default_unit'],
            supportedUnits: $data['supported_units'] ?? [$data['default_unit']],
            description: $data['description'] ?? null,
            metadata: $data['metadata'] ?? null,
            isActive: $data['is_active'] ?? true
        );
    }
}
