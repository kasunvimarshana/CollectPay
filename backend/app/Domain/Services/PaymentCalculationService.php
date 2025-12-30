<?php

namespace App\Domain\Services;

use App\Domain\Entities\Collection;
use App\Domain\Entities\Payment;
use App\Domain\ValueObjects\Money;
use App\Domain\Repositories\CollectionRepositoryInterface;
use App\Domain\Repositories\PaymentRepositoryInterface;
use DateTime;

/**
 * Payment Calculation Service
 * 
 * Domain service responsible for calculating payment totals, balances,
 * and automating payment calculations based on collections and rates.
 */
class PaymentCalculationService
{
    private CollectionRepositoryInterface $collectionRepository;
    private PaymentRepositoryInterface $paymentRepository;

    public function __construct(
        CollectionRepositoryInterface $collectionRepository,
        PaymentRepositoryInterface $paymentRepository
    ) {
        $this->collectionRepository = $collectionRepository;
        $this->paymentRepository = $paymentRepository;
    }

    /**
     * Calculate total amount owed to a supplier based on collections
     */
    public function calculateTotalOwed(int $supplierId, ?DateTime $upToDate = null): Money
    {
        $filters = ['supplier_id' => $supplierId];
        
        if ($upToDate !== null) {
            $filters['up_to_date'] = $upToDate;
        }

        $collections = $this->collectionRepository->findBySupplierId($supplierId, $filters);
        
        $totalOwed = Money::zero('USD');
        
        foreach ($collections as $collection) {
            if ($collection->getTotalAmount() !== null) {
                $totalOwed = $totalOwed->add($collection->getTotalAmount());
            }
        }

        return $totalOwed;
    }

    /**
     * Calculate total amount already paid to a supplier
     */
    public function calculateTotalPaid(int $supplierId, ?DateTime $upToDate = null): Money
    {
        return $this->paymentRepository->getTotalPaidForSupplier($supplierId, $upToDate);
    }

    /**
     * Calculate outstanding balance for a supplier
     */
    public function calculateOutstandingBalance(int $supplierId, ?DateTime $upToDate = null): Money
    {
        $totalOwed = $this->calculateTotalOwed($supplierId, $upToDate);
        $totalPaid = $this->calculateTotalPaid($supplierId, $upToDate);

        // If paid more than owed, return zero (or handle advance payments separately)
        if ($totalPaid->greaterThan($totalOwed)) {
            return Money::zero($totalOwed->getCurrency());
        }

        return $totalOwed->subtract($totalPaid);
    }

    /**
     * Get detailed payment summary for a supplier
     */
    public function getPaymentSummary(int $supplierId, ?DateTime $upToDate = null): array
    {
        $totalOwed = $this->calculateTotalOwed($supplierId, $upToDate);
        $totalPaid = $this->calculateTotalPaid($supplierId, $upToDate);
        $outstanding = $this->calculateOutstandingBalance($supplierId, $upToDate);

        // Check for advance payments
        $advancePayments = Money::zero($totalOwed->getCurrency());
        if ($totalPaid->greaterThan($totalOwed)) {
            $advancePayments = $totalPaid->subtract($totalOwed);
        }

        return [
            'supplier_id' => $supplierId,
            'total_owed' => $totalOwed->toArray(),
            'total_paid' => $totalPaid->toArray(),
            'outstanding_balance' => $outstanding->toArray(),
            'advance_payments' => $advancePayments->toArray(),
            'calculated_at' => (new DateTime())->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Validate payment amount against outstanding balance
     */
    public function validatePaymentAmount(int $supplierId, Money $paymentAmount, string $paymentType): array
    {
        $outstanding = $this->calculateOutstandingBalance($supplierId);
        $errors = [];

        if ($paymentType === 'full') {
            if (!$paymentAmount->equals($outstanding)) {
                $errors[] = "Full payment amount must equal outstanding balance of {$outstanding->toString()}";
            }
        } elseif ($paymentType === 'partial') {
            if ($paymentAmount->greaterThan($outstanding)) {
                $errors[] = "Partial payment cannot exceed outstanding balance of {$outstanding->toString()}";
            }
            if ($paymentAmount->isZero()) {
                $errors[] = "Partial payment amount must be greater than zero";
            }
        }
        // 'advance' type has no validation against outstanding balance

        return [
            'is_valid' => empty($errors),
            'errors' => $errors,
            'outstanding_balance' => $outstanding->toArray(),
        ];
    }

    /**
     * Get collections without calculated amounts (need rate assignment)
     */
    public function getCollectionsNeedingCalculation(int $supplierId): array
    {
        $collections = $this->collectionRepository->findBySupplierId($supplierId);
        
        return array_filter($collections, function (Collection $collection) {
            return $collection->getTotalAmount() === null || $collection->getRateId() === null;
        });
    }
}
