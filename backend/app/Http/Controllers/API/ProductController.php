<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductRate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    /**
     * Display a listing of products
     */
    public function index(Request $request)
    {
        $query = Product::with('rates');

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $products = $query->paginate($request->input('per_page', 15));

        $products->getCollection()->transform(function ($product) {
            $product->current_rate = $product->getCurrentRate();
            return $product;
        });

        return response()->json($products);
    }

    /**
     * Store a newly created product
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:products,code',
            'description' => 'nullable|string',
            'unit' => 'required|string|max:255',
            'is_active' => 'boolean',
            'rate' => 'nullable|numeric|min:0',
            'rate_effective_from' => 'nullable|date'
        ]);

        DB::beginTransaction();
        try {
            $product = Product::create([
                'name' => $validated['name'],
                'code' => $validated['code'],
                'description' => $validated['description'] ?? null,
                'unit' => $validated['unit'],
                'is_active' => $validated['is_active'] ?? true
            ]);

            if (isset($validated['rate'])) {
                ProductRate::create([
                    'product_id' => $product->id,
                    'rate' => $validated['rate'],
                    'unit' => $validated['unit'],
                    'effective_from' => $validated['rate_effective_from'] ?? now(),
                    'is_active' => true
                ]);
            }

            DB::commit();
            return response()->json([
                'message' => 'Product created successfully',
                'product' => $product->load('rates')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Display the specified product
     */
    public function show($id)
    {
        $product = Product::with(['rates' => function($query) {
            $query->orderBy('effective_from', 'desc');
        }])->findOrFail($id);

        $product->current_rate = $product->getCurrentRate();
        return response()->json(['product' => $product]);
    }

    /**
     * Update the specified product
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        if ($request->has('version') && $product->version != $request->input('version')) {
            throw ValidationException::withMessages([
                'version' => ['This record has been modified by another user. Please refresh and try again.']
            ]);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:255|unique:products,code,' . $id,
            'description' => 'nullable|string',
            'unit' => 'sometimes|required|string|max:255',
            'is_active' => 'boolean',
            'version' => 'integer'
        ]);

        DB::transaction(function () use ($product, $validated) {
            $product->update($validated);
            $product->increment('version');
        });

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product->fresh()->load('rates')
        ]);
    }

    /**
     * Remove the specified product
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }

    /**
     * Add a new rate for a product
     */
    public function addRate(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'rate' => 'required|numeric|min:0',
            'unit' => 'required|string|max:255',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from'
        ]);

        DB::beginTransaction();
        try {
            ProductRate::where('product_id', $product->id)
                ->where('unit', $validated['unit'])
                ->where(function($query) use ($validated) {
                    $query->whereNull('effective_to')
                        ->orWhere('effective_to', '>=', $validated['effective_from']);
                })
                ->update(['effective_to' => $validated['effective_from'], 'is_active' => false]);

            $rate = ProductRate::create([
                'product_id' => $product->id,
                'rate' => $validated['rate'],
                'unit' => $validated['unit'],
                'effective_from' => $validated['effective_from'],
                'effective_to' => $validated['effective_to'] ?? null,
                'is_active' => true
            ]);

            DB::commit();
            return response()->json(['message' => 'Rate added successfully', 'rate' => $rate], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
