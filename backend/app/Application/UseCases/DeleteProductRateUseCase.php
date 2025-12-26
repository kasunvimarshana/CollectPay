<?php

namespace App\Application\UseCases;

use App\Domain\Repositories\ProductRateRepositoryInterface;

/**
 * Delete ProductRate Use Case
 * 
 * Handles the business logic for deleting a product rate.
 */
class DeleteProductRateUseCase
{
    public function __construct(
        private ProductRateRepositoryInterface $productRateRepository
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
        return $this->productRateRepository->delete($id);
    }
}
