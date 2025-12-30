<?php

namespace App\Application\UseCases\Payment;

use App\Domain\Repositories\PaymentRepositoryInterface;

/**
 * Delete Payment Use Case
 *
 * Deletes a payment by ID.
 */
class DeletePaymentUseCase
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
     * @throws \RuntimeException
     */
    public function execute(int $id): bool
    {
        if (! $this->repository->exists($id)) {
            throw new \InvalidArgumentException("Payment with ID {$id} not found");
        }

        try {
            return $this->repository->delete($id);
        } catch (\Exception $e) {
            throw new \RuntimeException('Failed to delete payment: '.$e->getMessage(), 0, $e);
        }
    }
}
