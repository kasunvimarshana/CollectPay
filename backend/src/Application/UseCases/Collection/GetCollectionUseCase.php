<?php

declare(strict_types=1);

namespace Application\UseCases\Collection;

use Domain\Entities\Collection;
use Domain\Repositories\CollectionRepositoryInterface;

/**
 * Use Case: Get collection by ID
 */
final class GetCollectionUseCase
{
    public function __construct(
        private readonly CollectionRepositoryInterface $collectionRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param string $collectionId
     * @return Collection
     * @throws \InvalidArgumentException
     */
    public function execute(string $collectionId): Collection
    {
        $collection = $this->collectionRepository->findById($collectionId);
        
        if (!$collection) {
            throw new \InvalidArgumentException("Collection with ID {$collectionId} not found");
        }

        return $collection;
    }
}
