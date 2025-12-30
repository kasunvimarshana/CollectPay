<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Payment;

/**
 * Payment Repository Interface
 */
interface PaymentRepositoryInterface
{
    public function findById(int $id): ?Payment;

    public function findAll(int $page = 1, int $perPage = 15): array;

    public function findBySupplier(int $supplierId, ?int $page = 1, ?int $perPage = 15): array;

    public function save(Payment $payment): Payment;

    public function delete(int $id): bool;

    public function getTotalPaymentsBySupplier(int $supplierId): float;
}
