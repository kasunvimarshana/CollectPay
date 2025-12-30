<?php

declare(strict_types=1);

namespace Application\UseCases\Product;

use Application\DTOs\UpdateProductDTO;
use Domain\Entities\Product;
use Domain\Repositories\ProductRepositoryInterface;
use Domain\ValueObjects\Unit;

/**
 * Use Case: Update an existing product
 */
final class UpdateProductUseCase
{
    public function __construct(
        private readonly ProductRepositoryInterface $productRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param string $productId
     * @param UpdateProductDTO $dto
     * @return Product
     * @throws \InvalidArgumentException
     */
    public function execute(string $productId, UpdateProductDTO $dto): Product
    {
        // Find existing product
        $product = $this->productRepository->findById($productId);
        
        if (!$product) {
            throw new \InvalidArgumentException("Product with ID {$productId} not found");
        }

        // Update name if provided
        if ($dto->name !== null) {
            $product->updateName($dto->name);
        }

        // Update default unit if provided
        if ($dto->defaultUnit !== null) {
            $unit = new Unit($dto->defaultUnit);
            $product->updateDefaultUnit($unit);
        }

        // Update description if provided
        if ($dto->description !== null) {
            $product->updateDescription($dto->description);
        }

        // Update metadata if provided
        if ($dto->metadata !== null) {
            $product->updateMetadata($dto->metadata);
        }

        // Update active status if provided
        if ($dto->isActive !== null) {
            if ($dto->isActive) {
                $product->activate();
            } else {
                $product->deactivate();
            }
        }

        // Persist changes
        return $this->productRepository->save($product);
    }
}
