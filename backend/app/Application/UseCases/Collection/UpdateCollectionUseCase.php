<?php

namespace App\Application\UseCases\Collection;

use App\Application\DTOs\CollectionDTO;
use App\Domain\Entities\CollectionEntity;
use App\Domain\Repositories\CollectionRepositoryInterface;

/**
 * Update Collection Use Case
 *
 * Encapsulates the business logic for updating a collection with version control.
 */
class UpdateCollectionUseCase
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
    public function execute(int $id, CollectionDTO $dto): CollectionEntity
    {
        // Find existing collection
        $existingCollection = $this->repository->findById($id);
        if ($existingCollection === null) {
            throw new \InvalidArgumentException("Collection with ID {$id} not found");
        }

        // Optimistic locking: Check version conflict
        if ($existingCollection->getVersion() !== $dto->version) {
            throw new \RuntimeException(
                'Version conflict: Collection has been modified by another user. '.
                "Expected version {$dto->version}, but current version is {$existingCollection->getVersion()}"
            );
        }

        // Create updated entity
        $collectionDate = new \DateTime($dto->collectionDate);

        $collection = new CollectionEntity(
            supplierId: $dto->supplierId,
            productId: $dto->productId,
            collectedBy: $dto->collectedBy,
            quantity: $dto->quantity,
            unit: $dto->unit,
            rate: $dto->rate,
            collectionDate: $collectionDate,
            rateId: $dto->rateId,
            collectionTime: $dto->collectionTime,
            notes: $dto->notes,
            metadata: $dto->metadata,
            version: $dto->version + 1, // Increment version
            id: $id,
            createdAt: $existingCollection->getCreatedAt()
        );

        // Persist the updated entity
        try {
            return $this->repository->save($collection);
        } catch (\Exception $e) {
            throw new \RuntimeException('Failed to update collection: '.$e->getMessage(), 0, $e);
        }
    }
}
