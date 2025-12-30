<?php

namespace App\Application\UseCases\Payment;

use App\Application\DTOs\PaymentDTO;
use App\Domain\Entities\PaymentEntity;
use App\Domain\Repositories\PaymentRepositoryInterface;

/**
 * Update Payment Use Case
 *
 * Encapsulates the business logic for updating a payment with version control.
 */
class UpdatePaymentUseCase
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
    public function execute(int $id, PaymentDTO $dto): PaymentEntity
    {
        // Find existing payment
        $existingPayment = $this->repository->findById($id);
        if ($existingPayment === null) {
            throw new \InvalidArgumentException("Payment with ID {$id} not found");
        }

        // Optimistic locking: Check version conflict
        if ($existingPayment->getVersion() !== $dto->version) {
            throw new \RuntimeException(
                'Version conflict: Payment has been modified by another user. '.
                "Expected version {$dto->version}, but current version is {$existingPayment->getVersion()}"
            );
        }

        // Create updated entity
        $paymentDate = new \DateTime($dto->paymentDate);

        $payment = new PaymentEntity(
            supplierId: $dto->supplierId,
            amount: $dto->amount,
            paymentType: $dto->paymentType,
            paymentDate: $paymentDate,
            recordedBy: $dto->recordedBy,
            paymentMethod: $dto->paymentMethod,
            referenceNumber: $dto->referenceNumber,
            notes: $dto->notes,
            metadata: $dto->metadata,
            version: $dto->version + 1, // Increment version
            id: $id,
            createdAt: $existingPayment->getCreatedAt()
        );

        // Persist the updated entity
        try {
            return $this->repository->save($payment);
        } catch (\Exception $e) {
            throw new \RuntimeException('Failed to update payment: '.$e->getMessage(), 0, $e);
        }
    }
}
