<?php

declare(strict_types=1);

namespace Application\UseCases\Payment;

use Domain\Repositories\CollectionRepositoryInterface;
use Domain\Repositories\PaymentRepositoryInterface;
use Domain\Services\PaymentCalculationService;

/**
 * Calculate Supplier Balance Use Case
 * Calculates the outstanding balance for a supplier
 */
final class CalculateSupplierBalanceUseCase
{
    public function __construct(
        private readonly CollectionRepositoryInterface $collectionRepository,
        private readonly PaymentRepositoryInterface $paymentRepository,
        private readonly PaymentCalculationService $paymentCalculationService
    ) {}

    public function execute(string $supplierId): array
    {
        // Get all collections for supplier
        $collections = $this->collectionRepository->findBySupplierId($supplierId, 1, 10000);
        
        // Get all payments for supplier
        $payments = $this->paymentRepository->findBySupplierId($supplierId, 1, 10000);

        // Calculate totals
        $totalCollections = $this->paymentCalculationService->calculateTotalFromCollections($collections);
        $totalPayments = $this->paymentCalculationService->calculateTotalPayments($payments);
        $balance = $this->paymentCalculationService->calculateBalanceOwed($collections, $payments);

        return [
            'supplier_id' => $supplierId,
            'total_collections' => $totalCollections->toArray(),
            'total_payments' => $totalPayments->toArray(),
            'balance_owed' => $balance->toArray(),
            'has_outstanding_balance' => $this->paymentCalculationService->hasOutstandingBalance($collections, $payments),
        ];
    }
}
