<?php

namespace App\Services;

use App\Events\CollectionCreated;
use App\Models\Collection;
use App\Models\Rate;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class CollectionService
{
    public function create(array $data): Collection
    {
        return DB::transaction(function () use ($data) {
            $normalized = UnitConverter::toBase($data['unit'], (float) $data['quantity']);
            $data['quantity'] = $normalized['quantity'];
            $data['unit'] = $normalized['unit'];
            if (!isset($data['collected_at'])) {
                $data['collected_at'] = Carbon::now();
            }
            /** @var Collection $collection */
            $collection = Collection::create($data);

            event(new CollectionCreated($collection));
            return $collection;
        });
    }

    public function currentRate(string $supplierId, string $productId): ?Rate
    {
        return Rate::where('supplier_id', $supplierId)
            ->where('product_id', $productId)
            ->where(function ($q) {
                $q->whereNull('effective_to')->orWhere('effective_to', '>=', now());
            })
            ->orderByDesc('effective_from')
            ->first();
    }
}
