<?php

declare(strict_types=1);

namespace Application\UseCases\Collection;

use Application\DTOs\CreateCollectionDTO;
use Domain\Entities\Collection;
use Domain\Repositories\CollectionRepositoryInterface;
use Domain\Repositories\ProductRepositoryInterface;
use Domain\Repositories\SupplierRepositoryInterface;
use Domain\Repositories\UserRepositoryInterface;
use Domain\ValueObjects\Quantity;
use Domain\ValueObjects\Unit;

/**
 * Use Case: Create a new collection
 * 
 * This use case handles recording a new collection transaction.
 * It automatically applies the current rate for the product.
 */
final class CreateCollectionUseCase
{
    public function __construct(
        private readonly CollectionRepositoryInterface $collectionRepository,
        private readonly SupplierRepositoryInterface $supplierRepository,
        private readonly ProductRepositoryInterface $productRepository,
        private readonly UserRepositoryInterface $userRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param CreateCollectionDTO $dto
     * @return Collection
     * @throws \InvalidArgumentException
     */
    public function execute(CreateCollectionDTO $dto): Collection
    {
        // Validate supplier exists
        $supplier = $this->supplierRepository->findById($dto->supplierId);
        if (!$supplier) {
            throw new \InvalidArgumentException("Supplier with ID {$dto->supplierId} not found");
        }

        // Validate product exists
        $product = $this->productRepository->findById($dto->productId);
        if (!$product) {
            throw new \InvalidArgumentException("Product with ID {$dto->productId} not found");
        }

        // Validate user exists
        $user = $this->userRepository->findById($dto->userId);
        if (!$user) {
            throw new \InvalidArgumentException("User with ID {$dto->userId} not found");
        }

        // Create quantity value object
        $unit = new Unit($dto->unit);
        $quantity = new Quantity($dto->quantity, $unit);

        // Get current rate for the product
        $currentRate = $product->getCurrentRate();
        if (!$currentRate) {
            throw new \InvalidArgumentException("Product {$product->name()} has no active rate");
        }

        // Create collection date
        $collectionDate = $dto->collectionDate 
            ? new \DateTimeImmutable($dto->collectionDate)
            : new \DateTimeImmutable();

        // Generate UUID for collection
        $id = \Illuminate\Support\Str::uuid()->toString();

        // Create collection entity
        $collection = Collection::create(
            id: $id,
            supplierId: $dto->supplierId,
            productId: $dto->productId,
            userId: $dto->userId,
            quantity: $quantity,
            appliedRate: $currentRate,
            collectionDate: $collectionDate,
            notes: null,
            metadata: $dto->metadata
        );

        // Persist collection
        return $this->collectionRepository->save($collection);
    }
}
