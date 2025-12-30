<?php

namespace App\Application\UseCases\Payment;

use App\Domain\Repositories\CollectionRepositoryInterface;
use App\Domain\Repositories\PaymentRepositoryInterface;

/**
 * Calculate Payment Balance Use Case
 * 
 * Calculates the payment balance for a supplier.
 * Balance = Total Collections Value - Total Payments
 */
class CalculatePaymentBalanceUseCase
{
    public function __construct(
        private readonly CollectionRepositoryInterface $collectionRepository,
        private readonly PaymentRepositoryInterface $paymentRepository
    ) {}

    public function execute(int $supplierId): array
    {
        $totalCollections = $this->collectionRepository
            ->getTotalCollectionValueBySupplier($supplierId);

        $totalPayments = $this->paymentRepository
            ->getTotalPaymentsBySupplier($supplierId);

        $balance = $totalCollections - $totalPayments;

        return [
            'supplier_id' => $supplierId,
            'total_collections' => round($totalCollections, 2),
            'total_payments' => round($totalPayments, 2),
            'balance' => round($balance, 2),
            'status' => $balance > 0 ? 'due' : ($balance < 0 ? 'overpaid' : 'settled')
        ];
    }
}
