<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Payment;

/**
 * Payment Repository Interface
 */
interface PaymentRepositoryInterface
{
    public function findById(int $id): ?Payment;
    public function findBySyncId(string $syncId): ?Payment;
    public function findAll(array $filters = [], int $page = 1, int $perPage = 20): array;
    
    /**
     * Find payments by supplier within a date range
     */
    public function findBySupplierAndDateRange(
        int $supplierId,
        \DateTimeInterface $from,
        \DateTimeInterface $to
    ): array;
    
    /**
     * Calculate total paid amount for a supplier
     */
    public function getTotalPaidForSupplier(int $supplierId, ?\DateTimeInterface $upToDate = null): float;
    
    public function save(Payment $payment): Payment;
    public function update(Payment $payment): Payment;
    public function delete(int $id): bool;
}
