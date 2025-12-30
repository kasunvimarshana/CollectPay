<?php

declare(strict_types=1);

namespace Application\UseCases\Payment;

use Domain\Entities\Payment;
use Domain\Repositories\PaymentRepositoryInterface;

/**
 * Use Case: Get payment by ID
 */
final class GetPaymentUseCase
{
    public function __construct(
        private readonly PaymentRepositoryInterface $paymentRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param string $paymentId
     * @return Payment
     * @throws \InvalidArgumentException
     */
    public function execute(string $paymentId): Payment
    {
        $payment = $this->paymentRepository->findById($paymentId);
        
        if (!$payment) {
            throw new \InvalidArgumentException("Payment with ID {$paymentId} not found");
        }

        return $payment;
    }
}
