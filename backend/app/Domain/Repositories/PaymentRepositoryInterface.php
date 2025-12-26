<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\Payment;

/**
 * Payment Repository Interface
 * 
 * Defines the contract for Payment data access operations.
 * Following Dependency Inversion Principle.
 */
interface PaymentRepositoryInterface
{
    /**
     * Find a payment by ID
     */
    public function findById(int $id): ?Payment;

    /**
     * Get all payments with optional filters
     */
    public function findAll(array $filters = [], int $page = 1, int $perPage = 15): array;

    /**
     * Create a new payment
     */
    public function create(Payment $payment): Payment;

    /**
     * Update an existing payment
     */
    public function update(Payment $payment): Payment;

    /**
     * Delete a payment by ID
     */
    public function delete(int $id): bool;

    /**
     * Get payments by supplier ID
     */
    public function findBySupplier(int $supplierId, ?array $dateRange = null): array;

    /**
     * Get payments by payment type
     */
    public function findByType(string $paymentType): array;

    /**
     * Get payments within a date range
     */
    public function findByDateRange(\DateTimeInterface $from, \DateTimeInterface $to): array;

    /**
     * Get total amount paid to a supplier
     */
    public function getTotalPaidToSupplier(int $supplierId, ?string $paymentType = null): float;

    /**
     * Get advance payments for a supplier
     */
    public function getAdvancePayments(int $supplierId): array;

    /**
     * Get total count of payments
     */
    public function count(array $filters = []): int;

    /**
     * Calculate net payment (total collections - total payments)
     */
    public function calculateNetPayment(int $supplierId): float;
}
