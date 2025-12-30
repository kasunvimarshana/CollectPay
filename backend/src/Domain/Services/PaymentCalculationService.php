<?php

namespace App\Domain\Services;

use App\Domain\Entities\Collection;
use App\Domain\Entities\Payment;
use App\Domain\ValueObjects\Money;

/**
 * Payment Calculation Service
 * 
 * Domain service for payment-related calculations.
 */
class PaymentCalculationService
{
    /**
     * Calculate total collection value
     * 
     * @param Collection[] $collections
     */
    public function calculateTotalCollections(array $collections, string $currency = 'USD'): Money
    {
        $total = Money::from(0, $currency);

        foreach ($collections as $collection) {
            $collectionMoney = Money::from($collection->getTotalValue(), $currency);
            $total = $total->add($collectionMoney);
        }

        return $total;
    }

    /**
     * Calculate total payments
     * 
     * @param Payment[] $payments
     */
    public function calculateTotalPayments(array $payments, string $currency = 'USD'): Money
    {
        $total = Money::from(0, $currency);

        foreach ($payments as $payment) {
            $paymentMoney = Money::from($payment->getAmount(), $currency);
            $total = $total->add($paymentMoney);
        }

        return $total;
    }

    /**
     * Calculate balance (collections - payments)
     * 
     * @param Collection[] $collections
     * @param Payment[] $payments
     */
    public function calculateBalance(
        array $collections,
        array $payments,
        string $currency = 'USD'
    ): Money {
        $totalCollections = $this->calculateTotalCollections($collections, $currency);
        $totalPayments = $this->calculateTotalPayments($payments, $currency);

        return $totalCollections->subtract($totalPayments);
    }

    /**
     * Determine payment status
     */
    public function determinePaymentStatus(Money $balance): string
    {
        $zero = Money::from(0, $balance->currency());

        if ($balance->equals($zero)) {
            return 'settled';
        } elseif ($balance->isGreaterThan($zero)) {
            return 'due';
        } else {
            return 'overpaid';
        }
    }
}
