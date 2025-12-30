<?php

declare(strict_types=1);

namespace Application\UseCases\Payment;

use Domain\Repositories\PaymentRepositoryInterface;

/**
 * List Payments Use Case
 */
final class ListPaymentsUseCase
{
    public function __construct(
        private readonly PaymentRepositoryInterface $paymentRepository
    ) {}

    public function execute(int $page = 1, int $perPage = 20): array
    {
        return $this->paymentRepository->findAll($page, $perPage);
    }

    public function executeBySupplier(string $supplierId, int $page = 1, int $perPage = 20): array
    {
        return $this->paymentRepository->findBySupplierId($supplierId, $page, $perPage);
    }
}
