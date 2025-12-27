<?php

declare(strict_types=1);

namespace TrackVault\Domain\Services;

use TrackVault\Domain\ValueObjects\Money;

/**
 * Payment Calculation Service
 * 
 * Handles automated payment calculations based on collections and prior payments
 */
final class PaymentCalculationService
{
    /**
     * Calculate total amount owed to a supplier based on collections
     *
     * @param array $collections Array of Collection entities
     * @return Money
     */
    public function calculateTotalOwed(array $collections): Money
    {
        if (empty($collections)) {
            return new Money(0.0);
        }

        $total = new Money(0.0);
        
        foreach ($collections as $collection) {
            $total = $total->add($collection->getTotalAmount());
        }

        return $total;
    }

    /**
     * Calculate total paid to a supplier based on payment records
     *
     * @param array $payments Array of Payment entities
     * @return Money
     */
    public function calculateTotalPaid(array $payments): Money
    {
        if (empty($payments)) {
            return new Money(0.0);
        }

        $total = new Money(0.0);
        
        foreach ($payments as $payment) {
            if (!$payment->isDeleted()) {
                $total = $total->add($payment->getAmount());
            }
        }

        return $total;
    }

    /**
     * Calculate remaining balance for a supplier
     *
     * @param Money $totalOwed
     * @param Money $totalPaid
     * @return Money
     */
    public function calculateBalance(Money $totalOwed, Money $totalPaid): Money
    {
        return $totalOwed->subtract($totalPaid);
    }

    /**
     * Calculate net amount (total owed minus total paid)
     *
     * @param array $collections
     * @param array $payments
     * @return Money
     */
    public function calculateNetAmount(array $collections, array $payments): Money
    {
        $totalOwed = $this->calculateTotalOwed($collections);
        $totalPaid = $this->calculateTotalPaid($payments);
        return $this->calculateBalance($totalOwed, $totalPaid);
    }
}
