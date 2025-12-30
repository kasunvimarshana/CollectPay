<?php

namespace App\Application\UseCases\Payment;

use App\Domain\Repositories\CollectionRepositoryInterface;
use App\Domain\Repositories\PaymentRepositoryInterface;

/**
 * Calculate Balance Use Case
 *
 * Calculates the outstanding balance for a supplier by comparing
 * total collections amount with total payments.
 */
class CalculateBalanceUseCase
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
     * Execute the use case
     *
     * @return array ['total_collections' => float, 'total_payments' => float, 'outstanding_balance' => float]
     */
    public function execute(
        int $supplierId,
        ?\DateTimeInterface $fromDate = null,
        ?\DateTimeInterface $toDate = null
    ): array {
        $totalCollections = $this->collectionRepository->getTotalAmountBySupplier(
            $supplierId,
            $fromDate,
            $toDate
        );

        $totalPayments = $this->paymentRepository->getTotalAmountBySupplier(
            $supplierId,
            $fromDate,
            $toDate
        );

        $outstandingBalance = $totalCollections - $totalPayments;

        return [
            'total_collections' => round($totalCollections, 4),
            'total_payments' => round($totalPayments, 4),
            'outstanding_balance' => round($outstandingBalance, 4),
        ];
    }
}
