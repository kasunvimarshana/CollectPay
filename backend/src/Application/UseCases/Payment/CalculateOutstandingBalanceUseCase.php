<?php

declare(strict_types=1);

namespace Application\UseCases\Payment;

use Domain\Repositories\CollectionRepositoryInterface;
use Domain\Repositories\PaymentRepositoryInterface;
use Domain\Services\PaymentCalculatorService;
use Domain\ValueObjects\Money;

/**
 * Use Case: Calculate outstanding balance for a supplier
 * 
 * This use case calculates the outstanding balance for a supplier
 * by subtracting total payments from total collections.
 */
final class CalculateOutstandingBalanceUseCase
{
    public function __construct(
        private readonly CollectionRepositoryInterface $collectionRepository,
        private readonly PaymentRepositoryInterface $paymentRepository,
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
        // Get all collections and payments for the supplier within date range
        $collections = $this->collectionRepository->findBySupplierId(
            $supplierId,
            $startDate,
            $endDate
        );

        $payments = $this->paymentRepository->findBySupplierId(
            $supplierId,
            $startDate,
            $endDate
        );

        // Calculate balance using domain service
        return $this->paymentCalculator->calculateBalance($collections, $payments);
    }
}
