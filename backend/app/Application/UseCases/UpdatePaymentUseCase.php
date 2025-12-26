<?php

namespace App\Application\UseCases;

use App\Application\DTOs\UpdatePaymentDTO;
use App\Domain\Entities\PaymentEntity;
use App\Domain\Repositories\PaymentRepositoryInterface;
use App\Domain\Exceptions\EntityNotFoundException;

/**
 * Update Payment Use Case
 * 
 * Handles the business logic for updating an existing payment.
 */
class UpdatePaymentUseCase
{
    public function __construct(
        private PaymentRepositoryInterface $paymentRepository
    ) {
    }

    /**
     * Execute the use case
     * 
     * @param UpdatePaymentDTO $dto
     * @return PaymentEntity
     * @throws EntityNotFoundException
     */
    public function execute(UpdatePaymentDTO $dto): PaymentEntity
    {
        // Find existing payment
        $payment = $this->paymentRepository->findById($dto->id);

        if (!$payment) {
            throw new EntityNotFoundException("Payment not found with ID: {$dto->id}");
        }

        // Update amount if provided
        if ($dto->amount !== null) {
            $payment->updateAmount($dto->amount);
        }

        // Update payment type if provided
        if ($dto->paymentType !== null) {
            $payment->updatePaymentType($dto->paymentType);
        }

        // Update payment method if provided
        if ($dto->paymentMethod !== null) {
            $payment->updatePaymentMethod($dto->paymentMethod);
        }

        // Update reference number if provided
        if ($dto->referenceNumber !== null) {
            $payment->updateReferenceNumber($dto->referenceNumber);
        }

        // Update notes if provided
        if ($dto->notes !== null) {
            $payment->updateNotes($dto->notes);
        }

        // Increment version
        $payment->incrementVersion();

        // Save and return
        return $this->paymentRepository->update($payment);
    }
}
