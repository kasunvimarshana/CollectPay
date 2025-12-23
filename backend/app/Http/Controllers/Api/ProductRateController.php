<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductRate;
use App\Models\Product;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class ProductRateController extends Controller
{
    public function index()
    {
        $rates = ProductRate::with(['product', 'creator'])
            ->where('is_current', true)
            ->latest()
            ->get();

        return response()->json($rates);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'rate' => 'required|numeric|min:0',
            'unit' => 'required|in:gram,kilogram,liter,milliliter',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'notes' => 'nullable|string',
        ]);

        $validated['created_by'] = $request->user()->id;
        $validated['is_current'] = true;

        $rate = ProductRate::create($validated);

        AuditLog::log('product_rate', $rate->id, 'created', null, $rate->toArray());

        return response()->json($rate->load(['product', 'creator']), 201);
    }

    public function show(ProductRate $productRate)
    {
        return response()->json($productRate->load(['product', 'creator']));
    }

    public function destroy(ProductRate $productRate)
    {
        if ($productRate->is_current) {
            return response()->json([
                'message' => 'Cannot delete current rate. Create a new rate first.'
            ], 422);
        }

        AuditLog::log('product_rate', $productRate->id, 'deleted', $productRate->toArray(), null);

        $productRate->delete();

        return response()->json(['message' => 'Product rate deleted successfully']);
    }

    public function productRates(Product $product)
    {
        $rates = $product->rates()
            ->with('creator')
            ->latest('effective_from')
            ->get();

        return response()->json($rates);
    }
}
