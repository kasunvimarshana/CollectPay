<?php

namespace App\Application\UseCases\Product;

use App\Domain\Entities\ProductEntity;
use App\Domain\Repositories\ProductRepositoryInterface;

/**
 * Get Product Use Case
 *
 * Retrieves a single product by ID.
 */
class GetProductUseCase
{
    private ProductRepositoryInterface $repository;

    public function __construct(ProductRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Execute the use case
     *
     * @throws \InvalidArgumentException
     */
    public function execute(int $id): ProductEntity
    {
        $product = $this->repository->findById($id);

        if ($product === null) {
            throw new \InvalidArgumentException("Product with ID {$id} not found");
        }

        return $product;
    }
}
