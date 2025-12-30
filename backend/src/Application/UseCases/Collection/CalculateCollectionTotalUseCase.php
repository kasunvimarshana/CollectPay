<?php

declare(strict_types=1);

namespace Application\UseCases\Collection;

use Domain\Repositories\CollectionRepositoryInterface;
use Domain\Services\PaymentCalculatorService;
use Domain\ValueObjects\Money;

/**
 * Use Case: Calculate total collection amount for a supplier
 * 
 * This use case calculates the total amount collected from a supplier
 * based on all collection records within a date range.
 */
final class CalculateCollectionTotalUseCase
{
    public function __construct(
        private readonly CollectionRepositoryInterface $collectionRepository,
        private readonly PaymentCalculatorService $paymentCalculator
    ) {
    }

    /**
     * Execute the use case
     *
     * @param string $supplierId
     * @param \DateTimeImmutable|null $startDate
     * @param \DateTimeImmutable|null $endDate
     * @return Money
     */
    public function execute(
        string $supplierId,
        ?\DateTimeImmutable $startDate = null,
        ?\DateTimeImmutable $endDate = null
    ): Money {
        // Get all collections for the supplier within date range
        $collections = $this->collectionRepository->findBySupplierId(
            $supplierId,
            $startDate,
            $endDate
        );

        // Calculate total using domain service
        return $this->paymentCalculator->calculateTotalCollections($collections);
    }
}
