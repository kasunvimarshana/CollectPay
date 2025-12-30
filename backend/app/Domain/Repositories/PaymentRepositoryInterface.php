<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\PaymentEntity;

/**
 * Payment Repository Interface
 *
 * Defines the contract for Payment persistence operations.
 * Infrastructure layer will provide concrete implementations.
 */
interface PaymentRepositoryInterface
{
    /**
     * Save a payment entity (create or update)
     *
     * @throws \Exception if save fails
     */
    public function save(PaymentEntity $entity): PaymentEntity;

    /**
     * Find a payment by ID
     */
    public function findById(int $id): ?PaymentEntity;

    /**
     * Find payments by supplier
     *
     * @return PaymentEntity[]
     */
    public function findBySupplier(int $supplierId, ?\DateTimeInterface $fromDate = null, ?\DateTimeInterface $toDate = null): array;

    /**
     * Find payments by type
     *
     * @return PaymentEntity[]
     */
    public function findByType(string $paymentType): array;

    /**
     * List all payments with optional filters
     *
     * @return array ['data' => PaymentEntity[], 'total' => int, 'page' => int]
     */
    public function list(array $filters = [], int $page = 1, int $perPage = 15): array;

    /**
     * Delete a payment by ID
     */
    public function delete(int $id): bool;

    /**
     * Check if a payment exists
     */
    public function exists(int $id): bool;

    /**
     * Calculate total payments for a supplier
     */
    public function getTotalAmountBySupplier(int $supplierId, ?\DateTimeInterface $fromDate = null, ?\DateTimeInterface $toDate = null): float;

    /**
     * Get payments by reference number
     */
    public function findByReferenceNumber(string $referenceNumber): ?PaymentEntity;
}
