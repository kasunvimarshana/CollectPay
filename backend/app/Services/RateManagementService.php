<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Rate;
use Illuminate\Support\Facades\DB;

class RateManagementService
{
    /**
     * Create a new rate version for a product.
     * 
     * @param int $productId
     * @param array $rateData
     * @return Rate
     */
    public function createRateVersion(int $productId, array $rateData): Rate
    {
        return DB::transaction(function () use ($productId, $rateData) {
            $product = Product::findOrFail($productId);

            // Close any existing open-ended rates for this product/unit combination
            $this->closeExistingRates($productId, $rateData['unit'], $rateData['effective_from']);

            // Create new rate
            return Rate::create(array_merge($rateData, [
                'product_id' => $productId,
            ]));
        });
    }

    /**
     * Close existing open-ended rates when a new rate starts.
     * 
     * @param int $productId
     * @param string $unit
     * @param string $newEffectiveFrom
     * @return void
     */
    protected function closeExistingRates(int $productId, string $unit, string $newEffectiveFrom): void
    {
        $previousDay = date('Y-m-d', strtotime($newEffectiveFrom . ' -1 day'));

        Rate::where('product_id', $productId)
            ->where('unit', $unit)
            ->whereNull('effective_to')
            ->where('effective_from', '<', $newEffectiveFrom)
            ->update(['effective_to' => $previousDay]);
    }

    /**
     * Get the current applicable rate for a product.
     * 
     * @param int $productId
     * @param string $unit
     * @param string|null $date
     * @return Rate|null
     */
    public function getCurrentRate(int $productId, string $unit, ?string $date = null): ?Rate
    {
        $date = $date ?? now()->toDateString();

        return Rate::where('product_id', $productId)
            ->where('unit', $unit)
            ->where('effective_from', '<=', $date)
            ->where(function($query) use ($date) {
                $query->whereNull('effective_to')
                      ->orWhere('effective_to', '>=', $date);
            })
            ->orderBy('effective_from', 'desc')
            ->first();
    }

    /**
     * Get rate history for a product.
     * 
     * @param int $productId
     * @param string|null $unit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getRateHistory(int $productId, ?string $unit = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = Rate::where('product_id', $productId)
            ->orderBy('effective_from', 'desc');

        if ($unit) {
            $query->where('unit', $unit);
        }

        return $query->get();
    }

    /**
     * Update a rate (closes old one and creates new version).
     * 
     * @param int $rateId
     * @param array $newData
     * @return Rate
     */
    public function updateRate(int $rateId, array $newData): Rate
    {
        return DB::transaction(function () use ($rateId, $newData) {
            $oldRate = Rate::findOrFail($rateId);

            // Close the old rate if it's still open
            if (!$oldRate->effective_to) {
                $oldRate->update(['effective_to' => now()->toDateString()]);
            }

            // Create new rate version
            return $this->createRateVersion($oldRate->product_id, array_merge([
                'unit' => $oldRate->unit,
                'effective_from' => now()->addDay()->toDateString(),
            ], $newData));
        });
    }

    /**
     * Check if a product has a valid rate for a given date.
     * 
     * @param int $productId
     * @param string $unit
     * @param string|null $date
     * @return bool
     */
    public function hasValidRate(int $productId, string $unit, ?string $date = null): bool
    {
        return $this->getCurrentRate($productId, $unit, $date) !== null;
    }

    /**
     * Get all units that have rates for a product.
     * 
     * @param int $productId
     * @return array
     */
    public function getAvailableUnitsForProduct(int $productId): array
    {
        return Rate::where('product_id', $productId)
            ->distinct()
            ->pluck('unit')
            ->toArray();
    }
}
