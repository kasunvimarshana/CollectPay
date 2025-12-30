<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Repositories;

use Domain\Entities\Product;
use Domain\Repositories\ProductRepositoryInterface;
use Domain\ValueObjects\Unit;
use Infrastructure\Persistence\Eloquent\Models\ProductModel;
use DateTimeImmutable;

/**
 * Eloquent Product Repository Implementation
 */
final class EloquentProductRepository implements ProductRepositoryInterface
{
    public function save(Product $product): void
    {
        $model = ProductModel::find($product->getId()) ?? new ProductModel();

        $model->fill([
            'id' => $product->getId(),
            'name' => $product->getName(),
            'code' => $product->getCode(),
            'description' => $product->getDescription(),
            'default_unit' => $product->getDefaultUnit()->toString(),
            'is_active' => $product->isActive(),
        ]);

        $model->save();
    }

    public function findById(string $id): ?Product
    {
        $model = ProductModel::find($id);

        if (!$model) {
            return null;
        }

        return $this->toDomainEntity($model);
    }

    public function findByCode(string $code): ?Product
    {
        $model = ProductModel::where('code', $code)->first();

        if (!$model) {
            return null;
        }

        return $this->toDomainEntity($model);
    }

    public function findAll(int $page = 1, int $perPage = 20): array
    {
        $models = ProductModel::where('is_active', true)
            ->orderBy('name')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->toArray();
    }

    public function delete(string $id): void
    {
        $model = ProductModel::find($id);
        if ($model) {
            $model->delete();
        }
    }

    public function exists(string $id): bool
    {
        return ProductModel::where('id', $id)->exists();
    }

    private function toDomainEntity(ProductModel $model): Product
    {
        return Product::reconstitute(
            $model->id,
            $model->name,
            $model->code,
            $model->description,
            Unit::fromString($model->default_unit),
            $model->is_active,
            new DateTimeImmutable($model->created_at->toDateTimeString()),
            new DateTimeImmutable($model->updated_at->toDateTimeString()),
            $model->deleted_at ? new DateTimeImmutable($model->deleted_at->toDateTimeString()) : null
        );
    }
}
