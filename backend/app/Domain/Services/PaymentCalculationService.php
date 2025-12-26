<?php

namespace App\Domain\Services;

use App\Domain\Entities\Payment;
use App\Domain\Repositories\CollectionRepositoryInterface;
use App\Domain\Repositories\PaymentRepositoryInterface;

/**
 * Payment Calculation Service
 * 
 * Domain service responsible for calculating payments based on
 * collections, rates, and prior payments. This implements the
 * complex business logic for automated, auditable payment calculations.
 * 
 * Following Single Responsibility Principle and Domain-Driven Design.
 */
class PaymentCalculationService
{
    public function __construct(
        private readonly CollectionRepositoryInterface $collectionRepository,
        private readonly PaymentRepositoryInterface $paymentRepository
    ) {}

    /**
     * Calculate the total amount owed to a supplier
     * 
     * @param int $supplierId
     * @param \DateTimeInterface|null $fromDate Optional start date for calculation
     * @param \DateTimeInterface|null $toDate Optional end date for calculation
     * @return array ['total_collections' => float, 'total_paid' => float, 'balance' => float]
     */
    public function calculateSupplierBalance(
        int $supplierId,
        ?\DateTimeInterface $fromDate = null,
        ?\DateTimeInterface $toDate = null
    ): array {
        // Get total collection amount for supplier
        $totalCollections = $this->collectionRepository->getTotalAmountBySupplier($supplierId);
        
        // Get total payments made to supplier
        $totalPaid = $this->paymentRepository->getTotalPaidToSupplier($supplierId);
        
        // Calculate balance (what is still owed)
        $balance = round($totalCollections - $totalPaid, 2);
        
        return [
            'total_collections' => $totalCollections,
            'total_paid' => $totalPaid,
            'balance' => $balance,
            'is_fully_paid' => abs($balance) < 0.01, // Consider fully paid if difference is less than 1 cent
        ];
    }

    /**
     * Calculate advance payment status for a supplier
     */
    public function calculateAdvanceBalance(int $supplierId): array
    {
        $advancePayments = $this->paymentRepository->getAdvancePayments($supplierId);
        $totalAdvance = array_reduce($advancePayments, fn($sum, $payment) => $sum + $payment->getAmount(), 0);
        
        $balance = $this->calculateSupplierBalance($supplierId);
        $advanceUtilized = min($totalAdvance, $balance['total_collections']);
        $advanceRemaining = max(0, $totalAdvance - $advanceUtilized);
        
        return [
            'total_advance' => $totalAdvance,
            'advance_utilized' => $advanceUtilized,
            'advance_remaining' => $advanceRemaining,
        ];
    }

    /**
     * Calculate detailed payment breakdown for a supplier
     */
    public function getDetailedPaymentBreakdown(int $supplierId): array
    {
        $collections = $this->collectionRepository->findBySupplier($supplierId);
        $payments = $this->paymentRepository->findBySupplier($supplierId);
        
        $breakdown = [
            'collections' => [],
            'payments' => [],
            'summary' => [],
        ];
        
        // Collections breakdown by product
        $collectionsByProduct = [];
        foreach ($collections as $collection) {
            $productId = $collection->getProductId();
            if (!isset($collectionsByProduct[$productId])) {
                $collectionsByProduct[$productId] = [
                    'product_id' => $productId,
                    'total_quantity' => 0,
                    'total_amount' => 0,
                    'collections_count' => 0,
                ];
            }
            $collectionsByProduct[$productId]['total_quantity'] += $collection->getQuantity();
            $collectionsByProduct[$productId]['total_amount'] += $collection->getTotalAmount();
            $collectionsByProduct[$productId]['collections_count']++;
        }
        $breakdown['collections'] = array_values($collectionsByProduct);
        
        // Payments breakdown by type
        $paymentsByType = [
            Payment::TYPE_ADVANCE => 0,
            Payment::TYPE_PARTIAL => 0,
            Payment::TYPE_FINAL => 0,
        ];
        foreach ($payments as $payment) {
            $paymentsByType[$payment->getPaymentType()] += $payment->getAmount();
        }
        $breakdown['payments'] = $paymentsByType;
        
        // Summary
        $breakdown['summary'] = $this->calculateSupplierBalance($supplierId);
        
        return $breakdown;
    }

    /**
     * Validate if a new payment amount is acceptable
     */
    public function validatePaymentAmount(int $supplierId, float $paymentAmount, string $paymentType): array
    {
        $errors = [];
        $balance = $this->calculateSupplierBalance($supplierId);
        
        if ($paymentAmount <= 0) {
            $errors[] = 'Payment amount must be positive';
            return ['valid' => false, 'errors' => $errors];
        }
        
        // For final payments, check if amount exceeds balance
        if ($paymentType === Payment::TYPE_FINAL) {
            if ($paymentAmount > $balance['balance']) {
                $errors[] = sprintf(
                    'Final payment amount (%.2f) exceeds outstanding balance (%.2f)',
                    $paymentAmount,
                    $balance['balance']
                );
            }
        }
        
        // For partial payments, warn if it exceeds balance
        if ($paymentType === Payment::TYPE_PARTIAL) {
            if ($paymentAmount > $balance['balance']) {
                $errors[] = sprintf(
                    'Warning: Partial payment amount (%.2f) exceeds outstanding balance (%.2f)',
                    $paymentAmount,
                    $balance['balance']
                );
            }
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'balance' => $balance,
        ];
    }

    /**
     * Calculate recommended payment amount
     */
    public function calculateRecommendedPayment(int $supplierId): array
    {
        $balance = $this->calculateSupplierBalance($supplierId);
        $advanceBalance = $this->calculateAdvanceBalance($supplierId);
        
        $recommendedAmount = max(0, $balance['balance']);
        
        return [
            'recommended_amount' => $recommendedAmount,
            'current_balance' => $balance['balance'],
            'advance_available' => $advanceBalance['advance_remaining'],
            'is_fully_paid' => $balance['is_fully_paid'],
        ];
    }
}
