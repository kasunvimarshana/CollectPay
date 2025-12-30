<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Payment;
use App\Domain\ValueObjects\Money;
use DateTime;

/**
 * Payment Repository Interface
 */
interface PaymentRepositoryInterface
{
    public function findById(int $id): ?Payment;
    
    public function findBySupplierId(int $supplierId, array $filters = []): array;
    
    public function findByDateRange(DateTime $from, DateTime $to, array $filters = []): array;
    
    public function findAll(array $filters = [], int $page = 1, int $perPage = 50): array;
    
    public function save(Payment $payment): Payment;
    
    public function update(Payment $payment): Payment;
    
    public function delete(int $id): bool;
    
    public function count(array $filters = []): int;
    
    public function getTotalPaidForSupplier(int $supplierId, ?DateTime $upToDate = null): Money;
}
