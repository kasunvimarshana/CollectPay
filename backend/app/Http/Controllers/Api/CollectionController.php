<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CollectionController extends Controller
{
    public function index(Request $request)
    {
        $query = Collection::with(['supplier', 'product', 'user', 'productRate']);

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('from_date')) {
            $query->where('collection_date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->where('collection_date', '<=', $request->to_date);
        }

        $perPage = $request->get('per_page', 15);
        $collections = $query->orderBy('collection_date', 'desc')->paginate($perPage);

        return response()->json($collections);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
            'collection_date' => 'required|date',
            'quantity' => 'required|numeric|min:0.001',
            'unit' => 'required|string|max:50',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $collection = DB::transaction(function () use ($validated, $request) {
            $product = Product::findOrFail($validated['product_id']);
            $rate = $product->getCurrentRate($validated['unit'], $validated['collection_date']);

            if (!$rate) {
                throw new \Exception('No rate found for this product and unit on the specified date');
            }

            $validated['user_id'] = $request->user()->id;
            $validated['product_rate_id'] = $rate->id;
            $validated['rate_applied'] = $rate->rate;
            $validated['total_amount'] = $validated['quantity'] * $rate->rate;

            return Collection::create($validated);
        });

        return response()->json($collection->load(['supplier', 'product', 'user', 'productRate']), 201);
    }

    public function show(string $id)
    {
        $collection = Collection::with(['supplier', 'product', 'user', 'productRate'])->findOrFail($id);
        return response()->json($collection);
    }

    public function update(Request $request, string $id)
    {
        $collection = Collection::findOrFail($id);

        $validated = $request->validate([
            'supplier_id' => 'sometimes|required|exists:suppliers,id',
            'product_id' => 'sometimes|required|exists:products,id',
            'collection_date' => 'sometimes|required|date',
            'quantity' => 'sometimes|required|numeric|min:0.001',
            'unit' => 'sometimes|required|string|max:50',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
            'version' => 'required|integer',
        ]);

        DB::transaction(function () use ($collection, $validated, $request) {
            if ($collection->version != $validated['version']) {
                throw new \Exception('Version mismatch. Please refresh and try again.');
            }

            if (isset($validated['product_id']) || isset($validated['unit']) || isset($validated['collection_date'])) {
                $productId = $validated['product_id'] ?? $collection->product_id;
                $unit = $validated['unit'] ?? $collection->unit;
                $date = $validated['collection_date'] ?? $collection->collection_date;

                $product = Product::findOrFail($productId);
                $rate = $product->getCurrentRate($unit, $date);

                if (!$rate) {
                    throw new \Exception('No rate found for this product and unit on the specified date');
                }

                $validated['product_rate_id'] = $rate->id;
                $validated['rate_applied'] = $rate->rate;
            }

            if (isset($validated['quantity'])) {
                $validated['total_amount'] = $validated['quantity'] * ($validated['rate_applied'] ?? $collection->rate_applied);
            }

            $validated['version'] = $collection->version + 1;
            $collection->update($validated);
        });

        return response()->json($collection->load(['supplier', 'product', 'user', 'productRate']));
    }

    public function destroy(string $id)
    {
        $collection = Collection::findOrFail($id);
        $collection->delete();

        return response()->json(['message' => 'Collection deleted successfully']);
    }
}
