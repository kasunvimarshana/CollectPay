<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Get all products
     */
    public function index(Request $request)
    {
        $query = Product::query();

        // Filter by active status if provided
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search by name or code
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $products = $query->orderBy('name')->paginate(50);

        return response()->json($products);
    }

    /**
     * Store a new product
     */
    public function store(Request $request)
    {
        // Only admins and supervisors can create products
        if (!$request->user()->hasAnyRole(['admin', 'supervisor'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:products',
            'unit' => 'required|string|in:gram,kilogram,liter,milliliter',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'metadata' => 'nullable|array',
        ]);

        $product = Product::create($validated);

        return response()->json($product, 201);
    }

    /**
     * Get a specific product
     */
    public function show(Product $product)
    {
        return response()->json($product);
    }

    /**
     * Update a product
     */
    public function update(Request $request, Product $product)
    {
        // Only admins and supervisors can update products
        if (!$request->user()->hasAnyRole(['admin', 'supervisor'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:products,code,' . $product->id,
            'unit' => 'sometimes|string|in:gram,kilogram,liter,milliliter',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'metadata' => 'nullable|array',
        ]);

        $product->update($validated);

        return response()->json($product);
    }

    /**
     * Delete a product
     */
    public function destroy(Request $request, Product $product)
    {
        // Only admins can delete products
        if (!$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
