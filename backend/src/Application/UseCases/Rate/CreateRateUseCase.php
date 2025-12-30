<?php

declare(strict_types=1);

namespace Application\UseCases\Rate;

use Domain\Entities\Rate;
use Domain\Repositories\RateRepositoryInterface;
use Domain\Repositories\ProductRepositoryInterface;
use Domain\Services\UuidGeneratorInterface;
use Domain\ValueObjects\Money;
use Domain\ValueObjects\Unit;
use Application\DTOs\CreateRateDTO;
use DateTimeImmutable;

/**
 * Create Rate Use Case
 * Handles the business logic for creating a new product rate
 */
final class CreateRateUseCase
{
    public function __construct(
        private readonly RateRepositoryInterface $rateRepository,
        private readonly ProductRepositoryInterface $productRepository,
        private readonly UuidGeneratorInterface $uuidGenerator
    ) {}

    public function execute(CreateRateDTO $dto): Rate
    {
        // Verify product exists
        $product = $this->productRepository->findById($dto->productId);
        if (!$product) {
            throw new \DomainException("Product with ID '{$dto->productId}' not found");
        }

        // Create value objects
        $money = Money::fromFloat($dto->ratePerUnit, $dto->currency);
        $unit = Unit::fromString($dto->unit);
        $effectiveFrom = new DateTimeImmutable($dto->effectiveFrom);

        // Check for overlapping rates
        $existingRate = $this->rateRepository->findEffectiveRateForProduct(
            $dto->productId,
            $effectiveFrom
        );

        if ($existingRate) {
            // Expire the existing rate
            $existingRate->expire($effectiveFrom);
            $this->rateRepository->save($existingRate);
        }

        // Generate UUID for new rate
        $id = $this->uuidGenerator->generate();

        // Create new rate entity
        $rate = Rate::create(
            $id,
            $dto->productId,
            $money,
            $unit,
            $effectiveFrom
        );

        // Persist to repository
        $this->rateRepository->save($rate);

        return $rate;
    }
}
