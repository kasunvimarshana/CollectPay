<?php

declare(strict_types=1);

namespace Application\UseCases\Product;

use Application\DTOs\CreateProductRateDTO;
use Domain\Entities\ProductRate;
use Domain\Repositories\ProductRepositoryInterface;
use Domain\Repositories\ProductRateRepositoryInterface;
use Domain\ValueObjects\UUID;
use Domain\ValueObjects\Money;
use DateTimeImmutable;
use InvalidArgumentException;

final class CreateProductRateUseCase
{
    public function __construct(
        private ProductRepositoryInterface $productRepository,
        private ProductRateRepositoryInterface $rateRepository
    ) {}

    public function execute(CreateProductRateDTO $dto): ProductRate
    {
        $productId = UUID::fromString($dto->productId);
        
        // Verify product exists
        $product = $this->productRepository->findById($productId);
        if (!$product) {
            throw new InvalidArgumentException('Product not found');
        }

        $effectiveFrom = new DateTimeImmutable($dto->effectiveFrom);
        
        // Expire any existing active rates
        $this->rateRepository->expireActiveRates($productId, $effectiveFrom);

        $rate = ProductRate::create(
            $productId,
            new Money($dto->rateAmount, $dto->currency),
            $effectiveFrom
        );

        $this->rateRepository->save($rate);

        return $rate;
    }
}
