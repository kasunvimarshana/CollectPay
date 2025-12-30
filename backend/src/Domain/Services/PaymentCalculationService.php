<?php

declare(strict_types=1);

namespace Domain\Services;

use Domain\ValueObjects\Money;
use Domain\Entities\Collection;
use Domain\Entities\Payment;

/**
 * Payment Calculation Service
 * Handles business logic for payment calculations
 */
final class PaymentCalculationService
{
    /**
     * Calculate total amount from collections
     *
     * @param Collection[] $collections
     * @return Money
     */
    public function calculateTotalFromCollections(array $collections): Money
    {
        if (empty($collections)) {
            return Money::zero();
        }

        $total = Money::zero($collections[0]->getTotalAmount()->getCurrency());

        foreach ($collections as $collection) {
            $total = $total->add($collection->getTotalAmount());
        }

        return $total;
    }

    /**
     * Calculate total payments made
     *
     * @param Payment[] $payments
     * @return Money
     */
    public function calculateTotalPayments(array $payments): Money
    {
        if (empty($payments)) {
            return Money::zero();
        }

        $total = Money::zero($payments[0]->getAmount()->getCurrency());

        foreach ($payments as $payment) {
            if (!$payment->isDeleted()) {
                $total = $total->add($payment->getAmount());
            }
        }

        return $total;
    }

    /**
     * Calculate balance owed (collections minus payments)
     *
     * @param Collection[] $collections
     * @param Payment[] $payments
     * @return Money
     */
    public function calculateBalanceOwed(array $collections, array $payments): Money
    {
        $totalCollections = $this->calculateTotalFromCollections($collections);
        $totalPayments = $this->calculateTotalPayments($payments);

        return $totalCollections->subtract($totalPayments);
    }

    /**
     * Determine if supplier has outstanding balance
     */
    public function hasOutstandingBalance(array $collections, array $payments): bool
    {
        $balance = $this->calculateBalanceOwed($collections, $payments);
        return $balance->getAmount() > 0.01; // Account for floating point precision
    }
}
