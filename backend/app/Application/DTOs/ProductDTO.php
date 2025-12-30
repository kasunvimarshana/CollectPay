<?php

namespace App\Application\DTOs;

/**
 * Product Data Transfer Object
 *
 * Used to transfer product data between layers.
 * Implements immutability and validation at the application layer.
 */
class ProductDTO
{
    public readonly string $name;

    public readonly string $code;

    public readonly ?string $description;

    public readonly string $baseUnit;

    public readonly array $allowedUnits;

    public readonly string $status;

    public readonly array $metadata;

    public readonly ?int $id;

    public readonly int $version;

    public function __construct(
        string $name,
        string $code,
        string $baseUnit,
        ?string $description = null,
        array $allowedUnits = [],
        string $status = 'active',
        array $metadata = [],
        ?int $id = null,
        int $version = 1
    ) {
        $this->name = $name;
        $this->code = $code;
        $this->description = $description;
        $this->baseUnit = $baseUnit;
        $this->allowedUnits = empty($allowedUnits) ? [$baseUnit] : $allowedUnits;
        $this->status = $status;
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
            name: $data['name'],
            code: $data['code'] ?? '',
            baseUnit: $data['base_unit'] ?? $data['unit'] ?? 'kg',
            description: $data['description'] ?? null,
            allowedUnits: $data['allowed_units'] ?? [],
            status: $data['status'] ?? 'active',
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
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'base_unit' => $this->baseUnit,
            'allowed_units' => $this->allowedUnits,
            'status' => $this->status,
            'metadata' => $this->metadata,
            'version' => $this->version,
        ];
    }
}
