<?php

declare(strict_types=1);

namespace Application\UseCases\Payment;

use Application\DTOs\CreatePaymentDTO;
use Domain\Entities\Payment;
use Domain\Repositories\SupplierRepositoryInterface;
use Domain\Repositories\PaymentRepositoryInterface;
use Domain\ValueObjects\UUID;
use Domain\ValueObjects\Money;
use DateTimeImmutable;
use InvalidArgumentException;

final class CreatePaymentUseCase
{
    public function __construct(
        private PaymentRepositoryInterface $paymentRepository,
        private SupplierRepositoryInterface $supplierRepository
    ) {}

    public function execute(CreatePaymentDTO $dto): Payment
    {
        $supplierId = UUID::fromString($dto->supplierId);
        
        // Verify supplier exists
        $supplier = $this->supplierRepository->findById($supplierId);
        if (!$supplier) {
            throw new InvalidArgumentException('Supplier not found');
        }

        $paymentDate = new DateTimeImmutable($dto->paymentDate);

        $payment = Payment::create(
            $supplierId,
            new Money($dto->amount, $dto->currency),
            $dto->type,
            $paymentDate,
            $dto->reference,
            $dto->notes
        );

        $this->paymentRepository->save($payment);

        return $payment;
    }
}
