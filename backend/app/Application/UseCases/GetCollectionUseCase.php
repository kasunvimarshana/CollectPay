<?php

namespace App\Application\UseCases;

use App\Domain\Entities\CollectionEntity;
use App\Domain\Repositories\CollectionRepositoryInterface;
use App\Domain\Exceptions\EntityNotFoundException;

/**
 * Get Collection Use Case
 * 
 * Handles the business logic for retrieving a single collection by ID.
 */
class GetCollectionUseCase
{
    public function __construct(
        private CollectionRepositoryInterface $collectionRepository
    ) {
    }

    /**
     * Execute the use case
     * 
     * @param int $id
     * @return CollectionEntity
     * @throws EntityNotFoundException
     */
    public function execute(int $id): CollectionEntity
    {
        $collection = $this->collectionRepository->findById($id);

        if (!$collection) {
            throw new EntityNotFoundException("Collection not found with ID: {$id}");
        }

        return $collection;
    }
}
