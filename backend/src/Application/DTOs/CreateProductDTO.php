<?php

declare(strict_types=1);

namespace Application\DTOs;

/**
 * Data Transfer Object for Product Creation
 */
final class CreateProductDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $defaultUnit,
        public readonly ?string $description = null,
        public readonly array $metadata = []
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'] ?? '',
            defaultUnit: $data['default_unit'] ?? '',
            description: $data['description'] ?? null,
            metadata: $data['metadata'] ?? []
        );
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'default_unit' => $this->defaultUnit,
            'description' => $this->description,
            'metadata' => $this->metadata,
        ];
    }
}
