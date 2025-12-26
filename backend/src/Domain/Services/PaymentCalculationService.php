<?php

namespace App\Domain\Services;

use App\Domain\Repositories\CollectionRepositoryInterface;
use App\Domain\Repositories\PaymentRepositoryInterface;

/**
 * Payment Calculation Service
 * 
 * Handles automated payment calculations based on collections and payment history.
 * Core business logic for financial oversight.
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
     * Calculate the total amount owed to a supplier
     * 
     * @param int $supplierId
     * @param \DateTimeInterface|null $upToDate Calculate up to this date
     * @return array ['total_collected', 'total_paid', 'balance']
     */
    public function calculateSupplierBalance(int $supplierId, ?\DateTimeInterface $upToDate = null): array
    {
        $totalCollected = $this->collectionRepository->getTotalAmountForSupplier($supplierId, $upToDate);
        $totalPaid = $this->paymentRepository->getTotalPaidForSupplier($supplierId, $upToDate);
        $balance = $totalCollected - $totalPaid;

        return [
            'supplier_id' => $supplierId,
            'total_collected' => round($totalCollected, 2),
            'total_paid' => round($totalPaid, 2),
            'balance' => round($balance, 2),
            'calculated_at' => $upToDate ? $upToDate->format('Y-m-d H:i:s') : (new \DateTime())->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Calculate balances for multiple suppliers
     */
    public function calculateMultipleSupplierBalances(array $supplierIds, ?\DateTimeInterface $upToDate = null): array
    {
        $balances = [];
        
        foreach ($supplierIds as $supplierId) {
            $balances[] = $this->calculateSupplierBalance($supplierId, $upToDate);
        }

        return $balances;
    }

    /**
     * Validate if a payment amount is within acceptable limits
     */
    public function validatePaymentAmount(int $supplierId, float $paymentAmount): array
    {
        $balance = $this->calculateSupplierBalance($supplierId);
        
        $isValid = $paymentAmount <= $balance['balance'];
        $remainingBalance = $balance['balance'] - $paymentAmount;

        return [
            'is_valid' => $isValid,
            'payment_amount' => $paymentAmount,
            'current_balance' => $balance['balance'],
            'remaining_balance' => $remainingBalance,
            'message' => $isValid 
                ? 'Payment amount is valid' 
                : 'Payment amount exceeds current balance'
        ];
    }
}
