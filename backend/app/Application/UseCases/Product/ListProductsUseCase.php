<?php

namespace App\Application\UseCases\Product;

use App\Domain\Repositories\ProductRepositoryInterface;

/**
 * List Products Use Case
 *
 * Lists products with optional filtering and pagination.
 */
class ListProductsUseCase
{
    private ProductRepositoryInterface $repository;

    public function __construct(ProductRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Execute the use case
     *
     * @return array ['data' => ProductEntity[], 'total' => int, 'page' => int]
     */
    public function execute(array $filters = [], int $page = 1, int $perPage = 15): array
    {
        return $this->repository->list($filters, $page, $perPage);
    }
}
