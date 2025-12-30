<?php

namespace App\Application\UseCases\ProductRate;

use App\Domain\Repositories\ProductRateRepositoryInterface;

/**
 * List Product Rates Use Case
 *
 * Lists all rates for a product.
 */
class ListProductRatesUseCase
{
    private ProductRateRepositoryInterface $repository;

    public function __construct(ProductRateRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Execute the use case
     *
     * @return array ProductRateEntity[]
     */
    public function execute(int $productId, bool $activeOnly = false): array
    {
        return $this->repository->findByProduct($productId, $activeOnly);
    }
}
