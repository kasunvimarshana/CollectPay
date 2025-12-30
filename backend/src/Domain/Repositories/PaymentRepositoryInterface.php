<?php

declare(strict_types=1);

namespace Domain\Repositories;

use Domain\Entities\Payment;
use DateTimeImmutable;

/**
 * Payment Repository Interface
 * 
 * Defines the contract for payment persistence operations.
 */
interface PaymentRepositoryInterface
{
    public function findById(string $id): ?Payment;
    
    public function findAll(int $page = 1, int $perPage = 20, array $filters = []): array;
    
    public function findBySupplier(string $supplierId, int $page = 1, int $perPage = 20): array;
    
    public function findBySupplierId(
        string $supplierId,
        ?DateTimeImmutable $startDate = null,
        ?DateTimeImmutable $endDate = null
    ): array;
    
    public function findByDateRange(
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate,
        ?string $supplierId = null
    ): array;
    
    public function save(Payment $payment): Payment;
    
    public function delete(string $id): bool;
    
    public function exists(string $id): bool;
}
