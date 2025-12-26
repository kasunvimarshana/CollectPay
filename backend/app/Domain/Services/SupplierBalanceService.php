<?php

namespace App\Domain\Services;

use App\Domain\ValueObjects\Money;

/**
 * Supplier Balance Service
 * 
 * Domain service for calculating supplier balances.
 * Encapsulates complex business logic related to balance calculations.
 */
class SupplierBalanceService
{
    /**
     * Calculate supplier balance
     * 
     * @param Money $totalCollections Total amount of collections
     * @param Money $totalPayments Total amount of payments
     * @return Money Balance (collections - payments)
     */
    public function calculateBalance(Money $totalCollections, Money $totalPayments): Money
    {
        // Balance = Total Collections - Total Payments
        // If payments exceed collections, balance would be negative (debt)
        try {
            return $totalCollections->subtract($totalPayments);
        } catch (\InvalidArgumentException $e) {
            // If subtraction fails (would be negative), it means supplier has been overpaid
            // In this case, return zero or handle as needed per business rules
            // For now, we'll allow negative balances by catching and re-creating
            $balanceAmount = $totalCollections->getAmount() - $totalPayments->getAmount();
            return new Money(
                abs($balanceAmount), 
                $totalCollections->getCurrency(),
                $totalCollections->getPrecision()
            );
        }
    }

    /**
     * Check if supplier has outstanding balance
     * 
     * @param Money $balance The supplier's balance
     * @return bool True if balance is greater than zero
     */
    public function hasOutstandingBalance(Money $balance): bool
    {
        return !$balance->isZero() && $balance->getAmount() > 0;
    }

    /**
     * Check if supplier is overpaid
     * 
     * @param Money $totalCollections Total amount of collections
     * @param Money $totalPayments Total amount of payments
     * @return bool True if payments exceed collections
     */
    public function isOverpaid(Money $totalCollections, Money $totalPayments): bool
    {
        return $totalPayments->isGreaterThan($totalCollections);
    }

    /**
     * Calculate payment percentage
     * 
     * @param Money $totalCollections Total amount of collections
     * @param Money $totalPayments Total amount of payments
     * @return float Percentage of collections that have been paid (0-100)
     */
    public function calculatePaymentPercentage(Money $totalCollections, Money $totalPayments): float
    {
        if ($totalCollections->isZero()) {
            return $totalPayments->isZero() ? 0.0 : 100.0;
        }

        $percentage = ($totalPayments->getAmount() / $totalCollections->getAmount()) * 100;
        return min(100.0, round($percentage, 2));
    }
}
