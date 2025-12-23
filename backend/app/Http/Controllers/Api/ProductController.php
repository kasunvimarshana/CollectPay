<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query();

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

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $products = $query->with(['creator', 'updater'])
            ->orderBy('name')
            ->paginate($request->per_page ?? 50);

        return response()->json([
            'success' => true,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|unique:products,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'unit' => 'required|string|max:50',
            'category' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $product = Product::create(array_merge($request->all(), [
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'product' => $product,
        ], 201);
    }

    public function show($id)
    {
        $product = Product::with(['rates', 'collections'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'product' => $product,
        ]);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|string|unique:products,code,' . $id,
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'unit' => 'sometimes|string|max:50',
            'category' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $product->update(array_merge($request->all(), [
            'updated_by' => auth()->id(),
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'product' => $product->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->updated_by = auth()->id();
        $product->save();
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully',
        ]);
    }

    public function currentRate($id, Request $request)
    {
        $product = Product::findOrFail($id);
        $supplierId = $request->query('supplier_id');
        $date = $request->query('date');

        $rate = $product->getCurrentRate($supplierId, $date);

        return response()->json([
            'success' => true,
            'product_id' => $product->id,
            'rate' => $rate,
        ]);
    }
}
