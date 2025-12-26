<?php

namespace App\Application\UseCases;

use App\Domain\Repositories\CollectionRepositoryInterface;

/**
 * Delete Collection Use Case
 * 
 * Handles the business logic for deleting a collection.
 */
class DeleteCollectionUseCase
{
    public function __construct(
        private CollectionRepositoryInterface $collectionRepository
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
        return $this->collectionRepository->delete($id);
    }
}
