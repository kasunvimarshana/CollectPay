<?php

namespace App\Application\UseCases;

use App\Application\DTOs\CreateCollectionDTO;
use App\Domain\Entities\CollectionEntity;
use App\Domain\Repositories\CollectionRepositoryInterface;
use App\Domain\Repositories\ProductRateRepositoryInterface;
use App\Domain\Exceptions\InvalidOperationException;

/**
 * Create Collection Use Case
 * 
 * Handles the business logic for creating a new collection.
 * Applies appropriate product rate and calculates total amount.
 */
class CreateCollectionUseCase
{
    public function __construct(
        private CollectionRepositoryInterface $collectionRepository,
        private ProductRateRepositoryInterface $productRateRepository
    ) {
    }

    /**
     * Execute the use case
     * 
     * @param CreateCollectionDTO $dto
     * @return CollectionEntity
     * @throws InvalidOperationException
     */
    public function execute(CreateCollectionDTO $dto): CollectionEntity
    {
        // Find the appropriate rate for the product, unit, and date
        $rate = $this->productRateRepository->findCurrentRate(
            $dto->productId,
            $dto->unit,
            $dto->collectionDate
        );

        if (!$rate) {
            throw new InvalidOperationException(
                "No active rate found for product ID {$dto->productId}, unit {$dto->unit}, and date {$dto->collectionDate}"
            );
        }

        // Create the collection entity
        $collection = new CollectionEntity(
            supplierId: $dto->supplierId,
            productId: $dto->productId,
            userId: $dto->userId,
            collectionDate: new \DateTimeImmutable($dto->collectionDate),
            quantity: $dto->quantity,
            unit: $dto->unit,
            rateApplied: $rate->getRate(),
            productRateId: $rate->getId(),
            notes: $dto->notes,
            metadata: $dto->metadata
        );

        // Save and return
        return $this->collectionRepository->save($collection);
    }
}
