<?php

namespace App\Application\UseCases\Product;

use App\Domain\Entities\Product;
use App\Domain\Repositories\ProductRepositoryInterface;

/**
 * Create Product Use Case
 */
class CreateProductUseCase
{
    public function __construct(
        private readonly ProductRepositoryInterface $productRepository
    ) {}

    public function execute(
        string $name,
        string $unit,
        float $currentRate
    ): Product {
        $product = new Product(
            null,
            $name,
            $unit,
            $currentRate
        );

        $savedProduct = $this->productRepository->save($product);

        // Create initial rate version
        $this->productRepository->saveRateVersion(
            $savedProduct->getId(),
            $currentRate,
            $unit,
            new \DateTimeImmutable()
        );

        return $savedProduct;
    }
}
