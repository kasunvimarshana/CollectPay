<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Payment;
use DateTimeImmutable;

interface PaymentRepositoryInterface
{
    public function findById(string $id): ?Payment;
    
    public function findByIdempotencyKey(string $key): ?Payment;
    
    public function findAll(int $page = 1, int $perPage = 50): array;
    
    public function findBySupplierId(string $supplierId, int $page = 1, int $perPage = 50): array;
    
    public function save(Payment $payment): bool;
    
    public function saveBatch(array $payments): bool;
    
    public function delete(string $id): bool;
    
    public function getUpdatedSince(string $timestamp): array;
    
    public function getTotalPaymentsBySupplierId(
        string $supplierId,
        ?DateTimeImmutable $startDate = null,
        ?DateTimeImmutable $endDate = null
    ): float;
}
