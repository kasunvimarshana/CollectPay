<?php

declare(strict_types=1);

namespace Application\UseCases\Payment;

use Domain\Repositories\PaymentRepositoryInterface;

/**
 * Use Case: List all payments
 */
final class ListPaymentsUseCase
{
    public function __construct(
        private readonly PaymentRepositoryInterface $paymentRepository
    ) {
    }

    /**
     * Execute the use case
     *
     * @param int $page
     * @param int $perPage
     * @param array $filters
     * @return array
     */
    public function execute(int $page = 1, int $perPage = 15, array $filters = []): array
    {
        return $this->paymentRepository->findAll($page, $perPage, $filters);
    }
}
