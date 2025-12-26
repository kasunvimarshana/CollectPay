<?php

namespace App\Domain\Services;

use App\Domain\Repositories\CollectionRepositoryInterface;
use App\Domain\Repositories\PaymentRepositoryInterface;
use DateTimeImmutable;

/**
 * Payment Calculation Service
 * Calculates total amount due to a supplier based on collections and prior payments
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
     * Calculate the total amount due for a supplier
     *
     * @param string $supplierId
     * @param DateTimeImmutable|null $startDate
     * @param DateTimeImmutable|null $endDate
     * @return array{
     *     total_collections_value: float,
     *     total_payments: float,
     *     balance_due: float,
     *     collections_count: int,
     *     payments_count: int,
     *     collections: array,
     *     payments: array
     * }
     */
    public function calculateBalanceForSupplier(
        string $supplierId,
        ?DateTimeImmutable $startDate = null,
        ?DateTimeImmutable $endDate = null
    ): array {
        // Get all collections for the supplier in the date range
        $collections = $startDate && $endDate
            ? $this->collectionRepository->findBySupplierAndDateRange($supplierId, $startDate, $endDate)
            : $this->collectionRepository->findBySupplierId($supplierId);

        // Calculate total value of collections
        $totalCollectionsValue = 0;
        $collectionDetails = [];
        
        foreach ($collections as $collection) {
            $value = $collection->calculateValue();
            $totalCollectionsValue += $value;
            
            $collectionDetails[] = [
                'id' => $collection->getId(),
                'product_id' => $collection->getProductId(),
                'quantity' => $collection->getQuantity(),
                'rate' => $collection->getAppliedRate(),
                'value' => $value,
                'collection_date' => $collection->getCollectionDate()->format('Y-m-d H:i:s'),
            ];
        }

        // Get all payments for the supplier
        $payments = $this->paymentRepository->findBySupplierId($supplierId);
        
        // Calculate total payments
        $totalPayments = 0;
        $paymentDetails = [];
        
        foreach ($payments as $payment) {
            // Only include payments within date range if specified
            if ($startDate && $payment->getPaymentDate() < $startDate) {
                continue;
            }
            if ($endDate && $payment->getPaymentDate() > $endDate) {
                continue;
            }
            
            $totalPayments += $payment->getAmount();
            
            $paymentDetails[] = [
                'id' => $payment->getId(),
                'amount' => $payment->getAmount(),
                'type' => $payment->getType(),
                'payment_date' => $payment->getPaymentDate()->format('Y-m-d H:i:s'),
            ];
        }

        // Calculate balance
        $balanceDue = $totalCollectionsValue - $totalPayments;

        return [
            'total_collections_value' => round($totalCollectionsValue, 2),
            'total_payments' => round($totalPayments, 2),
            'balance_due' => round($balanceDue, 2),
            'collections_count' => count($collectionDetails),
            'payments_count' => count($paymentDetails),
            'collections' => $collectionDetails,
            'payments' => $paymentDetails,
        ];
    }

    /**
     * Calculate balance by product for a supplier
     */
    public function calculateBalanceByProduct(
        string $supplierId,
        string $productId,
        ?DateTimeImmutable $startDate = null,
        ?DateTimeImmutable $endDate = null
    ): array {
        $collections = $startDate && $endDate
            ? $this->collectionRepository->findBySupplierAndDateRange($supplierId, $startDate, $endDate)
            : $this->collectionRepository->findBySupplierId($supplierId);

        // Filter collections by product
        $productCollections = array_filter($collections, function ($collection) use ($productId) {
            return $collection->getProductId() === $productId;
        });

        $totalQuantity = 0;
        $totalValue = 0;

        foreach ($productCollections as $collection) {
            $totalQuantity += $collection->getQuantity();
            $totalValue += $collection->calculateValue();
        }

        return [
            'product_id' => $productId,
            'total_quantity' => round($totalQuantity, 2),
            'total_value' => round($totalValue, 2),
            'collections_count' => count($productCollections),
        ];
    }
}
