<?php

namespace App\Application\UseCases;

use App\Domain\Entities\ProductEntity;
use App\Domain\Repositories\ProductRepositoryInterface;
use App\Domain\Exceptions\EntityNotFoundException;

/**
 * Get Product Use Case
 * 
 * Handles the business logic for retrieving a single product by ID.
 */
class GetProductUseCase
{
    public function __construct(
        private ProductRepositoryInterface $productRepository
    ) {
    }

    /**
     * Execute the use case
     * 
     * @param int $id
     * @return ProductEntity
     * @throws EntityNotFoundException
     */
    public function execute(int $id): ProductEntity
    {
        $product = $this->productRepository->findById($id);

        if (!$product) {
            throw new EntityNotFoundException("Product not found with ID: {$id}");
        }

        return $product;
    }
}
