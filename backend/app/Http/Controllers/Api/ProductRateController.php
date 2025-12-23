<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRateRequest;
use App\Models\Product;
use App\Models\ProductRate;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductRateController extends Controller
{
    public function index(Product $product): JsonResponse
    {
        $rates = $product->rates()
            ->with(['creator', 'updater'])
            ->orderBy('effective_from', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $rates,
        ]);
    }

    public function store(StoreProductRateRequest $request, Product $product): JsonResponse
    {
        $rate = ProductRate::create([
            'product_id' => $product->id,
            ...$request->validated(),
            'created_by' => $request->user()->id,
            'version' => 1,
        ]);

        // Log transaction
        Transaction::create([
            'entity_type' => 'rates',
            'entity_id' => $rate->id,
            'user_id' => $request->user()->id,
            'action' => 'create',
            'data_after' => $rate->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $rate->load(['product', 'creator', 'updater']),
            'message' => 'Product rate created successfully',
        ], 201);
    }

    public function show(ProductRate $rate): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $rate->load(['product', 'creator', 'updater']),
        ]);
    }

    public function update(Request $request, ProductRate $rate): JsonResponse
    {
        $request->validate([
            'rate' => 'sometimes|required|numeric|min:0',
            'effective_from' => 'sometimes|required|date',
            'effective_to' => 'sometimes|nullable|date|after:effective_from',
            'is_active' => 'sometimes|boolean',
        ]);

        $before = $rate->toArray();

        $rate->update([
            ...$request->only(['rate', 'effective_from', 'effective_to', 'is_active']),
            'updated_by' => $request->user()->id,
            'version' => $rate->version + 1,
        ]);

        // Log transaction
        Transaction::create([
            'entity_type' => 'rates',
            'entity_id' => $rate->id,
            'user_id' => $request->user()->id,
            'action' => 'update',
            'data_before' => $before,
            'data_after' => $rate->fresh()->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $rate->load(['product', 'creator', 'updater']),
            'message' => 'Product rate updated successfully',
        ]);
    }

    public function destroy(Request $request, ProductRate $rate): JsonResponse
    {
        $before = $rate->toArray();

        // Log transaction before deleting
        Transaction::create([
            'entity_type' => 'rates',
            'entity_id' => $rate->id,
            'user_id' => $request->user()->id,
            'action' => 'delete',
            'data_before' => $before,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $rate->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product rate deleted successfully',
        ]);
    }

    public function current(Request $request, Product $product): JsonResponse
    {
        $unit = $request->query('unit', $product->default_unit);
        $rate = $product->getCurrentRate($unit);

        if (!$rate) {
            return response()->json([
                'success' => false,
                'message' => 'No active rate found for this product and unit',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $rate->load(['product', 'creator', 'updater']),
        ]);
    }
}
