<?php

namespace App\Application\UseCases\Payment;

use App\Domain\Entities\PaymentEntity;
use App\Domain\Repositories\PaymentRepositoryInterface;

/**
 * Get Payment Use Case
 *
 * Retrieves a single payment by ID.
 */
class GetPaymentUseCase
{
    private PaymentRepositoryInterface $repository;

    public function __construct(PaymentRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Execute the use case
     *
     * @throws \InvalidArgumentException
     */
    public function execute(int $id): PaymentEntity
    {
        $payment = $this->repository->findById($id);

        if ($payment === null) {
            throw new \InvalidArgumentException("Payment with ID {$id} not found");
        }

        return $payment;
    }
}
