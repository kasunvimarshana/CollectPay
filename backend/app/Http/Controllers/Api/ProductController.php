<?php

namespace App\Http\Controllers\Api;

use App\Domain\Product\Models\Product;
use App\Domain\Product\Models\ProductRate;
use Illuminate\Http\Request;

class ProductController extends ApiController
{
    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->boolean('with_current_rate')) {
            $query->with('currentRate');
        }

        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = min($request->get('per_page', 20), 100);
        $products = $query->paginate($perPage);

        return $this->paginated($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'category' => ['nullable', 'string', 'max:100'],
            'primary_unit' => ['required', 'string', 'max:20'],
            'supported_units' => ['nullable', 'array'],
            'supported_units.*.unit' => ['required_with:supported_units', 'string'],
            'supported_units.*.factor' => ['required_with:supported_units', 'numeric', 'gt:0'],
            'client_id' => ['nullable', 'uuid'],
        ]);

        $validated['created_by'] = $request->user()->id;

        $product = Product::create($validated);

        return $this->created($product, 'Product created successfully');
    }

    public function show(Product $product)
    {
        $product->load(['currentRate', 'rates' => function ($q) {
            $q->orderBy('effective_from', 'desc')->limit(10);
        }]);

        return $this->success($product);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'category' => ['nullable', 'string', 'max:100'],
            'primary_unit' => ['sometimes', 'string', 'max:20'],
            'supported_units' => ['nullable', 'array'],
            'supported_units.*.unit' => ['required_with:supported_units', 'string'],
            'supported_units.*.factor' => ['required_with:supported_units', 'numeric', 'gt:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $product->update($validated);

        return $this->success($product->fresh(), 'Product updated successfully');
    }

    public function destroy(Product $product)
    {
        if ($product->collections()->exists()) {
            return $this->error(
                'Cannot delete product with existing collections. Deactivate instead.',
                422
            );
        }

        $product->delete();

        return $this->success(null, 'Product deleted successfully');
    }

    // Rate management
    public function rates(Product $product, Request $request)
    {
        $query = $product->rates();

        if ($request->boolean('current_only')) {
            $query->current();
        }

        if ($request->has('active_on')) {
            $query->activeOn($request->active_on);
        }

        $rates = $query->orderBy('effective_from', 'desc')
            ->paginate($request->get('per_page', 20));

        return $this->paginated($rates);
    }

    public function storeRate(Request $request, Product $product)
    {
        $validated = $request->validate([
            'rate' => ['required', 'numeric', 'gt:0'],
            'currency' => ['nullable', 'string', 'max:3'],
            'effective_from' => ['required', 'date'],
            'effective_to' => ['nullable', 'date', 'after:effective_from'],
            'is_current' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:500'],
            'client_id' => ['nullable', 'uuid'],
        ]);

        $validated['product_id'] = $product->id;
        $validated['created_by'] = $request->user()->id;
        $validated['currency'] = $validated['currency'] ?? 'LKR';

        // If no current rate exists, make this one current
        if (!$product->currentRate()->exists()) {
            $validated['is_current'] = true;
        }

        $rate = ProductRate::create($validated);

        return $this->created($rate, 'Rate created successfully');
    }

    public function updateRate(Request $request, Product $product, ProductRate $rate)
    {
        // Verify rate belongs to product
        if ($rate->product_id !== $product->id) {
            return $this->notFound('Rate not found for this product');
        }

        $validated = $request->validate([
            'rate' => ['sometimes', 'numeric', 'gt:0'],
            'effective_from' => ['sometimes', 'date'],
            'effective_to' => ['nullable', 'date', 'after:effective_from'],
            'is_current' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $rate->update($validated);

        return $this->success($rate->fresh(), 'Rate updated successfully');
    }

    public function deleteRate(Product $product, ProductRate $rate)
    {
        if ($rate->product_id !== $product->id) {
            return $this->notFound('Rate not found for this product');
        }

        // Check if rate is used in collections
        $usedInCollections = \App\Domain\Collection\Models\Collection::where('rate_id', $rate->id)->exists();
        if ($usedInCollections) {
            return $this->error('Cannot delete rate that is used in collections', 422);
        }

        $rate->delete();

        return $this->success(null, 'Rate deleted successfully');
    }

    public function currentRate(Product $product)
    {
        $rate = $product->getActiveRate();

        if (!$rate) {
            return $this->notFound('No active rate found for this product');
        }

        return $this->success($rate);
    }

    public function categories()
    {
        $categories = Product::select('category')
            ->whereNotNull('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return $this->success($categories);
    }
}
