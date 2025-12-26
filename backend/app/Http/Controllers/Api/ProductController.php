<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('rates');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $perPage = $request->get('per_page', 15);
        $products = $query->orderBy('name')->paginate($perPage);

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:products,code',
            'description' => 'nullable|string',
            'default_unit' => 'required|string|max:50',
            'supported_units' => 'nullable|array',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $product = DB::transaction(function () use ($validated) {
            return Product::create($validated);
        });

        return response()->json($product, 201);
    }

    public function show(string $id)
    {
        $product = Product::with(['rates' => function ($query) {
            $query->orderBy('effective_date', 'desc');
        }])->findOrFail($id);

        return response()->json($product);
    }

    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:255|unique:products,code,' . $id,
            'description' => 'nullable|string',
            'default_unit' => 'sometimes|required|string|max:50',
            'supported_units' => 'nullable|array',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
            'version' => 'required|integer',
        ]);

        DB::transaction(function () use ($product, $validated) {
            if ($product->version != $validated['version']) {
                throw new \Exception('Version mismatch. Please refresh and try again.');
            }

            $validated['version'] = $product->version + 1;
            $product->update($validated);
        });

        return response()->json($product);
    }

    public function destroy(string $id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
