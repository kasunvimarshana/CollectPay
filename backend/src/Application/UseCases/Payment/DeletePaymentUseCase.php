<?php

declare(strict_types=1);

namespace Application\UseCases\Payment;

use Domain\Repositories\PaymentRepositoryInterface;

/**
 * Use Case: Delete a payment
 */
final class DeletePaymentUseCase
{
    public function __construct(
        private readonly PaymentRepositoryInterface $paymentRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param string $paymentId
     * @return bool
     * @throws \InvalidArgumentException
     */
    public function execute(string $paymentId): bool
    {
        $payment = $this->paymentRepository->findById($paymentId);
        
        if (!$payment) {
            throw new \InvalidArgumentException("Payment with ID {$paymentId} not found");
        }

        return $this->paymentRepository->delete($paymentId);
    }
}
