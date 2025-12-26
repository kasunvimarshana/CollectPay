<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductRate;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProductRateController extends Controller
{
    /**
     * Display a listing of product rates
     */
    public function index(Request $request)
    {
        $query = ProductRate::with('product');

        // Filter by product
        if ($request->has('product_id')) {
            $query->where('product_id', $request->input('product_id'));
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Filter by unit
        if ($request->has('unit')) {
            $query->where('unit', $request->input('unit'));
        }

        // Filter by effective date
        if ($request->has('effective_date')) {
            $date = $request->input('effective_date');
            $query->where('effective_from', '<=', $date)
                ->where(function($q) use ($date) {
                    $q->whereNull('effective_to')
                      ->orWhere('effective_to', '>=', $date);
                });
        }

        $rates = $query->orderBy('effective_from', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($rates);
    }

    /**
     * Store a newly created product rate
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'rate' => 'required|numeric|min:0',
            'unit' => 'required|string|max:255',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_active' => 'boolean'
        ]);

        DB::beginTransaction();
        try {
            $product = Product::findOrFail($validated['product_id']);

            // Deactivate overlapping rates for the same unit
            ProductRate::where('product_id', $product->id)
                ->where('unit', $validated['unit'])
                ->where(function($query) use ($validated) {
                    $query->whereNull('effective_to')
                        ->orWhere('effective_to', '>=', $validated['effective_from']);
                })
                ->update(['effective_to' => $validated['effective_from'], 'is_active' => false]);

            $rate = ProductRate::create([
                'product_id' => $validated['product_id'],
                'rate' => $validated['rate'],
                'unit' => $validated['unit'],
                'effective_from' => $validated['effective_from'],
                'effective_to' => $validated['effective_to'] ?? null,
                'is_active' => $validated['is_active'] ?? true
            ]);

            DB::commit();
            return response()->json([
                'message' => 'Product rate created successfully',
                'rate' => $rate->load('product')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Display the specified product rate
     */
    public function show($id)
    {
        $rate = ProductRate::with('product')->findOrFail($id);

        return response()->json([
            'rate' => $rate
        ]);
    }

    /**
     * Update the specified product rate
     */
    public function update(Request $request, $id)
    {
        $rate = ProductRate::findOrFail($id);

        $validated = $request->validate([
            'rate' => 'sometimes|required|numeric|min:0',
            'unit' => 'sometimes|required|string|max:255',
            'effective_from' => 'sometimes|required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_active' => 'boolean'
        ]);

        DB::transaction(function () use ($rate, $validated) {
            $rate->update($validated);
        });

        return response()->json([
            'message' => 'Product rate updated successfully',
            'rate' => $rate->fresh()->load('product')
        ]);
    }

    /**
     * Remove the specified product rate (soft delete)
     */
    public function destroy($id)
    {
        $rate = ProductRate::findOrFail($id);
        
        // Check if this rate is used in any collections
        if ($rate->collections()->exists()) {
            throw ValidationException::withMessages([
                'id' => ['This rate cannot be deleted as it is used in existing collections.']
            ]);
        }

        $rate->delete();

        return response()->json([
            'message' => 'Product rate deleted successfully'
        ]);
    }

    /**
     * Get rate history for a product
     */
    public function history($productId)
    {
        $product = Product::findOrFail($productId);
        
        $rates = ProductRate::where('product_id', $productId)
            ->orderBy('effective_from', 'desc')
            ->get();

        return response()->json([
            'product' => $product,
            'rates' => $rates
        ]);
    }

    /**
     * Get current active rate for a product and unit
     */
    public function current(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'unit' => 'required|string',
            'date' => 'nullable|date'
        ]);

        $date = $validated['date'] ?? now();
        $product = Product::findOrFail($validated['product_id']);

        $rate = $product->getCurrentRate($validated['unit'], $date);

        if (!$rate) {
            return response()->json([
                'message' => 'No active rate found for the specified product, unit, and date',
                'rate' => null
            ], 404);
        }

        return response()->json([
            'rate' => $rate
        ]);
    }
}
