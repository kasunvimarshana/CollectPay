<?php

namespace LedgerFlow\Application\UseCases;

use LedgerFlow\Domain\Entities\Collection;
use LedgerFlow\Domain\Repositories\CollectionRepositoryInterface;
use LedgerFlow\Domain\Repositories\ProductRateRepositoryInterface;
use LedgerFlow\Domain\Repositories\SupplierRepositoryInterface;
use LedgerFlow\Domain\Repositories\ProductRepositoryInterface;

class CreateCollection
{
    private CollectionRepositoryInterface $collectionRepository;
    private ProductRateRepositoryInterface $productRateRepository;
    private SupplierRepositoryInterface $supplierRepository;
    private ProductRepositoryInterface $productRepository;

    public function __construct(
        CollectionRepositoryInterface $collectionRepository,
        ProductRateRepositoryInterface $productRateRepository,
        SupplierRepositoryInterface $supplierRepository,
        ProductRepositoryInterface $productRepository
    ) {
        $this->collectionRepository = $collectionRepository;
        $this->productRateRepository = $productRateRepository;
        $this->supplierRepository = $supplierRepository;
        $this->productRepository = $productRepository;
    }

    public function execute(array $data): Collection
    {
        // Validate input
        $this->validate($data);

        // Verify supplier exists
        $supplier = $this->supplierRepository->findById($data['supplier_id']);
        if (!$supplier) {
            throw new \InvalidArgumentException('Supplier not found');
        }

        // Verify product exists
        $product = $this->productRepository->findById($data['product_id']);
        if (!$product) {
            throw new \InvalidArgumentException('Product not found');
        }

        // Determine collection date
        $collectionDate = isset($data['collection_date'])
            ? new \DateTime($data['collection_date'])
            : new \DateTime();

        // Get rate for the collection date (if not provided)
        $rate = $data['rate'] ?? null;
        if ($rate === null) {
            $productRate = $this->productRateRepository->findCurrentRate(
                $data['product_id'],
                $collectionDate->format('Y-m-d')
            );

            if (!$productRate) {
                throw new \InvalidArgumentException('No rate found for product on this date');
            }

            $rate = $productRate->getRate();
        }

        // Create collection entity
        $collection = new Collection(
            $this->generateId(),
            $data['supplier_id'],
            $data['product_id'],
            (float)$data['quantity'],
            (float)$rate,
            $collectionDate,
            $data['notes'] ?? null,
            $data['collected_by'] ?? null
        );

        // Save to repository
        $this->collectionRepository->save($collection);

        return $collection;
    }

    private function validate(array $data): void
    {
        if (empty($data['supplier_id'])) {
            throw new \InvalidArgumentException('Supplier ID is required');
        }

        if (empty($data['product_id'])) {
            throw new \InvalidArgumentException('Product ID is required');
        }

        if (!isset($data['quantity']) || $data['quantity'] <= 0) {
            throw new \InvalidArgumentException('Quantity must be greater than 0');
        }

        if (isset($data['rate']) && $data['rate'] < 0) {
            throw new \InvalidArgumentException('Rate cannot be negative');
        }
    }

    private function generateId(): string
    {
        return uniqid('collection_', true);
    }
}
