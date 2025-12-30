<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Repositories;

use Domain\Entities\Rate;
use Domain\Repositories\RateRepositoryInterface;
use Domain\ValueObjects\Money;
use Domain\ValueObjects\Unit;
use Infrastructure\Persistence\Eloquent\Models\RateModel;
use DateTimeImmutable;

/**
 * Eloquent Rate Repository Implementation
 */
final class EloquentRateRepository implements RateRepositoryInterface
{
    public function save(Rate $rate): void
    {
        $model = RateModel::find($rate->getId()) ?? new RateModel();

        $model->fill([
            'id' => $rate->getId(),
            'product_id' => $rate->getProductId(),
            'rate_per_unit' => $rate->getRatePerUnit()->getAmount(),
            'currency' => $rate->getRatePerUnit()->getCurrency(),
            'unit' => $rate->getUnit()->toString(),
            'effective_from' => $rate->getEffectiveFrom(),
            'effective_to' => $rate->getEffectiveTo(),
            'is_active' => $rate->isActive(),
        ]);

        $model->save();
    }

    public function findById(string $id): ?Rate
    {
        $model = RateModel::find($id);

        if (!$model) {
            return null;
        }

        return $this->toDomainEntity($model);
    }

    public function findByProductId(string $productId): array
    {
        $models = RateModel::where('product_id', $productId)
            ->where('is_active', true)
            ->orderBy('effective_from', 'desc')
            ->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->toArray();
    }

    public function findEffectiveRateForProduct(
        string $productId,
        DateTimeImmutable $date
    ): ?Rate {
        $model = RateModel::where('product_id', $productId)
            ->where('is_active', true)
            ->where('effective_from', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', $date);
            })
            ->orderBy('effective_from', 'desc')
            ->first();

        if (!$model) {
            return null;
        }

        return $this->toDomainEntity($model);
    }

    public function findLatestRateForProduct(string $productId): ?Rate
    {
        $model = RateModel::where('product_id', $productId)
            ->where('is_active', true)
            ->orderBy('effective_from', 'desc')
            ->first();

        if (!$model) {
            return null;
        }

        return $this->toDomainEntity($model);
    }

    public function findAll(int $page = 1, int $perPage = 20): array
    {
        $models = RateModel::where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->toArray();
    }

    private function toDomainEntity(RateModel $model): Rate
    {
        return Rate::reconstitute(
            $model->id,
            $model->product_id,
            Money::fromFloat((float) $model->rate_per_unit, $model->currency),
            Unit::fromString($model->unit),
            new DateTimeImmutable($model->effective_from->toDateTimeString()),
            $model->effective_to ? new DateTimeImmutable($model->effective_to->toDateTimeString()) : null,
            $model->is_active,
            new DateTimeImmutable($model->created_at->toDateTimeString()),
            new DateTimeImmutable($model->updated_at->toDateTimeString())
        );
    }
}
