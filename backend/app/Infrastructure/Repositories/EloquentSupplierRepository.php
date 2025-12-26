<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Entities\SupplierEntity;
use App\Domain\Repositories\SupplierRepositoryInterface;
use App\Models\Supplier;

/**
 * Eloquent Supplier Repository
 * 
 * Implementation of SupplierRepositoryInterface using Laravel's Eloquent ORM.
 * Acts as an adapter between the domain layer and Laravel's persistence layer.
 */
class EloquentSupplierRepository implements SupplierRepositoryInterface
{
    /**
     * Find supplier by ID
     */
    public function findById(int $id): ?SupplierEntity
    {
        $model = Supplier::find($id);
        
        return $model ? $this->toEntity($model) : null;
    }

    /**
     * Find supplier by code
     */
    public function findByCode(string $code): ?SupplierEntity
    {
        $model = Supplier::where('code', $code)->first();
        
        return $model ? $this->toEntity($model) : null;
    }

    /**
     * Get all suppliers with optional filters
     */
    public function findAll(array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $query = Supplier::query();

        // Apply filters
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'name';
        $sortOrder = $filters['sort_order'] ?? 'asc';
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $models = $query->skip(($page - 1) * $perPage)->take($perPage)->get();

        return $models->map(fn($model) => $this->toEntity($model))->all();
    }

    /**
     * Save supplier (create or update)
     */
    public function save(SupplierEntity $supplier): SupplierEntity
    {
        $data = [
            'name' => $supplier->getName(),
            'code' => $supplier->getCode(),
            'address' => $supplier->getAddress(),
            'phone' => $supplier->getPhone(),
            'email' => $supplier->getEmail(),
            'metadata' => $supplier->getMetadata(),
            'is_active' => $supplier->isActive(),
            'version' => $supplier->getVersion(),
        ];

        if ($supplier->getId()) {
            // Update existing
            $model = Supplier::findOrFail($supplier->getId());
            $model->update($data);
        } else {
            // Create new
            $model = Supplier::create($data);
        }

        return $this->toEntity($model->fresh());
    }

    /**
     * Delete supplier
     */
    public function delete(int $id): bool
    {
        $model = Supplier::find($id);
        
        return $model ? $model->delete() : false;
    }

    /**
     * Check if code exists
     */
    public function codeExists(string $code, ?int $excludeId = null): bool
    {
        $query = Supplier::where('code', $code);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    /**
     * Get total count with optional filters
     */
    public function count(array $filters = []): int
    {
        $query = Supplier::query();

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        return $query->count();
    }

    /**
     * Convert Eloquent model to domain entity
     */
    private function toEntity(Supplier $model): SupplierEntity
    {
        return new SupplierEntity(
            name: $model->name,
            code: $model->code,
            address: $model->address,
            phone: $model->phone,
            email: $model->email,
            metadata: $model->metadata,
            isActive: $model->is_active,
            version: $model->version ?? 1,
            id: $model->id
        );
    }
}
