<?php

declare(strict_types=1);

namespace Application\UseCases\Product;

use Domain\Repositories\ProductRepositoryInterface;

/**
 * Use Case: List all products
 */
final class ListProductsUseCase
{
    public function __construct(
        private readonly ProductRepositoryInterface $productRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param int $page
     * @param int $perPage
     * @param array $filters
     * @return array
     */
    public function execute(int $page = 1, int $perPage = 15, array $filters = []): array
    {
        return $this->productRepository->findAll($page, $perPage, $filters);
    }
}
