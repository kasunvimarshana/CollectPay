<?php

namespace Infrastructure\Persistence\Eloquent\Repositories;

use Domain\Supplier\Supplier;
use Domain\Supplier\SupplierRepositoryInterface;
use Domain\Shared\ValueObjects\Location;
use Domain\Shared\ValueObjects\Uuid;
use Infrastructure\Persistence\Eloquent\Models\SupplierModel;

class SupplierRepository implements SupplierRepositoryInterface
{
    public function save(Supplier $supplier): void
    {
        $model = SupplierModel::findOrNew($supplier->id()->value());
        
        $model->id = $supplier->id()->value();
        $model->name = $supplier->name();
        $model->contact_number = $supplier->contactNumber();
        $model->address = $supplier->address();
        $model->latitude = $supplier->location()?->latitude();
        $model->longitude = $supplier->location()?->longitude();
        $model->is_active = $supplier->isActive();
        $model->created_by = $supplier->createdBy()->value();
        
        $model->save();
    }

    public function findById(string $id): ?Supplier
    {
        $model = SupplierModel::find($id);
        
        return $model ? $this->toDomain($model) : null;
    }

    public function findAll(int $page = 1, int $perPage = 20): array
    {
        $models = SupplierModel::orderBy('name')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();
        
        return $models->map(fn($model) => $this->toDomain($model))->all();
    }

    public function findByCreatedBy(string $userId, int $page = 1, int $perPage = 20): array
    {
        $models = SupplierModel::where('created_by', $userId)
            ->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();
        
        return $models->map(fn($model) => $this->toDomain($model))->all();
    }

    public function findActiveSuppliers(int $page = 1, int $perPage = 20): array
    {
        $models = SupplierModel::where('is_active', true)
            ->orderBy('name')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();
        
        return $models->map(fn($model) => $this->toDomain($model))->all();
    }

    public function searchByName(string $name, int $page = 1, int $perPage = 20): array
    {
        $models = SupplierModel::where('name', 'like', "%{$name}%")
            ->orderBy('name')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();
        
        return $models->map(fn($model) => $this->toDomain($model))->all();
    }

    public function delete(string $id): void
    {
        SupplierModel::where('id', $id)->delete();
    }

    public function exists(string $id): bool
    {
        return SupplierModel::where('id', $id)->exists();
    }

    public function count(): int
    {
        return SupplierModel::count();
    }

    private function toDomain(SupplierModel $model): Supplier
    {
        $location = ($model->latitude && $model->longitude) 
            ? Location::fromCoordinates((float) $model->latitude, (float) $model->longitude)
            : null;

        return Supplier::reconstitute(
            Uuid::fromString($model->id),
            $model->name,
            $model->contact_number,
            $model->address,
            $location,
            Uuid::fromString($model->created_by),
            $model->is_active,
            $model->created_at->toDateTimeImmutable(),
            $model->updated_at->toDateTimeImmutable()
        );
    }
}
