<?php

declare(strict_types=1);

namespace Application\UseCases\Product;

use Domain\Entities\Product;
use Domain\Repositories\ProductRepositoryInterface;
use Domain\ValueObjects\Money;
use Domain\ValueObjects\Rate;

/**
 * Use Case: Add a rate to a product
 * 
 * This use case handles adding versioned rates to products.
 * It supports historical rate tracking for auditing purposes.
 */
final class AddProductRateUseCase
{
    public function __construct(
        private readonly ProductRepositoryInterface $productRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param string $productId
     * @param float $amount
     * @param string $currency
     * @param \DateTimeImmutable|null $effectiveDate
     * @return Product
     * @throws \InvalidArgumentException
     */
    public function execute(
        string $productId,
        float $amount,
        string $currency = 'USD',
        ?\DateTimeImmutable $effectiveDate = null
    ): Product {
        // Find existing product
        $product = $this->productRepository->findById($productId);
        
        if (!$product) {
            throw new \InvalidArgumentException("Product with ID {$productId} not found");
        }

        // Create rate value object
        $money = new Money($amount, $currency);
        $rate = new Rate($money, $effectiveDate ?? new \DateTimeImmutable());

        // Add rate to product
        $product->addRate($rate);

        // Persist changes
        return $this->productRepository->save($product);
    }
}
