<?php

declare(strict_types=1);

namespace Application\UseCases\Collection;

use Domain\Repositories\CollectionRepositoryInterface;

/**
 * Use Case: Delete a collection
 */
final class DeleteCollectionUseCase
{
    public function __construct(
        private readonly CollectionRepositoryInterface $collectionRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param string $collectionId
     * @return bool
     * @throws \InvalidArgumentException
     */
    public function execute(string $collectionId): bool
    {
        $collection = $this->collectionRepository->findById($collectionId);
        
        if (!$collection) {
            throw new \InvalidArgumentException("Collection with ID {$collectionId} not found");
        }

        return $this->collectionRepository->delete($collectionId);
    }
}
