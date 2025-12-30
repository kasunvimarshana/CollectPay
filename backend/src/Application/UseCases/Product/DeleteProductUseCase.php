<?php

declare(strict_types=1);

namespace Application\UseCases\Product;

use Domain\Repositories\ProductRepositoryInterface;

/**
 * Use Case: Delete a product
 */
final class DeleteProductUseCase
{
    public function __construct(
        private readonly ProductRepositoryInterface $productRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param string $productId
     * @return bool
     * @throws \InvalidArgumentException
     */
    public function execute(string $productId): bool
    {
        $product = $this->productRepository->findById($productId);
        
        if (!$product) {
            throw new \InvalidArgumentException("Product with ID {$productId} not found");
        }

        return $this->productRepository->delete($productId);
    }
}
