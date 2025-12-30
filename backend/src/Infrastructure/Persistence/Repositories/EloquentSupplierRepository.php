<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Repositories;

use Domain\Entities\Supplier;
use Domain\Repositories\SupplierRepositoryInterface;
use Domain\ValueObjects\UUID;
use Infrastructure\Persistence\Eloquent\SupplierModel;
use DateTimeImmutable;

/**
 * Eloquent Supplier Repository Implementation
 * 
 * Infrastructure layer - implements domain repository interface
 * Follows Dependency Inversion Principle
 */
final class EloquentSupplierRepository implements SupplierRepositoryInterface
{
    public function save(Supplier $supplier): void
    {
        SupplierModel::updateOrCreate(
            ['id' => $supplier->id()->value()],
            [
                'name' => $supplier->name(),
                'code' => $supplier->code(),
                'email' => $supplier->email()?->value(),
                'phone' => $supplier->phone()?->value(),
                'address' => $supplier->address(),
                'active' => $supplier->isActive(),
                'version' => $supplier->version(),
                'updated_at' => $supplier->updatedAt(),
            ]
        );
    }

    public function findById(UUID $id): ?Supplier
    {
        $model = SupplierModel::find($id->value());
        
        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findByCode(string $code): ?Supplier
    {
        $model = SupplierModel::where('code', strtoupper(trim($code)))->first();
        
        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findAll(array $filters = [], int $page = 1, int $perPage = 15): array
    {
        $query = SupplierModel::query();

        // Apply filters
        if (isset($filters['active'])) {
            $query->where('active', (bool) $filters['active']);
        }

        if (isset($filters['search']) && !empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Get total count
        $total = $query->count();

        // Apply pagination
        $models = $query->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        $data = $models->map(fn($model) => $this->toDomainEntity($model))->all();

        return [
            'data' => $data,
            'total' => $total,
        ];
    }

    public function delete(UUID $id): void
    {
        SupplierModel::where('id', $id->value())->delete();
    }

    public function codeExists(string $code, ?UUID $excludeId = null): bool
    {
        $query = SupplierModel::where('code', strtoupper(trim($code)));

        if ($excludeId) {
            $query->where('id', '!=', $excludeId->value());
        }

        return $query->exists();
    }

    private function toDomainEntity(SupplierModel $model): Supplier
    {
        return Supplier::reconstitute(
            $model->id,
            $model->name,
            $model->code,
            $model->email,
            $model->phone,
            $model->address,
            $model->active,
            new DateTimeImmutable($model->created_at->toDateTimeString()),
            new DateTimeImmutable($model->updated_at->toDateTimeString()),
            $model->version
        );
    }
}
