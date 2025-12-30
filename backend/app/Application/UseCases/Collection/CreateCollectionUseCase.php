<?php

namespace App\Application\UseCases\Collection;

use App\Application\DTOs\CollectionDTO;
use App\Domain\Entities\CollectionEntity;
use App\Domain\Repositories\CollectionRepositoryInterface;
use App\Domain\Repositories\ProductRepositoryInterface;
use App\Domain\Repositories\SupplierRepositoryInterface;

/**
 * Create Collection Use Case
 *
 * Encapsulates the business logic for creating a new collection.
 */
class CreateCollectionUseCase
{
    private CollectionRepositoryInterface $collectionRepository;

    private SupplierRepositoryInterface $supplierRepository;

    private ProductRepositoryInterface $productRepository;

    public function __construct(
        CollectionRepositoryInterface $collectionRepository,
        SupplierRepositoryInterface $supplierRepository,
        ProductRepositoryInterface $productRepository
    ) {
        $this->collectionRepository = $collectionRepository;
        $this->supplierRepository = $supplierRepository;
        $this->productRepository = $productRepository;
    }

    /**
     * Execute the use case
     *
     * @throws \InvalidArgumentException
     * @throws \RuntimeException
     */
    public function execute(CollectionDTO $dto): CollectionEntity
    {
        // Verify supplier exists
        if (! $this->supplierRepository->exists($dto->supplierId)) {
            throw new \InvalidArgumentException("Supplier with ID {$dto->supplierId} not found");
        }

        // Verify product exists
        if (! $this->productRepository->exists($dto->productId)) {
            throw new \InvalidArgumentException("Product with ID {$dto->productId} not found");
        }

        // Create collection entity
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
            metadata: $dto->metadata
        );

        // Persist the entity
        try {
            return $this->collectionRepository->save($collection);
        } catch (\Exception $e) {
            throw new \RuntimeException('Failed to create collection: '.$e->getMessage(), 0, $e);
        }
    }
}
