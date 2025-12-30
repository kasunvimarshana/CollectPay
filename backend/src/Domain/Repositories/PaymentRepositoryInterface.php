<?php

declare(strict_types=1);

namespace Domain\Repositories;

use Domain\Entities\Payment;
use Domain\ValueObjects\UUID;
use DateTimeImmutable;

interface PaymentRepositoryInterface
{
    public function save(Payment $payment): void;
    
    public function findById(UUID $id): ?Payment;
    
    /**
     * @return Payment[]
     */
    public function findBySupplierId(UUID $supplierId, ?DateTimeImmutable $from = null, ?DateTimeImmutable $to = null): array;
    
    /**
     * @return Payment[]
     */
    public function findAll(int $page = 1, int $perPage = 30, ?array $filters = null): array;
    
    public function count(?array $filters = null): int;
    
    public function delete(UUID $id): void;
}
