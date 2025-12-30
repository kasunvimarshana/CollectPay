<?php

declare(strict_types=1);

namespace Application\UseCases\Payment;

use Domain\Entities\Payment;
use Domain\Repositories\PaymentRepositoryInterface;
use Domain\Repositories\SupplierRepositoryInterface;
use Domain\Services\UuidGeneratorInterface;
use Domain\ValueObjects\Money;
use Application\DTOs\CreatePaymentDTO;
use DateTimeImmutable;

/**
 * Create Payment Use Case
 * Handles the business logic for creating a new payment
 */
final class CreatePaymentUseCase
{
    public function __construct(
        private readonly PaymentRepositoryInterface $paymentRepository,
        private readonly SupplierRepositoryInterface $supplierRepository,
        private readonly UuidGeneratorInterface $uuidGenerator
    ) {}

    public function execute(CreatePaymentDTO $dto): Payment
    {
        // Validate supplier exists
        $supplier = $this->supplierRepository->findById($dto->supplierId);
        if (!$supplier) {
            throw new \DomainException("Supplier not found");
        }

        // Create money value object
        $amount = Money::fromFloat($dto->amount, $dto->currency);

        // Create payment date
        $paymentDate = new DateTimeImmutable($dto->paymentDate);

        // Generate UUID for new payment
        $id = $this->uuidGenerator->generate();

        // Create new payment entity
        $payment = Payment::create(
            $id,
            $dto->supplierId,
            $dto->type,
            $amount,
            $paymentDate,
            $dto->paidBy,
            $dto->referenceNumber,
            $dto->notes
        );

        // Persist to repository
        $this->paymentRepository->save($payment);

        return $payment;
    }
}
