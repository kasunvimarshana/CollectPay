<?php

namespace App\Application\UseCases\Product;

use App\Application\DTOs\ProductDTO;
use App\Domain\Entities\ProductEntity;
use App\Domain\Repositories\ProductRepositoryInterface;

/**
 * Create Product Use Case
 *
 * Encapsulates the business logic for creating a new product.
 * This follows Single Responsibility Principle (SOLID).
 */
class CreateProductUseCase
{
    private ProductRepositoryInterface $repository;

    public function __construct(ProductRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Execute the use case
     *
     * @throws \InvalidArgumentException
     * @throws \RuntimeException
     */
    public function execute(ProductDTO $dto): ProductEntity
    {
        // Business rule: Code must be unique
        if (! $this->repository->isCodeUnique($dto->code)) {
            throw new \InvalidArgumentException("Product code '{$dto->code}' already exists");
        }

        // Create domain entity
        $product = new ProductEntity(
            name: $dto->name,
            code: $dto->code,
            baseUnit: $dto->baseUnit,
            description: $dto->description,
            allowedUnits: $dto->allowedUnits,
            status: $dto->status,
            metadata: $dto->metadata
        );

        // Persist the entity
        try {
            return $this->repository->save($product);
        } catch (\Exception $e) {
            throw new \RuntimeException('Failed to create product: '.$e->getMessage(), 0, $e);
        }
    }
}
