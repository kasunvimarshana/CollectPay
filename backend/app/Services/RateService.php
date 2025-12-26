<?php

namespace App\Services;

use App\Models\Rate;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class RateService
{
    /**
     * Get applicable rate for a product on a specific date
     * Checks for supplier-specific rates first, then falls back to general rates
     */
    public function getApplicableRate(int $productId, string $date, ?int $supplierId = null): ?Rate
    {
        // Try supplier-specific rate first
        if ($supplierId) {
            $supplierRate = Rate::where('product_id', $productId)
                ->where('supplier_id', $supplierId)
                ->where('applied_scope', 'supplier_specific')
                ->where('is_active', true)
                ->where('effective_from', '<=', $date)
                ->where(function ($query) use ($date) {
                    $query->whereNull('effective_to')
                        ->orWhere('effective_to', '>=', $date);
                })
                ->orderBy('effective_from', 'desc')
                ->first();

            if ($supplierRate) {
                return $supplierRate;
            }
        }

        // Fall back to general rate
        return Rate::where('product_id', $productId)
            ->where('applied_scope', 'general')
            ->whereNull('supplier_id')
            ->where('is_active', true)
            ->where('effective_from', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', $date);
            })
            ->orderBy('effective_from', 'desc')
            ->first();
    }

    /**
     * Get all rate history for a product
     */
    public function getRateHistory(int $productId, ?int $supplierId = null): array
    {
        $query = Rate::where('product_id', $productId)
            ->orderBy('effective_from', 'desc');

        if ($supplierId) {
            $query->where(function ($q) use ($supplierId) {
                $q->where('supplier_id', $supplierId)
                    ->orWhereNull('supplier_id');
            });
        }

        return $query->get()->toArray();
    }

    /**
     * Create a new rate version
     * Automatically closes previous rate's effective_to date
     */
    public function createRateVersion(array $data): Rate
    {
        return DB::transaction(function () use ($data) {
            // Find and close existing active rate
            $existingRate = Rate::where('product_id', $data['product_id'])
                ->where('is_active', true)
                ->where('applied_scope', $data['applied_scope'] ?? 'general');

            if (!empty($data['supplier_id'])) {
                $existingRate->where('supplier_id', $data['supplier_id']);
            } else {
                $existingRate->whereNull('supplier_id');
            }

            $existingRate = $existingRate->whereNull('effective_to')
                ->orderBy('effective_from', 'desc')
                ->first();

            if ($existingRate) {
                // Close the previous rate one day before new rate starts
                $closeDate = \Carbon\Carbon::parse($data['effective_from'])
                    ->subDay()
                    ->toDateString();
                
                $existingRate->update([
                    'effective_to' => $closeDate,
                ]);
            }

            // Create new rate
            return Rate::create([
                'product_id' => $data['product_id'],
                'supplier_id' => $data['supplier_id'] ?? null,
                'rate' => $data['rate'],
                'effective_from' => $data['effective_from'],
                'effective_to' => $data['effective_to'] ?? null,
                'applied_scope' => $data['applied_scope'] ?? 'general',
                'notes' => $data['notes'] ?? null,
                'is_active' => $data['is_active'] ?? true,
                'created_by' => auth()->id(),
            ]);
        });
    }

    /**
     * Get current rates for all active products
     */
    public function getCurrentRates(): array
    {
        $today = now()->toDateString();
        $products = Product::where('is_active', true)->get();

        $rates = [];
        foreach ($products as $product) {
            $rate = $this->getApplicableRate($product->id, $today);
            $rates[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_unit' => $product->unit,
                'current_rate' => $rate ? (float) $rate->rate : null,
                'rate_id' => $rate?->id,
                'effective_from' => $rate?->effective_from?->toDateString(),
            ];
        }

        return $rates;
    }
}
