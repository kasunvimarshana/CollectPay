<?php

namespace App\Application\UseCases\Collection;

use App\Domain\Repositories\CollectionRepositoryInterface;

/**
 * Delete Collection Use Case
 *
 * Deletes a collection by ID.
 */
class DeleteCollectionUseCase
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
     * @throws \RuntimeException
     */
    public function execute(int $id): bool
    {
        if (! $this->repository->exists($id)) {
            throw new \InvalidArgumentException("Collection with ID {$id} not found");
        }

        try {
            return $this->repository->delete($id);
        } catch (\Exception $e) {
            throw new \RuntimeException('Failed to delete collection: '.$e->getMessage(), 0, $e);
        }
    }
}
