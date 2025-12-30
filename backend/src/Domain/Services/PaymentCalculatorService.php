<?php

declare(strict_types=1);

namespace Domain\Services;

use Domain\Entities\Collection;
use Domain\Entities\Payment;
use Domain\ValueObjects\Money;
use Domain\Repositories\CollectionRepositoryInterface;
use Domain\Repositories\PaymentRepositoryInterface;
use DateTimeImmutable;

/**
 * Payment Calculator Service
 * 
 * Domain service for calculating payment amounts and balances.
 */
class PaymentCalculatorService
{
    public function __construct(
        private CollectionRepositoryInterface $collectionRepository,
        private PaymentRepositoryInterface $paymentRepository
    ) {
    }

    /**
     * Calculate total amount from collections for a supplier
     */
    public function calculateTotalCollectionAmount(
        string $supplierId,
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate
    ): Money {
        $collections = $this->collectionRepository->findByDateRange(
            $startDate,
            $endDate,
            $supplierId
        );

        if (empty($collections)) {
            return Money::zero();
        }

        $total = Money::zero($collections[0]->totalAmount()->currency());

        foreach ($collections as $collection) {
            $total = $total->add($collection->totalAmount());
        }

        return $total;
    }

    /**
     * Calculate total payments made to a supplier
     */
    public function calculateTotalPayments(
        string $supplierId,
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate
    ): Money {
        $payments = $this->paymentRepository->findByDateRange(
            $startDate,
            $endDate,
            $supplierId
        );

        if (empty($payments)) {
            return Money::zero();
        }

        $total = Money::zero($payments[0]->amount()->currency());

        foreach ($payments as $payment) {
            $total = $total->add($payment->amount());
        }

        return $total;
    }

    /**
     * Calculate balance owed to a supplier
     */
    public function calculateBalance(
        string $supplierId,
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate
    ): Money {
        $totalCollection = $this->calculateTotalCollectionAmount($supplierId, $startDate, $endDate);
        $totalPayments = $this->calculateTotalPayments($supplierId, $startDate, $endDate);

        return $totalCollection->subtract($totalPayments);
    }

    /**
     * Check if a supplier's account is settled (balance is zero)
     */
    public function isAccountSettled(
        string $supplierId,
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate
    ): bool {
        $balance = $this->calculateBalance($supplierId, $startDate, $endDate);
        return $balance->isZero();
    }
}
