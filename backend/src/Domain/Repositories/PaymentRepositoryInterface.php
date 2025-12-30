<?php

declare(strict_types=1);

namespace LedgerFlow\Domain\Repositories;

use DateTimeImmutable;
use LedgerFlow\Domain\Entities\Payment;

/**
 * Payment Repository Interface
 * 
 * Defines the contract for payment data persistence operations.
 * Supports advance, partial, and full payment tracking.
 */
interface PaymentRepositoryInterface
{
    public function findById(string $id): ?Payment;
    
    public function findAll(int $limit = 100, int $offset = 0): array;
    
    public function findBySupplierId(string $supplierId, int $limit = 100, int $offset = 0): array;
    
    public function findByUserId(string $userId, int $limit = 100, int $offset = 0): array;
    
    public function findByPaymentType(string $type, int $limit = 100, int $offset = 0): array;
    
    public function findByDateRange(
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate,
        int $limit = 100,
        int $offset = 0
    ): array;
    
    public function findBySupplierAndDateRange(
        string $supplierId,
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate
    ): array;
    
    public function save(Payment $payment): Payment;
    
    public function update(Payment $payment): bool;
    
    public function delete(string $id): bool;
    
    public function exists(string $id): bool;
    
    public function calculateTotalBySupplier(string $supplierId): float;
    
    public function calculateTotalBySupplierAndDateRange(
        string $supplierId,
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate
    ): float;
}
