<?php

declare(strict_types=1);

namespace Application\UseCases\Collection;

use Domain\Entities\Collection;
use Domain\Repositories\CollectionRepositoryInterface;
use Domain\Repositories\SupplierRepositoryInterface;
use Domain\Repositories\ProductRepositoryInterface;
use Domain\Repositories\RateRepositoryInterface;
use Domain\Services\UuidGeneratorInterface;
use Domain\ValueObjects\Quantity;
use Domain\ValueObjects\Unit;
use Domain\ValueObjects\Money;
use Application\DTOs\CreateCollectionDTO;
use DateTimeImmutable;

/**
 * Create Collection Use Case
 * Handles the business logic for creating a new collection
 */
final class CreateCollectionUseCase
{
    public function __construct(
        private readonly CollectionRepositoryInterface $collectionRepository,
        private readonly SupplierRepositoryInterface $supplierRepository,
        private readonly ProductRepositoryInterface $productRepository,
        private readonly RateRepositoryInterface $rateRepository,
        private readonly UuidGeneratorInterface $uuidGenerator
    ) {}

    public function execute(CreateCollectionDTO $dto): Collection
    {
        // Validate supplier exists
        $supplier = $this->supplierRepository->findById($dto->supplierId);
        if (!$supplier) {
            throw new \DomainException("Supplier not found");
        }

        // Validate product exists
        $product = $this->productRepository->findById($dto->productId);
        if (!$product) {
            throw new \DomainException("Product not found");
        }

        // Validate rate exists
        $rate = $this->rateRepository->findById($dto->rateId);
        if (!$rate) {
            throw new \DomainException("Rate not found");
        }

        // Create quantity value object
        $quantity = Quantity::create(
            $dto->quantityValue,
            Unit::fromString($dto->quantityUnit)
        );

        // Create money value object
        $totalAmount = Money::fromFloat(
            $dto->totalAmount,
            $dto->totalAmountCurrency
        );

        // Create collection date
        $collectionDate = new DateTimeImmutable($dto->collectionDate);

        // Generate UUID for new collection
        $id = $this->uuidGenerator->generate();

        // Create new collection entity
        $collection = Collection::create(
            $id,
            $dto->supplierId,
            $dto->productId,
            $dto->rateId,
            $quantity,
            $totalAmount,
            $collectionDate,
            $dto->collectedBy,
            $dto->notes
        );

        // Persist to repository
        $this->collectionRepository->save($collection);

        return $collection;
    }
}
