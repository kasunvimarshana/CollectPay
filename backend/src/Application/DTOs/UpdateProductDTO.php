<?php

declare(strict_types=1);

namespace Application\DTOs;

/**
 * Data Transfer Object for Product Update
 */
final class UpdateProductDTO
{
    public function __construct(
        public readonly ?string $name = null,
        public readonly ?string $defaultUnit = null,
        public readonly ?string $description = null,
        public readonly ?array $metadata = null,
        public readonly ?bool $isActive = null
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'] ?? null,
            defaultUnit: $data['default_unit'] ?? null,
            description: $data['description'] ?? null,
            metadata: $data['metadata'] ?? null,
            isActive: isset($data['is_active']) ? (bool)$data['is_active'] : null
        );
    }

    public function toArray(): array
    {
        $data = [];
        
        if ($this->name !== null) {
            $data['name'] = $this->name;
        }
        if ($this->defaultUnit !== null) {
            $data['default_unit'] = $this->defaultUnit;
        }
        if ($this->description !== null) {
            $data['description'] = $this->description;
        }
        if ($this->metadata !== null) {
            $data['metadata'] = $this->metadata;
        }
        if ($this->isActive !== null) {
            $data['is_active'] = $this->isActive;
        }

        return $data;
    }
}
