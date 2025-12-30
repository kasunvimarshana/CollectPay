<?php

declare(strict_types=1);

namespace Domain\Services;

use Domain\Entities\Collection;
use Domain\Entities\Payment;
use Domain\ValueObjects\Money;

/**
 * Payment Calculation Service
 * 
 * Domain service for calculating payment totals based on collections and payments
 */
final class PaymentCalculationService
{
    /**
     * Calculate total amount owed based on collections
     * 
     * @param Collection[] $collections
     * @return Money
     */
    public function calculateTotalFromCollections(array $collections): Money
    {
        if (empty($collections)) {
            return new Money(0.0, 'LKR');
        }

        $total = null;
        foreach ($collections as $collection) {
            if ($total === null) {
                $total = $collection->totalAmount();
            } else {
                $total = $total->add($collection->totalAmount());
            }
        }

        return $total ?? new Money(0.0, 'LKR');
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
            return new Money(0.0, 'LKR');
        }

        $total = null;
        foreach ($payments as $payment) {
            if ($total === null) {
                $total = $payment->amount();
            } else {
                $total = $total->add($payment->amount());
            }
        }

        return $total ?? new Money(0.0, 'LKR');
    }

    /**
     * Calculate balance (amount owed - payments made)
     * 
     * @param Collection[] $collections
     * @param Payment[] $payments
     * @return Money
     */
    public function calculateBalance(array $collections, array $payments): Money
    {
        $totalOwed = $this->calculateTotalFromCollections($collections);
        $totalPaid = $this->calculateTotalPayments($payments);

        return $totalOwed->subtract($totalPaid);
    }

    /**
     * Check if supplier account is settled
     * 
     * @param Collection[] $collections
     * @param Payment[] $payments
     * @return bool
     */
    public function isSettled(array $collections, array $payments): bool
    {
        $balance = $this->calculateBalance($collections, $payments);
        return $balance->amount() <= 0.01; // Allow for minor rounding differences
    }
}
