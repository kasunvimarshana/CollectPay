<?php

namespace App\Application\UseCases;

use App\Domain\Repositories\ProductRepositoryInterface;

/**
 * Delete Product Use Case
 * 
 * Handles the business logic for deleting a product.
 */
class DeleteProductUseCase
{
    public function __construct(
        private ProductRepositoryInterface $productRepository
    ) {
    }

    /**
     * Execute the use case
     * 
     * @param int $id
     * @return bool
     */
    public function execute(int $id): bool
    {
        return $this->productRepository->delete($id);
    }
}
