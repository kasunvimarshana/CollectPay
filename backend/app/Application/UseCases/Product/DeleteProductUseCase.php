<?php

namespace App\Application\UseCases\Product;

use App\Domain\Repositories\ProductRepositoryInterface;

/**
 * Delete Product Use Case
 *
 * Deletes a product by ID.
 */
class DeleteProductUseCase
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
     * @throws \RuntimeException
     */
    public function execute(int $id): bool
    {
        if (! $this->repository->exists($id)) {
            throw new \InvalidArgumentException("Product with ID {$id} not found");
        }

        try {
            return $this->repository->delete($id);
        } catch (\Exception $e) {
            throw new \RuntimeException('Failed to delete product: '.$e->getMessage(), 0, $e);
        }
    }
}
