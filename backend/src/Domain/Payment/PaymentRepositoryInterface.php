<?php

namespace Domain\Payment;

/**
 * Payment Repository Interface
 */
interface PaymentRepositoryInterface
{
    public function save(Payment $payment): void;

    public function findById(string $id): ?Payment;

    public function findBySupplierId(string $supplierId, int $page = 1, int $perPage = 20): array;

    public function findByPaidBy(string $userId, int $page = 1, int $perPage = 20): array;

    public function findByStatus(string $status, int $page = 1, int $perPage = 20): array;

    public function findByDateRange(\DateTimeImmutable $from, \DateTimeImmutable $to): array;

    public function findBySyncId(string $syncId): ?Payment;

    public function delete(string $id): void;

    public function getTotalPaidToSupplier(string $supplierId): int;

    public function getPaymentsByType(string $supplierId, string $type): array;
}
