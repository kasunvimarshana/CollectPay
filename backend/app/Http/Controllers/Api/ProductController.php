<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('currentRate');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $products = $query->latest()->paginate($request->input('per_page', 15));

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'unit_type' => 'required|in:weight,volume',
            'primary_unit' => 'required|in:gram,kilogram,liter,milliliter',
            'allowed_units' => 'nullable|array',
            'metadata' => 'nullable|array',
        ]);

        $product = Product::create($validated);

        AuditLog::log('product', $product->id, 'created', null, $product->toArray());

        return response()->json($product, 201);
    }

    public function show(Product $product)
    {
        return response()->json($product->load(['currentRate', 'rates']));
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'metadata' => 'nullable|array',
        ]);

        $oldValues = $product->toArray();
        $product->update($validated);

        AuditLog::log('product', $product->id, 'updated', $oldValues, $product->fresh()->toArray());

        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        AuditLog::log('product', $product->id, 'deleted', $product->toArray(), null);

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }

    public function currentRate(Product $product)
    {
        $rate = $product->currentRate()->first();

        if (!$rate) {
            return response()->json(['message' => 'No current rate available'], 404);
        }

        return response()->json($rate);
    }
}
