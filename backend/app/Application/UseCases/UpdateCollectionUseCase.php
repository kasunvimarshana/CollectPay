<?php

namespace App\Application\UseCases;

use App\Application\DTOs\UpdateCollectionDTO;
use App\Domain\Entities\CollectionEntity;
use App\Domain\Repositories\CollectionRepositoryInterface;
use App\Domain\Repositories\ProductRateRepositoryInterface;
use App\Domain\Exceptions\EntityNotFoundException;
use App\Domain\Exceptions\InvalidOperationException;

/**
 * Update Collection Use Case
 * 
 * Handles the business logic for updating an existing collection.
 * Re-applies product rate if product, unit, or date changes.
 */
class UpdateCollectionUseCase
{
    public function __construct(
        private CollectionRepositoryInterface $collectionRepository,
        private ProductRateRepositoryInterface $productRateRepository
    ) {
    }

    /**
     * Execute the use case
     * 
     * @param UpdateCollectionDTO $dto
     * @return CollectionEntity
     * @throws EntityNotFoundException
     * @throws InvalidOperationException
     */
    public function execute(UpdateCollectionDTO $dto): CollectionEntity
    {
        // Find existing collection
        $collection = $this->collectionRepository->findById($dto->id);

        if (!$collection) {
            throw new EntityNotFoundException("Collection not found with ID: {$dto->id}");
        }

        // Check if we need to recalculate the rate
        $needsRateUpdate = $dto->productId !== null 
            || $dto->unit !== null 
            || $dto->collectionDate !== null;

        if ($needsRateUpdate) {
            $productId = $dto->productId ?? $collection->getProductId();
            $unit = $dto->unit ?? $collection->getUnit();
            $date = $dto->collectionDate ?? $collection->getCollectionDate()->format('Y-m-d');

            $rate = $this->productRateRepository->findCurrentRate($productId, $unit, $date);

            if (!$rate) {
                throw new InvalidOperationException(
                    "No active rate found for product ID {$productId}, unit {$unit}, and date {$date}"
                );
            }

            // Update rate
            $collection->updateRate($rate->getRate(), $rate->getId());
        }

        // Update quantity if provided
        if ($dto->quantity !== null) {
            $collection->updateQuantity($dto->quantity);
        }

        // Update notes if provided
        if ($dto->notes !== null) {
            $collection->updateNotes($dto->notes);
        }

        // Increment version
        $collection->incrementVersion();

        // Save and return
        return $this->collectionRepository->update($collection);
    }
}
