<?php

declare(strict_types=1);

namespace Application\UseCases\Payment;

use Domain\Repositories\PaymentRepositoryInterface;
use Domain\Services\PaymentCalculatorService;
use Domain\ValueObjects\Money;

/**
 * Use Case: Calculate total payments for a supplier
 * 
 * This use case calculates the total amount paid to a supplier
 * based on all payment records within a date range.
 */
final class CalculatePaymentTotalUseCase
{
    public function __construct(
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
        // Get all payments for the supplier within date range
        $payments = $this->paymentRepository->findBySupplierId(
            $supplierId,
            $startDate,
            $endDate
        );

        // Calculate total using domain service
        return $this->paymentCalculator->calculateTotalPayments($payments);
    }
}
