<?php

declare(strict_types=1);

namespace Infrastructure\Persistence\Repositories;

use Domain\Entities\ProductRate;
use Domain\Repositories\ProductRateRepositoryInterface;
use Domain\ValueObjects\UUID;
use Domain\ValueObjects\Money;
use Infrastructure\Persistence\Eloquent\ProductRateModel;
use DateTimeImmutable;

final class EloquentProductRateRepository implements ProductRateRepositoryInterface
{
    public function save(ProductRate $rate): void
    {
        ProductRateModel::updateOrCreate(
            ['id' => $rate->id()->value()],
            [
                'product_id' => $rate->productId()->value(),
                'rate_amount' => $rate->rate()->amount(),
                'currency' => $rate->rate()->currency(),
                'effective_from' => $rate->effectiveFrom(),
                'effective_to' => $rate->effectiveTo(),
                'active' => $rate->isActive(),
                'version' => $rate->version(),
            ]
        );
    }

    public function findById(UUID $id): ?ProductRate
    {
        $model = ProductRateModel::find($id->value());
        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findByProductId(UUID $productId): array
    {
        $models = ProductRateModel::where('product_id', $productId->value())
                                  ->orderBy('effective_from', 'desc')
                                  ->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->all();
    }

    public function findActiveRateForProduct(UUID $productId, DateTimeImmutable $date): ?ProductRate
    {
        $model = ProductRateModel::where('product_id', $productId->value())
                                 ->where('active', true)
                                 ->where('effective_from', '<=', $date)
                                 ->where(function ($query) use ($date) {
                                     $query->whereNull('effective_to')
                                           ->orWhere('effective_to', '>', $date);
                                 })
                                 ->orderBy('effective_from', 'desc')
                                 ->first();

        return $model ? $this->toDomainEntity($model) : null;
    }

    public function expireActiveRates(UUID $productId, DateTimeImmutable $effectiveTo): void
    {
        ProductRateModel::where('product_id', $productId->value())
                       ->where('active', true)
                       ->whereNull('effective_to')
                       ->update([
                           'effective_to' => $effectiveTo,
                           'active' => false,
                       ]);
    }

    private function toDomainEntity(ProductRateModel $model): ProductRate
    {
        return ProductRate::reconstitute(
            $model->id,
            $model->product_id,
            (float) $model->rate_amount,
            $model->currency,
            new DateTimeImmutable($model->effective_from),
            $model->effective_to ? new DateTimeImmutable($model->effective_to) : null,
            $model->active,
            new DateTimeImmutable($model->created_at),
            $model->version
        );
    }
}
