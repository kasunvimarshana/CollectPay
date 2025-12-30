<?php

namespace App\Application\UseCases\Payment;

use App\Domain\Repositories\PaymentRepositoryInterface;

/**
 * List Payments Use Case
 *
 * Lists payments with optional filtering and pagination.
 */
class ListPaymentsUseCase
{
    private PaymentRepositoryInterface $repository;

    public function __construct(PaymentRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Execute the use case
     *
     * @return array ['data' => PaymentEntity[], 'total' => int, 'page' => int]
     */
    public function execute(array $filters = [], int $page = 1, int $perPage = 15): array
    {
        return $this->repository->list($filters, $page, $perPage);
    }
}
