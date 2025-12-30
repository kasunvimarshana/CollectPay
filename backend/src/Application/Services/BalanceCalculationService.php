<?php

namespace LedgerFlow\Application\Services;

use LedgerFlow\Domain\Repositories\CollectionRepositoryInterface;
use LedgerFlow\Domain\Repositories\PaymentRepositoryInterface;

class BalanceCalculationService
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
     * Calculate the balance for a specific supplier
     * Balance = Total Collections - Total Payments
     */
    public function calculateSupplierBalance(string $supplierId): array
    {
        // Get all collections for supplier
        $collections = $this->collectionRepository->findBySupplierId($supplierId);
        
        // Calculate total collections
        $totalCollections = 0.0;
        $collectionCount = 0;
        foreach ($collections as $collection) {
            $totalCollections += $collection->getTotalAmount();
            $collectionCount++;
        }

        // Get all payments for supplier
        $payments = $this->paymentRepository->findBySupplierId($supplierId);
        
        // Calculate total payments
        $totalPayments = 0.0;
        $paymentCount = 0;
        foreach ($payments as $payment) {
            $totalPayments += $payment->getAmount();
            $paymentCount++;
        }

        // Calculate balance
        $balance = $totalCollections - $totalPayments;

        return [
            'supplier_id' => $supplierId,
            'total_collections' => $totalCollections,
            'collection_count' => $collectionCount,
            'total_payments' => $totalPayments,
            'payment_count' => $paymentCount,
            'balance' => $balance,
            'status' => $balance > 0 ? 'payable' : ($balance < 0 ? 'overpaid' : 'settled')
        ];
    }

    /**
     * Calculate balances for all suppliers
     */
    public function calculateAllBalances(): array
    {
        $collections = $this->collectionRepository->findAll();
        $payments = $this->paymentRepository->findAll();

        $supplierBalances = [];

        // Process collections
        foreach ($collections as $collection) {
            $supplierId = $collection->getSupplierId();
            if (!isset($supplierBalances[$supplierId])) {
                $supplierBalances[$supplierId] = [
                    'total_collections' => 0.0,
                    'total_payments' => 0.0,
                    'collection_count' => 0,
                    'payment_count' => 0
                ];
            }
            $supplierBalances[$supplierId]['total_collections'] += $collection->getTotalAmount();
            $supplierBalances[$supplierId]['collection_count']++;
        }

        // Process payments
        foreach ($payments as $payment) {
            $supplierId = $payment->getSupplierId();
            if (!isset($supplierBalances[$supplierId])) {
                $supplierBalances[$supplierId] = [
                    'total_collections' => 0.0,
                    'total_payments' => 0.0,
                    'collection_count' => 0,
                    'payment_count' => 0
                ];
            }
            $supplierBalances[$supplierId]['total_payments'] += $payment->getAmount();
            $supplierBalances[$supplierId]['payment_count']++;
        }

        // Calculate balances
        $result = [];
        foreach ($supplierBalances as $supplierId => $data) {
            $balance = $data['total_collections'] - $data['total_payments'];
            $result[] = [
                'supplier_id' => $supplierId,
                'total_collections' => $data['total_collections'],
                'collection_count' => $data['collection_count'],
                'total_payments' => $data['total_payments'],
                'payment_count' => $data['payment_count'],
                'balance' => $balance,
                'status' => $balance > 0 ? 'payable' : ($balance < 0 ? 'overpaid' : 'settled')
            ];
        }

        return $result;
    }
}
