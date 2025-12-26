<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('rates')->get();

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:255|unique:products',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'base_unit' => 'required|string|max:50',
            'alternate_units' => 'nullable|array',
            'alternate_units.*.unit' => 'required|string',
            'alternate_units.*.factor' => 'required|numeric',
            'status' => 'nullable|in:active,inactive',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product = Product::create($validator->validated());

        return response()->json($product, 201);
    }

    public function show($id)
    {
        $product = Product::with('rates')->findOrFail($id);

        return response()->json($product);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|string|max:255|unique:products,code,'.$id,
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'base_unit' => 'sometimes|string|max:50',
            'alternate_units' => 'nullable|array',
            'alternate_units.*.unit' => 'required|string',
            'alternate_units.*.factor' => 'required|numeric',
            'status' => 'nullable|in:active,inactive',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product->update($validator->validated());

        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }

    public function getCurrentRates($id)
    {
        $product = Product::findOrFail($id);
        $currentRates = $product->rates()
            ->where('effective_from', '<=', now())
            ->orderBy('effective_from', 'desc')
            ->first();

        return response()->json($currentRates);
    }
}
