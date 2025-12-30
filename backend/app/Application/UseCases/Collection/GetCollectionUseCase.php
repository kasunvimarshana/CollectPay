<?php

namespace App\Application\UseCases\Collection;

use App\Domain\Entities\CollectionEntity;
use App\Domain\Repositories\CollectionRepositoryInterface;

/**
 * Get Collection Use Case
 *
 * Retrieves a single collection by ID.
 */
class GetCollectionUseCase
{
    private CollectionRepositoryInterface $repository;

    public function __construct(CollectionRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Execute the use case
     *
     * @throws \InvalidArgumentException
     */
    public function execute(int $id): CollectionEntity
    {
        $collection = $this->repository->findById($id);

        if ($collection === null) {
            throw new \InvalidArgumentException("Collection with ID {$id} not found");
        }

        return $collection;
    }
}
