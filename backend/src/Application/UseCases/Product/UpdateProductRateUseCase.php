<?php

namespace App\Application\UseCases\Product;

use App\Domain\Repositories\ProductRepositoryInterface;

/**
 * Update Product Rate Use Case
 * 
 * Creates a new rate version for historical tracking.
 */
class UpdateProductRateUseCase
{
    public function __construct(
        private readonly ProductRepositoryInterface $productRepository
    ) {}

    public function execute(
        int $productId,
        float $newRate,
        string $unit,
        ?\DateTimeInterface $effectiveFrom = null
    ): bool {
        $product = $this->productRepository->findById($productId);
        if (!$product) {
            throw new \DomainException('Product not found');
        }

        // Update product's current rate
        $product->setCurrentRate($newRate);
        $this->productRepository->save($product);

        // Create new rate version for history
        return $this->productRepository->saveRateVersion(
            $productId,
            $newRate,
            $unit,
            $effectiveFrom ?? new \DateTimeImmutable()
        );
    }
}
