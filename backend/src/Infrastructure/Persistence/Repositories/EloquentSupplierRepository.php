<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Repositories;

use Domain\Entities\Supplier;
use Domain\Repositories\SupplierRepositoryInterface;
use Infrastructure\Persistence\Eloquent\Models\SupplierModel;
use DateTimeImmutable;

/**
 * Eloquent Supplier Repository Implementation
 */
final class EloquentSupplierRepository implements SupplierRepositoryInterface
{
    public function save(Supplier $supplier): void
    {
        $model = SupplierModel::find($supplier->getId()) ?? new SupplierModel();

        $model->fill([
            'id' => $supplier->getId(),
            'name' => $supplier->getName(),
            'code' => $supplier->getCode(),
            'address' => $supplier->getAddress(),
            'phone' => $supplier->getPhone(),
            'email' => $supplier->getEmail(),
            'is_active' => $supplier->isActive(),
        ]);

        $model->save();
    }

    public function findById(string $id): ?Supplier
    {
        $model = SupplierModel::find($id);

        if (!$model) {
            return null;
        }

        return $this->toDomainEntity($model);
    }

    public function findByCode(string $code): ?Supplier
    {
        $model = SupplierModel::where('code', $code)->first();

        if (!$model) {
            return null;
        }

        return $this->toDomainEntity($model);
    }

    public function findAll(int $page = 1, int $perPage = 20): array
    {
        $models = SupplierModel::where('is_active', true)
            ->orderBy('name')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->toArray();
    }

    public function delete(string $id): void
    {
        $model = SupplierModel::find($id);
        if ($model) {
            $model->delete();
        }
    }

    public function exists(string $id): bool
    {
        return SupplierModel::where('id', $id)->exists();
    }

    private function toDomainEntity(SupplierModel $model): Supplier
    {
        return Supplier::reconstitute(
            $model->id,
            $model->name,
            $model->code,
            $model->address,
            $model->phone,
            $model->email,
            $model->is_active,
            new DateTimeImmutable($model->created_at->toDateTimeString()),
            new DateTimeImmutable($model->updated_at->toDateTimeString()),
            $model->deleted_at ? new DateTimeImmutable($model->deleted_at->toDateTimeString()) : null
        );
    }
}
