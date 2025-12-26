<?php

namespace App\Services;

use App\Models\Collection;
use App\Models\Rate;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CollectionService
{
    private RateService $rateService;

    public function __construct(RateService $rateService)
    {
        $this->rateService = $rateService;
    }

    /**
     * Create a new collection with automatic rate application
     */
    public function createCollection(array $data): Collection
    {
        return DB::transaction(function () use ($data) {
            // Get applicable rate
            $rate = $this->rateService->getApplicableRate(
                $data['product_id'],
                $data['collection_date'],
                $data['supplier_id'] ?? null
            );

            if (!$rate) {
                throw new \Exception('No applicable rate found for this product and date');
            }

            // Calculate total amount
            $totalAmount = $data['quantity'] * $rate->rate;

            // Create collection
            $collection = Collection::create([
                'uuid' => $data['uuid'] ?? \Illuminate\Support\Str::uuid()->toString(),
                'supplier_id' => $data['supplier_id'],
                'product_id' => $data['product_id'],
                'rate_id' => $rate->id,
                'quantity' => $data['quantity'],
                'rate_applied' => $rate->rate,
                'total_amount' => $totalAmount,
                'collection_date' => $data['collection_date'],
                'collection_time' => $data['collection_time'] ?? now(),
                'notes' => $data['notes'] ?? null,
                'collected_by' => $data['collected_by'] ?? auth()->id(),
            ]);

            Log::info('Collection created', [
                'collection_id' => $collection->id,
                'rate_id' => $rate->id,
                'rate_applied' => $rate->rate,
            ]);

            return $collection->load(['supplier', 'product', 'rate']);
        });
    }

    /**
     * Update a collection (recalculates if rate changed)
     */
    public function updateCollection(Collection $collection, array $data): Collection
    {
        return DB::transaction(function () use ($collection, $data) {
            $needsRecalculation = false;

            // Check if quantity changed
            if (isset($data['quantity']) && $data['quantity'] != $collection->quantity) {
                $needsRecalculation = true;
            }

            // Check if date changed (might affect applicable rate)
            if (isset($data['collection_date']) && $data['collection_date'] != $collection->collection_date) {
                $needsRecalculation = true;
            }

            if ($needsRecalculation) {
                $rate = $this->rateService->getApplicableRate(
                    $collection->product_id,
                    $data['collection_date'] ?? $collection->collection_date,
                    $collection->supplier_id
                );

                if (!$rate) {
                    throw new \Exception('No applicable rate found for updated date');
                }

                $quantity = $data['quantity'] ?? $collection->quantity;
                $data['rate_id'] = $rate->id;
                $data['rate_applied'] = $rate->rate;
                $data['total_amount'] = $quantity * $rate->rate;
            }

            $collection->update($data);

            return $collection->load(['supplier', 'product', 'rate']);
        });
    }

    /**
     * Get collections summary for a supplier
     */
    public function getSupplierCollectionsSummary(int $supplierId, ?string $fromDate = null, ?string $toDate = null): array
    {
        $query = Collection::where('supplier_id', $supplierId)
            ->with(['product']);

        if ($fromDate) {
            $query->where('collection_date', '>=', $fromDate);
        }

        if ($toDate) {
            $query->where('collection_date', '<=', $toDate);
        }

        $collections = $query->get();

        $summary = $collections->groupBy('product_id')->map(function ($items, $productId) {
            $product = $items->first()->product;
            return [
                'product_id' => $productId,
                'product_name' => $product->name,
                'product_unit' => $product->unit,
                'total_quantity' => $items->sum('quantity'),
                'total_amount' => $items->sum('total_amount'),
                'collection_count' => $items->count(),
            ];
        })->values();

        return [
            'supplier_id' => $supplierId,
            'from_date' => $fromDate,
            'to_date' => $toDate,
            'products' => $summary,
            'grand_total' => $collections->sum('total_amount'),
        ];
    }
}
