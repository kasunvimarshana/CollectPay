<?php

namespace App\Application\UseCases\Collection;

use App\Domain\Entities\Collection;
use App\Domain\Repositories\CollectionRepositoryInterface;
use App\Domain\Repositories\ProductRepositoryInterface;

/**
 * Record Collection Use Case
 * 
 * Records a new collection with rate snapshot.
 */
class RecordCollectionUseCase
{
    public function __construct(
        private readonly CollectionRepositoryInterface $collectionRepository,
        private readonly ProductRepositoryInterface $productRepository
    ) {}

    public function execute(
        int $supplierId,
        int $productId,
        float $quantity,
        string $unit,
        int $createdBy,
        ?\DateTimeInterface $collectedAt = null
    ): Collection {
        // Get current product rate
        $product = $this->productRepository->findById($productId);
        if (!$product) {
            throw new \DomainException('Product not found');
        }

        // Snapshot the current rate
        $rateApplied = $product->getCurrentRate();

        // Create collection with rate snapshot
        $collection = new Collection(
            null,
            $supplierId,
            $productId,
            $quantity,
            $unit,
            $rateApplied,
            $collectedAt ?? new \DateTimeImmutable(),
            $createdBy
        );

        // Persist collection
        return $this->collectionRepository->save($collection);
    }
}
