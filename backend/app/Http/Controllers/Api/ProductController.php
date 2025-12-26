<?php

namespace App\Http\Controllers\Api;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends ApiController
{
    /**
     * Get all products
     */
    public function index(Request $request)
    {
        $query = Product::query()->with(['creator', 'updater']);

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $perPage = $request->get('per_page', 50);
        $products = $query->orderBy('name')->paginate($perPage);

        return $this->success($products);
    }

    /**
     * Get single product
     */
    public function show($id)
    {
        $product = Product::with(['rates' => function ($query) {
            $query->where('is_active', true)->with('supplier');
        }])->find($id);

        if (!$product) {
            return $this->notFound('Product not found');
        }

        return $this->success($product);
    }

    /**
     * Create new product
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'uuid' => 'sometimes|uuid|unique:products,uuid',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:products,code',
            'description' => 'nullable|string',
            'unit' => 'required|string|max:20',
            'category' => 'nullable|string|max:100',
            'is_active' => 'sometimes|boolean',
            'version' => 'sometimes|integer',
        ]);

        if (isset($validated['uuid'])) {
            $existing = Product::where('uuid', $validated['uuid'])->first();
            if ($existing) {
                if (isset($validated['version']) && $existing->version != $validated['version']) {
                    return $this->conflict([
                        'server_version' => $existing->version,
                        'server_data' => $existing,
                    ], 'Version conflict detected');
                }
                return $this->update($request, $existing->id);
            }
        }

        DB::beginTransaction();
        try {
            $validated['created_by'] = $request->user()->id;
            $product = Product::create($validated);

            DB::commit();
            return $this->success($product, 'Product created successfully', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to create product: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update product
     */
    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return $this->notFound('Product not found');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'nullable|string|max:50|unique:products,code,' . $id,
            'description' => 'nullable|string',
            'unit' => 'sometimes|string|max:20',
            'category' => 'nullable|string|max:100',
            'is_active' => 'sometimes|boolean',
            'version' => 'sometimes|integer',
        ]);

        if (isset($validated['version']) && $product->version != $validated['version']) {
            return $this->conflict([
                'server_version' => $product->version,
                'server_data' => $product,
            ], 'Version conflict detected');
        }

        DB::beginTransaction();
        try {
            $validated['updated_by'] = $request->user()->id;
            $product->update($validated);

            DB::commit();
            return $this->success($product, 'Product updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to update product: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete product
     */
    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return $this->notFound('Product not found');
        }

        try {
            $product->delete();
            return $this->success(null, 'Product deleted successfully');
        } catch (\Exception $e) {
            return $this->error('Failed to delete product: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get current rate for a product and supplier
     */
    public function getCurrentRate(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return $this->notFound('Product not found');
        }

        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'date' => 'nullable|date',
        ]);

        $rate = $product->getCurrentRate(
            $request->supplier_id,
            $request->get('date')
        );

        if (!$rate) {
            return $this->notFound('No active rate found for this product and supplier');
        }

        return $this->success($rate);
    }
}
