<?php

namespace App\Application\UseCases;

use App\Application\DTOs\UpdateProductRateDTO;
use App\Domain\Entities\ProductRateEntity;
use App\Domain\Repositories\ProductRateRepositoryInterface;
use App\Domain\Exceptions\EntityNotFoundException;

/**
 * Update ProductRate Use Case
 * 
 * Handles the business logic for updating an existing product rate.
 */
class UpdateProductRateUseCase
{
    public function __construct(
        private ProductRateRepositoryInterface $productRateRepository
    ) {
    }

    /**
     * Execute the use case
     * 
     * @param UpdateProductRateDTO $dto
     * @return ProductRateEntity
     * @throws EntityNotFoundException
     */
    public function execute(UpdateProductRateDTO $dto): ProductRateEntity
    {
        // Find existing product rate
        $rate = $this->productRateRepository->findById($dto->id);

        if (!$rate) {
            throw new EntityNotFoundException("ProductRate not found with ID: {$dto->id}");
        }

        // Update rate if provided
        if ($dto->rate !== null) {
            $rate->updateRate($dto->rate);
        }

        // Update end date if provided
        if ($dto->endDate !== null) {
            $rate->setEndDate(new \DateTimeImmutable($dto->endDate));
        }

        // Update active status if provided
        if ($dto->isActive !== null) {
            $dto->isActive ? $rate->activate() : $rate->deactivate();
        }

        // Increment version
        $rate->incrementVersion();

        // Save and return
        return $this->productRateRepository->update($rate);
    }
}
