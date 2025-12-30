<?php

declare(strict_types=1);

namespace Application\UseCases\Collection;

use Application\DTOs\CreateCollectionDTO;
use Domain\Entities\Collection;
use Domain\Repositories\SupplierRepositoryInterface;
use Domain\Repositories\ProductRepositoryInterface;
use Domain\Repositories\ProductRateRepositoryInterface;
use Domain\Repositories\CollectionRepositoryInterface;
use Domain\ValueObjects\UUID;
use Domain\ValueObjects\Quantity;
use DateTimeImmutable;
use InvalidArgumentException;

final class CreateCollectionUseCase
{
    public function __construct(
        private CollectionRepositoryInterface $collectionRepository,
        private SupplierRepositoryInterface $supplierRepository,
        private ProductRepositoryInterface $productRepository,
        private ProductRateRepositoryInterface $rateRepository
    ) {}

    public function execute(CreateCollectionDTO $dto): Collection
    {
        $supplierId = UUID::fromString($dto->supplierId);
        $productId = UUID::fromString($dto->productId);
        $collectionDate = new DateTimeImmutable($dto->collectionDate);

        // Verify supplier exists
        $supplier = $this->supplierRepository->findById($supplierId);
        if (!$supplier) {
            throw new InvalidArgumentException('Supplier not found');
        }

        // Verify product exists
        $product = $this->productRepository->findById($productId);
        if (!$product) {
            throw new InvalidArgumentException('Product not found');
        }

        // Get active rate for the collection date
        $rate = $this->rateRepository->findActiveRateForProduct($productId, $collectionDate);
        if (!$rate) {
            throw new InvalidArgumentException('No active rate found for this product on the collection date');
        }

        $quantity = new Quantity($dto->quantityAmount, $dto->quantityUnit);

        $collection = Collection::create(
            $supplierId,
            $productId,
            $quantity,
            $rate->rate(),
            $collectionDate,
            $dto->notes
        );

        $this->collectionRepository->save($collection);

        return $collection;
    }
}
