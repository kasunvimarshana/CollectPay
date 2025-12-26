<?php

namespace App\Application\UseCases;

use App\Application\DTOs\CreateProductDTO;
use App\Domain\Entities\ProductEntity;
use App\Domain\Repositories\ProductRepositoryInterface;
use App\Domain\Exceptions\InvalidOperationException;

/**
 * Create Product Use Case
 * 
 * Handles the business logic for creating a new product.
 */
class CreateProductUseCase
{
    public function __construct(
        private ProductRepositoryInterface $productRepository
    ) {
    }

    /**
     * Execute the use case
     * 
     * @param CreateProductDTO $dto
     * @return ProductEntity
     * @throws InvalidOperationException
     */
    public function execute(CreateProductDTO $dto): ProductEntity
    {
        // Check if code already exists
        if ($this->productRepository->codeExists($dto->code)) {
            throw new InvalidOperationException("Product code '{$dto->code}' already exists");
        }

        // Create the product entity
        $product = new ProductEntity(
            name: $dto->name,
            code: $dto->code,
            defaultUnit: $dto->defaultUnit,
            supportedUnits: $dto->supportedUnits,
            description: $dto->description,
            metadata: $dto->metadata,
            isActive: $dto->isActive
        );

        // Save and return
        return $this->productRepository->save($product);
    }
}
