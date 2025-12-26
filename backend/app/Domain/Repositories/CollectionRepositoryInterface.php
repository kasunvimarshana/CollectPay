<?php

namespace App\Domain\Repositories;

use App\Domain\Entities\CollectionEntity;

/**
 * Collection Repository Interface
 * 
 * Defines the contract for collection data access operations.
 * Part of the Domain layer, independent of infrastructure.
 */
interface CollectionRepositoryInterface
{
    /**
     * Find collection by ID
     * 
     * @param int $id
     * @return CollectionEntity|null
     */
    public function findById(int $id): ?CollectionEntity;

    /**
     * Find all collections with optional filters
     * 
     * @param array $filters
     * @param int $page
     * @param int $perPage
     * @return array
     */
    public function findAll(array $filters = [], int $page = 1, int $perPage = 15): array;

    /**
     * Count collections with optional filters
     * 
     * @param array $filters
     * @return int
     */
    public function count(array $filters = []): int;

    /**
     * Save a collection
     * 
     * @param CollectionEntity $collection
     * @return CollectionEntity
     */
    public function save(CollectionEntity $collection): CollectionEntity;

    /**
     * Update a collection
     * 
     * @param CollectionEntity $collection
     * @return CollectionEntity
     */
    public function update(CollectionEntity $collection): CollectionEntity;

    /**
     * Delete a collection by ID
     * 
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool;
}
