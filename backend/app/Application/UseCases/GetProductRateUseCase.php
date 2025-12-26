<?php

namespace App\Application\UseCases;

use App\Domain\Entities\ProductRateEntity;
use App\Domain\Repositories\ProductRateRepositoryInterface;
use App\Domain\Exceptions\EntityNotFoundException;

/**
 * Get ProductRate Use Case
 * 
 * Handles the business logic for retrieving a single product rate by ID.
 */
class GetProductRateUseCase
{
    public function __construct(
        private ProductRateRepositoryInterface $productRateRepository
    ) {
    }

    /**
     * Execute the use case
     * 
     * @param int $id
     * @return ProductRateEntity
     * @throws EntityNotFoundException
     */
    public function execute(int $id): ProductRateEntity
    {
        $rate = $this->productRateRepository->findById($id);

        if (!$rate) {
            throw new EntityNotFoundException("ProductRate not found with ID: {$id}");
        }

        return $rate;
    }
}
