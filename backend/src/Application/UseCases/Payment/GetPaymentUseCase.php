<?php

declare(strict_types=1);

namespace Application\UseCases\Payment;

use Domain\Repositories\PaymentRepositoryInterface;

/**
 * Get Payment Use Case
 */
final class GetPaymentUseCase
{
    public function __construct(
        private readonly PaymentRepositoryInterface $paymentRepository
    ) {}

    public function execute(string $id): ?\Domain\Entities\Payment
    {
        return $this->paymentRepository->findById($id);
    }
}
