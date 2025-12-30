<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    /**
     * Display a listing of products
     */
    public function index(Request $request)
    {
        $query = Product::query();
        
        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }
        
        // Search by name or code
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }
        
        // Pagination
        $perPage = $request->get('per_page', 15);
        $products = $query->latest()->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    /**
     * Store a newly created product
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:products',
            'description' => 'nullable|string',
            'base_unit' => 'required|string|max:50',
            'supported_units' => 'nullable|array',
            'supported_units.*' => 'string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $product = Product::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => $product
        ], 201);
    }

    /**
     * Display the specified product
     */
    public function show(Product $product)
    {
        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    /**
     * Update the specified product
     */
    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:255|unique:products,code,' . $product->id,
            'description' => 'nullable|string',
            'base_unit' => 'sometimes|required|string|max:50',
            'supported_units' => 'nullable|array',
            'supported_units.*' => 'string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $product->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product
        ]);
    }

    /**
     * Remove the specified product
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }

    /**
     * Get current rate for the product
     */
    public function currentRate(Request $request, Product $product)
    {
        $date = $request->get('date');
        $unit = $request->get('unit', $product->base_unit);
        
        $rate = $product->getCurrentRate($date, $unit);

        return response()->json([
            'success' => true,
            'data' => [
                'product' => $product,
                'rate' => $rate,
                'date' => $date ?? now()->toDateString(),
                'unit' => $unit,
            ]
        ]);
    }

    /**
     * Get rate history for the product
     */
    public function rateHistory(Request $request, Product $product)
    {
        $unit = $request->get('unit');
        $history = $product->rateHistory($unit);

        return response()->json([
            'success' => true,
            'data' => [
                'product' => $product,
                'unit' => $unit ?? 'all',
                'rates' => $history,
            ]
        ]);
    }
}
