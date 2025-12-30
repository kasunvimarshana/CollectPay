<?php

namespace App\Application\UseCases\ProductRate;

use App\Application\DTOs\ProductRateDTO;
use App\Domain\Entities\ProductRateEntity;
use App\Domain\Repositories\ProductRateRepositoryInterface;
use App\Domain\Repositories\ProductRepositoryInterface;

/**
 * Add Product Rate Use Case
 *
 * Adds a new rate for a product with date-based versioning.
 */
class AddProductRateUseCase
{
    private ProductRateRepositoryInterface $rateRepository;

    private ProductRepositoryInterface $productRepository;

    public function __construct(
        ProductRateRepositoryInterface $rateRepository,
        ProductRepositoryInterface $productRepository
    ) {
        $this->rateRepository = $rateRepository;
        $this->productRepository = $productRepository;
    }

    /**
     * Execute the use case
     *
     * @throws \InvalidArgumentException
     * @throws \RuntimeException
     */
    public function execute(ProductRateDTO $dto): ProductRateEntity
    {
        // Verify product exists
        if (! $this->productRepository->exists($dto->productId)) {
            throw new \InvalidArgumentException("Product with ID {$dto->productId} not found");
        }

        // Create rate entity
        $effectiveFrom = new \DateTime($dto->effectiveFrom);
        $effectiveTo = $dto->effectiveTo ? new \DateTime($dto->effectiveTo) : null;

        $rate = new ProductRateEntity(
            productId: $dto->productId,
            rate: $dto->rate,
            unit: $dto->unit,
            effectiveFrom: $effectiveFrom,
            effectiveTo: $effectiveTo,
            isActive: $dto->isActive,
            notes: $dto->notes
        );

        // Persist the entity
        try {
            return $this->rateRepository->save($rate);
        } catch (\Exception $e) {
            throw new \RuntimeException('Failed to add product rate: '.$e->getMessage(), 0, $e);
        }
    }
}
