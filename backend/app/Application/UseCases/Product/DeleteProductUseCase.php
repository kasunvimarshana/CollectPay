<?php

namespace App\Application\UseCases\Product;

use App\Domain\Repositories\ProductRepositoryInterface;
use InvalidArgumentException;

/**
 * Delete Product Use Case
 */
class DeleteProductUseCase
{
    public function __construct(
        private ProductRepositoryInterface $productRepository
    ) {}

    public function execute(int $id): bool
    {
        $product = $this->productRepository->findById($id);
        
        if (!$product) {
            throw new InvalidArgumentException("Product with ID {$id} not found");
        }

        return $this->productRepository->delete($id);
    }
}
