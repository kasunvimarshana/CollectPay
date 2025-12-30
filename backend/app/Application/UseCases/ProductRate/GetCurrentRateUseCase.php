<?php

namespace App\Application\UseCases\ProductRate;

use App\Domain\Entities\ProductRateEntity;
use App\Domain\Repositories\ProductRateRepositoryInterface;
use App\Domain\Repositories\ProductRepositoryInterface;

/**
 * Get Current Product Rate Use Case
 *
 * Retrieves the currently effective rate for a product, unit, and date.
 */
class GetCurrentRateUseCase
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
     */
    public function execute(int $productId, string $unit, ?\DateTimeInterface $date = null): ProductRateEntity
    {
        // Verify product exists
        if (! $this->productRepository->exists($productId)) {
            throw new \InvalidArgumentException("Product with ID {$productId} not found");
        }

        $date = $date ?? new \DateTime();
        $rate = $this->rateRepository->getCurrentRate($productId, $date, $unit);

        if ($rate === null) {
            throw new \InvalidArgumentException("No active rate found for product {$productId} with unit {$unit}");
        }

        return $rate;
    }
}
