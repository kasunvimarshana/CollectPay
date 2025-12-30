<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Entities\Supplier as SupplierEntity;
use App\Domain\Repositories\SupplierRepositoryInterface;
use App\Models\Supplier as SupplierModel;
use DateTime;

/**
 * Supplier Repository Implementation using Eloquent
 */
class SupplierRepository implements SupplierRepositoryInterface
{
    public function __construct(
        private SupplierModel $model
    ) {}

    public function findById(int $id): ?SupplierEntity
    {
        $supplier = $this->model->find($id);
        
        if (!$supplier) {
            return null;
        }
        
        return $this->toEntity($supplier);
    }

    public function findByCode(string $code): ?SupplierEntity
    {
        $supplier = $this->model->where('code', $code)->first();
        
        if (!$supplier) {
            return null;
        }
        
        return $this->toEntity($supplier);
    }

    public function findAll(array $filters = [], int $page = 1, int $perPage = 50): array
    {
        $query = $this->model->newQuery();
        
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }
        
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        $suppliers = $query->orderBy('name')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();
        
        return $suppliers->map(fn($supplier) => $this->toEntity($supplier))->toArray();
    }

    public function save(SupplierEntity $supplier): SupplierEntity
    {
        $model = $this->model->newInstance();
        $model->fill($this->toArray($supplier));
        $model->save();
        
        return $this->toEntity($model);
    }

    public function update(SupplierEntity $supplier): SupplierEntity
    {
        $model = $this->model->findOrFail($supplier->getId());
        $model->fill($this->toArray($supplier));
        $model->save();
        
        return $this->toEntity($model);
    }

    public function delete(int $id): bool
    {
        return $this->model->where('id', $id)->delete() > 0;
    }

    public function codeExists(string $code, ?int $excludeId = null): bool
    {
        $query = $this->model->where('code', $code);
        
        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }
        
        return $query->exists();
    }

    public function count(array $filters = []): int
    {
        $query = $this->model->newQuery();
        
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }
        
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        return $query->count();
    }

    private function toEntity(SupplierModel $model): SupplierEntity
    {
        return new SupplierEntity(
            name: $model->name,
            code: $model->code,
            address: $model->address,
            phone: $model->phone,
            email: $model->email,
            contactPerson: $model->contact_person,
            isActive: $model->is_active,
            id: $model->id,
            createdAt: $model->created_at ? new DateTime($model->created_at) : null,
            updatedAt: $model->updated_at ? new DateTime($model->updated_at) : null,
            createdBy: $model->created_by
        );
    }

    private function toArray(SupplierEntity $entity): array
    {
        return [
            'name' => $entity->getName(),
            'code' => $entity->getCode(),
            'address' => $entity->getAddress(),
            'phone' => $entity->getPhone(),
            'email' => $entity->getEmail(),
            'contact_person' => $entity->getContactPerson(),
            'is_active' => $entity->isActive(),
            'created_by' => $entity->getCreatedBy(),
        ];
    }
}
