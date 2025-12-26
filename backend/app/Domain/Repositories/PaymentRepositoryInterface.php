<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\PaymentEntity;

/**
 * Payment Repository Interface
 * 
 * Defines the contract for payment data access operations.
 * Part of the Domain layer, independent of infrastructure.
 */
interface PaymentRepositoryInterface
{
    /**
     * Find payment by ID
     * 
     * @param int $id
     * @return PaymentEntity|null
     */
    public function findById(int $id): ?PaymentEntity;

    /**
     * Find all payments with optional filters
     * 
     * @param array $filters
     * @param int $page
     * @param int $perPage
     * @return array
     */
    public function findAll(array $filters = [], int $page = 1, int $perPage = 15): array;

    /**
     * Count payments with optional filters
     * 
     * @param array $filters
     * @return int
     */
    public function count(array $filters = []): int;

    /**
     * Save a payment
     * 
     * @param PaymentEntity $payment
     * @return PaymentEntity
     */
    public function save(PaymentEntity $payment): PaymentEntity;

    /**
     * Update a payment
     * 
     * @param PaymentEntity $payment
     * @return PaymentEntity
     */
    public function update(PaymentEntity $payment): PaymentEntity;

    /**
     * Delete a payment by ID
     * 
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool;
}
