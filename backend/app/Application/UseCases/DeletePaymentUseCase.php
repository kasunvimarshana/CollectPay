<?php

namespace App\Application\UseCases;

use App\Domain\Repositories\PaymentRepositoryInterface;

/**
 * Delete Payment Use Case
 * 
 * Handles the business logic for deleting a payment.
 */
class DeletePaymentUseCase
{
    public function __construct(
        private PaymentRepositoryInterface $paymentRepository
    ) {
    }

    /**
     * Execute the use case
     * 
     * @param int $id
     * @return bool
     */
    public function execute(int $id): bool
    {
        return $this->paymentRepository->delete($id);
    }
}
