<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Product::query()
            ->orderBy('name')
            ->paginate(50);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'unit_type' => ['required', 'in:mass,volume'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $product = Product::query()->create([
            ...$validated,
            'version' => 1,
        ]);

        return response()->json($product, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Product::query()->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $product = Product::query()->findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'unit_type' => ['sometimes', 'in:mass,volume'],
            'is_active' => ['sometimes', 'boolean'],
            'base_version' => ['sometimes', 'integer'],
        ]);

        if (array_key_exists('base_version', $validated) && (int) $validated['base_version'] !== (int) $product->version) {
            return response()->json(['message' => 'Version conflict.', 'server' => $product], 409);
        }

        unset($validated['base_version']);

        $product->fill($validated);
        $product->version = ((int) $product->version) + 1;
        $product->save();

        return $product;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $product = Product::query()->findOrFail($id);
        $product->version = ((int) $product->version) + 1;
        $product->save();
        $product->delete();

        return response()->json(['ok' => true]);
    }
}
