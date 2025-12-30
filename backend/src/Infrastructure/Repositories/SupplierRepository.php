<?php

declare(strict_types=1);

namespace Infrastructure\Repositories;

use Domain\Entities\Supplier;
use Domain\Repositories\SupplierRepositoryInterface;
use Domain\ValueObjects\Email;
use Domain\ValueObjects\PhoneNumber;
use Infrastructure\Persistence\Eloquent\SupplierModel;

/**
 * Eloquent-based Supplier Repository Implementation
 * 
 * This repository implements the SupplierRepositoryInterface
 * using Laravel's Eloquent ORM for data persistence.
 */
class SupplierRepository implements SupplierRepositoryInterface
{
    /**
     * Convert Eloquent model to Domain entity
     */
    private function toDomainEntity(SupplierModel $model): Supplier
    {
        $email = $model->email ? new Email($model->email) : null;
        $phone = $model->phone ? new PhoneNumber($model->phone) : null;

        return Supplier::create(
            id: $model->id,
            name: $model->name,
            email: $email,
            phone: $phone,
            address: $model->address,
            metadata: $model->metadata ?? []
        );
    }

    /**
     * Convert Domain entity to Eloquent model data
     */
    private function toModelData(Supplier $supplier): array
    {
        return [
            'id' => $supplier->id(),
            'name' => $supplier->name(),
            'email' => $supplier->email() ? $supplier->email()->value() : null,
            'phone' => $supplier->phone() ? $supplier->phone()->value() : null,
            'address' => $supplier->address(),
            'metadata' => $supplier->metadata(),
            'is_active' => $supplier->isActive(),
        ];
    }

    public function findById(string $id): ?Supplier
    {
        $model = SupplierModel::find($id);
        
        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findAll(int $page = 1, int $perPage = 20, array $filters = []): array
    {
        $query = SupplierModel::query();

        // Apply filters
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (isset($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                  ->orWhere('email', 'like', "%{$filters['search']}%")
                  ->orWhere('phone', 'like', "%{$filters['search']}%");
            });
        }

        $models = $query->orderBy('created_at', 'desc')
                       ->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => $models->map(fn($model) => $this->toDomainEntity($model))->all(),
            'total' => $models->total(),
            'page' => $models->currentPage(),
            'per_page' => $models->perPage(),
            'last_page' => $models->lastPage(),
        ];
    }

    public function findActive(): array
    {
        $models = SupplierModel::where('is_active', true)
                               ->orderBy('name')
                               ->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->all();
    }

    public function save(Supplier $supplier): Supplier
    {
        $data = $this->toModelData($supplier);
        
        SupplierModel::updateOrCreate(
            ['id' => $supplier->id()],
            $data
        );

        return $supplier;
    }

    public function delete(string $id): bool
    {
        $model = SupplierModel::find($id);
        
        if (!$model) {
            return false;
        }

        return $model->delete();
    }

    public function exists(string $id): bool
    {
        return SupplierModel::where('id', $id)->exists();
    }
}
