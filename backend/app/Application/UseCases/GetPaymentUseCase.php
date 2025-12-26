<?php

namespace App\Application\UseCases;

use App\Domain\Entities\PaymentEntity;
use App\Domain\Repositories\PaymentRepositoryInterface;
use App\Domain\Exceptions\EntityNotFoundException;

/**
 * Get Payment Use Case
 * 
 * Handles the business logic for retrieving a single payment by ID.
 */
class GetPaymentUseCase
{
    public function __construct(
        private PaymentRepositoryInterface $paymentRepository
    ) {
    }

    /**
     * Execute the use case
     * 
     * @param int $id
     * @return PaymentEntity
     * @throws EntityNotFoundException
     */
    public function execute(int $id): PaymentEntity
    {
        $payment = $this->paymentRepository->findById($id);

        if (!$payment) {
            throw new EntityNotFoundException("Payment not found with ID: {$id}");
        }

        return $payment;
    }
}
