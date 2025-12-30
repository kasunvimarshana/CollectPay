<?php

declare(strict_types=1);

namespace Application\UseCases\Payment;

use Application\DTOs\CreatePaymentDTO;
use Domain\Entities\Payment;
use Domain\Repositories\PaymentRepositoryInterface;
use Domain\Repositories\SupplierRepositoryInterface;
use Domain\Repositories\UserRepositoryInterface;
use Domain\ValueObjects\Money;

/**
 * Use Case: Create a new payment
 * 
 * This use case handles recording a payment transaction.
 */
final class CreatePaymentUseCase
{
    public function __construct(
        private readonly PaymentRepositoryInterface $paymentRepository,
        private readonly SupplierRepositoryInterface $supplierRepository,
        private readonly UserRepositoryInterface $userRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param CreatePaymentDTO $dto
     * @return Payment
     * @throws \InvalidArgumentException
     */
    public function execute(CreatePaymentDTO $dto): Payment
    {
        // Validate supplier exists
        $supplier = $this->supplierRepository->findById($dto->supplierId);
        if (!$supplier) {
            throw new \InvalidArgumentException("Supplier with ID {$dto->supplierId} not found");
        }

        // Validate user exists
        $user = $this->userRepository->findById($dto->userId);
        if (!$user) {
            throw new \InvalidArgumentException("User with ID {$dto->userId} not found");
        }

        // Create money value object
        $amount = new Money($dto->amount, $dto->currency);

        // Validate payment type
        if (!in_array($dto->paymentType, ['advance', 'partial', 'full'])) {
            throw new \InvalidArgumentException("Invalid payment type: {$dto->paymentType}");
        }

        // Create payment date
        $paymentDate = $dto->paymentDate 
            ? new \DateTimeImmutable($dto->paymentDate)
            : new \DateTimeImmutable();

        // Generate UUID for payment
        $id = \Illuminate\Support\Str::uuid()->toString();

        // Create payment entity
        $payment = Payment::create(
            id: $id,
            supplierId: $dto->supplierId,
            userId: $dto->userId,
            amount: $amount,
            type: $dto->paymentType,
            paymentDate: $paymentDate,
            reference: $dto->reference,
            notes: null,
            metadata: $dto->metadata
        );

        // Persist payment
        return $this->paymentRepository->save($payment);
    }
}
