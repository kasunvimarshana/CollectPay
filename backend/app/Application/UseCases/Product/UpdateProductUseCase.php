<?php

namespace App\Application\UseCases\Product;

use App\Application\DTOs\ProductDTO;
use App\Domain\Entities\ProductEntity;
use App\Domain\Repositories\ProductRepositoryInterface;

/**
 * Update Product Use Case
 *
 * Encapsulates the business logic for updating a product with version control.
 * This follows Single Responsibility Principle (SOLID).
 */
class UpdateProductUseCase
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
    public function execute(int $id, ProductDTO $dto): ProductEntity
    {
        // Find existing product
        $existingProduct = $this->repository->findById($id);
        if ($existingProduct === null) {
            throw new \InvalidArgumentException("Product with ID {$id} not found");
        }

        // Optimistic locking: Check version conflict
        if ($existingProduct->getVersion() !== $dto->version) {
            throw new \RuntimeException(
                'Version conflict: Product has been modified by another user. '.
                "Expected version {$dto->version}, but current version is {$existingProduct->getVersion()}"
            );
        }

        // Business rule: Code must be unique (excluding current product)
        if ($dto->code !== $existingProduct->getCode()) {
            if (! $this->repository->isCodeUnique($dto->code, $id)) {
                throw new \InvalidArgumentException("Product code '{$dto->code}' already exists");
            }
        }

        // Create updated entity
        $product = new ProductEntity(
            name: $dto->name,
            code: $dto->code,
            baseUnit: $dto->baseUnit,
            description: $dto->description,
            allowedUnits: $dto->allowedUnits,
            status: $dto->status,
            metadata: $dto->metadata,
            version: $dto->version + 1, // Increment version
            id: $id,
            createdAt: $existingProduct->getCreatedAt()
        );

        // Persist the updated entity
        try {
            return $this->repository->save($product);
        } catch (\Exception $e) {
            throw new \RuntimeException('Failed to update product: '.$e->getMessage(), 0, $e);
        }
    }
}
