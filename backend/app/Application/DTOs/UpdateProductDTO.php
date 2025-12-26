<?php

namespace App\Application\DTOs;

/**
 * Update Product DTO
 * 
 * Data Transfer Object for updating an existing product.
 * Decouples HTTP layer from domain layer.
 */
class UpdateProductDTO
{
    public function __construct(
        public readonly int $id,
        public readonly int $version,
        public readonly ?string $name = null,
        public readonly ?string $code = null,
        public readonly ?string $defaultUnit = null,
        public readonly ?array $supportedUnits = null,
        public readonly ?string $description = null,
        public readonly ?array $metadata = null,
        public readonly ?bool $isActive = null
    ) {
    }

    /**
     * Create DTO from array
     * 
     * @param int $id
     * @param array $data
     * @return self
     */
    public static function fromArray(int $id, array $data): self
    {
        return new self(
            id: $id,
            version: $data['version'],
            name: $data['name'] ?? null,
            code: $data['code'] ?? null,
            defaultUnit: $data['default_unit'] ?? null,
            supportedUnits: $data['supported_units'] ?? null,
            description: $data['description'] ?? null,
            metadata: $data['metadata'] ?? null,
            isActive: $data['is_active'] ?? null
        );
    }
}
