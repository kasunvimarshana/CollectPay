<?php

namespace App\Application\UseCases;

use App\Application\DTOs\CreatePaymentDTO;
use App\Domain\Entities\PaymentEntity;
use App\Domain\Repositories\PaymentRepositoryInterface;

/**
 * Create Payment Use Case
 * 
 * Handles the business logic for creating a new payment.
 */
class CreatePaymentUseCase
{
    public function __construct(
        private PaymentRepositoryInterface $paymentRepository
    ) {
    }

    /**
     * Execute the use case
     * 
     * @param CreatePaymentDTO $dto
     * @return PaymentEntity
     */
    public function execute(CreatePaymentDTO $dto): PaymentEntity
    {
        // Create the payment entity
        $payment = new PaymentEntity(
            supplierId: $dto->supplierId,
            userId: $dto->userId,
            paymentDate: new \DateTimeImmutable($dto->paymentDate),
            amount: $dto->amount,
            paymentType: $dto->paymentType,
            paymentMethod: $dto->paymentMethod,
            referenceNumber: $dto->referenceNumber,
            notes: $dto->notes,
            metadata: $dto->metadata
        );

        // Save and return
        return $this->paymentRepository->save($payment);
    }
}
