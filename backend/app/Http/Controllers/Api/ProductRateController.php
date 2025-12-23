<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductRate;
use Illuminate\Http\Request;

class ProductRateController extends Controller
{
    public function index(Request $request, Product $product)
    {
        $query = $product->rates();

        if ($request->has('active_only') && $request->active_only) {
            $query->where('effective_from', '<=', now())
                  ->where(function($q) {
                      $q->whereNull('effective_to')
                        ->orWhere('effective_to', '>', now());
                  });
        }

        $rates = $query->orderBy('effective_from', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($rates);
    }

    public function store(Request $request, Product $product)
    {
        $validated = $request->validate([
            'rate' => 'required|numeric|min:0',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
        ]);

        $validated['product_id'] = $product->id;
        $validated['created_by'] = $request->user()->id;

        // Check for overlapping rates
        $overlapping = $product->rates()
            ->where(function($query) use ($validated) {
                $query->where(function($q) use ($validated) {
                    $q->where('effective_from', '<=', $validated['effective_from'])
                      ->where(function($subq) use ($validated) {
                          $subq->whereNull('effective_to')
                               ->orWhere('effective_to', '>', $validated['effective_from']);
                      });
                });
                if (isset($validated['effective_to'])) {
                    $query->orWhere(function($q) use ($validated) {
                        $q->where('effective_from', '<', $validated['effective_to'])
                          ->where(function($subq) use ($validated) {
                              $subq->whereNull('effective_to')
                                   ->orWhere('effective_to', '>', $validated['effective_from']);
                          });
                    });
                }
            })
            ->exists();

        if ($overlapping) {
            return response()->json([
                'message' => 'A rate already exists for the specified date range',
                'errors' => [
                    'effective_from' => ['The effective date range overlaps with an existing rate']
                ]
            ], 422);
        }

        $productRate = ProductRate::create($validated);

        return response()->json($productRate, 201);
    }

    public function show(Product $product, ProductRate $productRate)
    {
        if ($productRate->product_id !== $product->id) {
            return response()->json([
                'message' => 'Product rate not found for this product'
            ], 404);
        }

        $productRate->load('creator');
        return response()->json($productRate);
    }

    public function update(Request $request, Product $product, ProductRate $productRate)
    {
        if ($productRate->product_id !== $product->id) {
            return response()->json([
                'message' => 'Product rate not found for this product'
            ], 404);
        }

        $validated = $request->validate([
            'rate' => 'sometimes|required|numeric|min:0',
            'effective_from' => 'sometimes|required|date',
            'effective_to' => 'nullable|date|after:effective_from',
        ]);

        // Check for overlapping rates (excluding current rate)
        if (isset($validated['effective_from']) || isset($validated['effective_to'])) {
            $effectiveFrom = $validated['effective_from'] ?? $productRate->effective_from;
            $effectiveTo = $validated['effective_to'] ?? $productRate->effective_to;

            $overlapping = $product->rates()
                ->where('id', '!=', $productRate->id)
                ->where(function($query) use ($effectiveFrom, $effectiveTo) {
                    $query->where(function($q) use ($effectiveFrom) {
                        $q->where('effective_from', '<=', $effectiveFrom)
                          ->where(function($subq) use ($effectiveFrom) {
                              $subq->whereNull('effective_to')
                                   ->orWhere('effective_to', '>', $effectiveFrom);
                          });
                    });
                    if ($effectiveTo) {
                        $query->orWhere(function($q) use ($effectiveFrom, $effectiveTo) {
                            $q->where('effective_from', '<', $effectiveTo)
                              ->where(function($subq) use ($effectiveFrom) {
                                  $subq->whereNull('effective_to')
                                       ->orWhere('effective_to', '>', $effectiveFrom);
                              });
                        });
                    }
                })
                ->exists();

            if ($overlapping) {
                return response()->json([
                    'message' => 'A rate already exists for the specified date range',
                    'errors' => [
                        'effective_from' => ['The effective date range overlaps with an existing rate']
                    ]
                ], 422);
            }
        }

        $productRate->update($validated);

        return response()->json($productRate);
    }

    public function destroy(Product $product, ProductRate $productRate)
    {
        if ($productRate->product_id !== $product->id) {
            return response()->json([
                'message' => 'Product rate not found for this product'
            ], 404);
        }

        $productRate->delete();

        return response()->json([
            'message' => 'Product rate deleted successfully',
        ]);
    }

    public function getCurrentRate(Product $product)
    {
        $currentRate = $product->getCurrentRate();
        
        return response()->json([
            'product_id' => $product->id,
            'current_rate' => $currentRate,
            'base_rate' => $product->base_rate,
        ]);
    }

    public function getRateAtDate(Request $request, Product $product)
    {
        $validated = $request->validate([
            'date' => 'required|date',
        ]);

        $rate = $product->rates()
            ->where('effective_from', '<=', $validated['date'])
            ->where(function($q) use ($validated) {
                $q->whereNull('effective_to')
                  ->orWhere('effective_to', '>', $validated['date']);
            })
            ->orderBy('effective_from', 'desc')
            ->first();

        $rateValue = $rate ? $rate->rate : $product->base_rate;

        return response()->json([
            'product_id' => $product->id,
            'date' => $validated['date'],
            'rate' => $rateValue,
            'rate_record' => $rate,
        ]);
    }
}
