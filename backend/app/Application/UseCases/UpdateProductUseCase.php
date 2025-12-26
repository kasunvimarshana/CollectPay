<?php

namespace App\Application\UseCases;

use App\Application\DTOs\UpdateProductDTO;
use App\Domain\Entities\ProductEntity;
use App\Domain\Repositories\ProductRepositoryInterface;
use App\Domain\Exceptions\EntityNotFoundException;
use App\Domain\Exceptions\InvalidOperationException;

/**
 * Update Product Use Case
 * 
 * Handles the business logic for updating an existing product.
 */
class UpdateProductUseCase
{
    public function __construct(
        private ProductRepositoryInterface $productRepository
    ) {
    }

    /**
     * Execute the use case
     * 
     * @param UpdateProductDTO $dto
     * @return ProductEntity
     * @throws EntityNotFoundException
     * @throws InvalidOperationException
     */
    public function execute(UpdateProductDTO $dto): ProductEntity
    {
        // Find existing product
        $product = $this->productRepository->findById($dto->id);

        if (!$product) {
            throw new EntityNotFoundException("Product not found with ID: {$dto->id}");
        }

        // Check if new code already exists (excluding current product)
        if ($dto->code !== null && $this->productRepository->codeExists($dto->code, $dto->id)) {
            throw new InvalidOperationException("Product code '{$dto->code}' already exists");
        }

        // Update details if provided
        if ($dto->name !== null || $dto->description !== null || $dto->metadata !== null) {
            $product->updateDetails(
                name: $dto->name,
                description: $dto->description,
                metadata: $dto->metadata
            );
        }

        // Update supported units if provided
        if ($dto->supportedUnits !== null) {
            // For simplicity, we'll recreate the product with new units
            // In production, you might want to handle this more granularly
            foreach ($dto->supportedUnits as $unit) {
                if (!$product->supportsUnit($unit)) {
                    $product->addSupportedUnit($unit);
                }
            }
        }

        // Update default unit if provided
        if ($dto->defaultUnit !== null && $dto->defaultUnit !== $product->getDefaultUnit()) {
            $product->changeDefaultUnit($dto->defaultUnit);
        }

        // Update active status if provided
        if ($dto->isActive !== null) {
            $dto->isActive ? $product->activate() : $product->deactivate();
        }

        // Increment version
        $product->incrementVersion();

        // Save and return
        return $this->productRepository->update($product);
    }
}
