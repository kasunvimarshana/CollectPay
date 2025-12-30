<?php

declare(strict_types=1);

namespace Application\UseCases\Product;

use Domain\Entities\Product;
use Domain\Repositories\ProductRepositoryInterface;

/**
 * Use Case: Get product by ID
 */
final class GetProductUseCase
{
    public function __construct(
        private readonly ProductRepositoryInterface $productRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param string $productId
     * @return Product
     * @throws \InvalidArgumentException
     */
    public function execute(string $productId): Product
    {
        $product = $this->productRepository->findById($productId);
        
        if (!$product) {
            throw new \InvalidArgumentException("Product with ID {$productId} not found");
        }

        return $product;
    }
}
