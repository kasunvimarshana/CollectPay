<?php

namespace App\Application\UseCases\Payment;

use App\Application\DTOs\PaymentDTO;
use App\Domain\Entities\PaymentEntity;
use App\Domain\Repositories\PaymentRepositoryInterface;
use App\Domain\Repositories\SupplierRepositoryInterface;

/**
 * Create Payment Use Case
 *
 * Encapsulates the business logic for creating a new payment.
 */
class CreatePaymentUseCase
{
    private PaymentRepositoryInterface $paymentRepository;

    private SupplierRepositoryInterface $supplierRepository;

    public function __construct(
        PaymentRepositoryInterface $paymentRepository,
        SupplierRepositoryInterface $supplierRepository
    ) {
        $this->paymentRepository = $paymentRepository;
        $this->supplierRepository = $supplierRepository;
    }

    /**
     * Execute the use case
     *
     * @throws \InvalidArgumentException
     * @throws \RuntimeException
     */
    public function execute(PaymentDTO $dto): PaymentEntity
    {
        // Verify supplier exists
        if (! $this->supplierRepository->exists($dto->supplierId)) {
            throw new \InvalidArgumentException("Supplier with ID {$dto->supplierId} not found");
        }

        // Create payment entity
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
            metadata: $dto->metadata
        );

        // Persist the entity
        try {
            return $this->paymentRepository->save($payment);
        } catch (\Exception $e) {
            throw new \RuntimeException('Failed to create payment: '.$e->getMessage(), 0, $e);
        }
    }
}
