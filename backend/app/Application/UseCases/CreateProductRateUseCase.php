<?php

namespace App\Application\UseCases;

use App\Application\DTOs\CreateProductRateDTO;
use App\Domain\Entities\ProductRateEntity;
use App\Domain\Repositories\ProductRateRepositoryInterface;

/**
 * Create ProductRate Use Case
 * 
 * Handles the business logic for creating a new product rate.
 */
class CreateProductRateUseCase
{
    public function __construct(
        private ProductRateRepositoryInterface $productRateRepository
    ) {
    }

    /**
     * Execute the use case
     * 
     * @param CreateProductRateDTO $dto
     * @return ProductRateEntity
     */
    public function execute(CreateProductRateDTO $dto): ProductRateEntity
    {
        // Create the product rate entity
        $rate = new ProductRateEntity(
            productId: $dto->productId,
            unit: $dto->unit,
            rate: $dto->rate,
            effectiveDate: new \DateTimeImmutable($dto->effectiveDate),
            endDate: $dto->endDate ? new \DateTimeImmutable($dto->endDate) : null,
            isActive: $dto->isActive,
            metadata: $dto->metadata
        );

        // Save and return
        return $this->productRateRepository->save($rate);
    }
}
