<?php

declare(strict_types=1);

namespace TrackVault\Domain\Repositories;

use TrackVault\Domain\Entities\Payment;
use TrackVault\Domain\ValueObjects\PaymentId;
use TrackVault\Domain\ValueObjects\SupplierId;
use DateTimeImmutable;

/**
 * Payment Repository Interface
 */
interface PaymentRepositoryInterface
{
    public function findById(PaymentId $id): ?Payment;
    
    public function findAll(int $page = 1, int $perPage = 10): array;
    
    public function findBySupplier(SupplierId $supplierId, int $page = 1, int $perPage = 10): array;
    
    public function findByDateRange(
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate,
        int $page = 1,
        int $perPage = 10
    ): array;
    
    public function save(Payment $payment): void;
    
    public function delete(PaymentId $id): void;
    
    public function exists(PaymentId $id): bool;
}
