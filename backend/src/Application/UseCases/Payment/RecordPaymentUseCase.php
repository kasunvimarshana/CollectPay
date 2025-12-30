<?php

namespace App\Application\UseCases\Payment;

use App\Domain\Entities\Payment;
use App\Domain\Repositories\PaymentRepositoryInterface;

/**
 * Record Payment Use Case
 */
class RecordPaymentUseCase
{
    public function __construct(
        private readonly PaymentRepositoryInterface $paymentRepository
    ) {}

    public function execute(
        int $supplierId,
        float $amount,
        string $paymentType,
        ?string $notes,
        int $createdBy,
        ?\DateTimeInterface $paidAt = null
    ): Payment {
        $payment = new Payment(
            null,
            $supplierId,
            $amount,
            $paymentType,
            $notes,
            $paidAt ?? new \DateTimeImmutable(),
            $createdBy
        );

        return $this->paymentRepository->save($payment);
    }
}
