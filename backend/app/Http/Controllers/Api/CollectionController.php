<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\Product;
use Illuminate\Http\Request;

class CollectionController extends Controller
{
    public function index(Request $request)
    {
        $query = Collection::with(['supplier', 'product', 'user']);

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('sync_status')) {
            $query->where('sync_status', $request->sync_status);
        }

        if ($request->has('date_from')) {
            $query->where('collection_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('collection_date', '<=', $request->date_to);
        }

        $collections = $query->orderBy('collection_date', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($collections);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric|min:0.001',
            'unit' => 'required|in:g,kg,ml,l',
            'rate' => 'nullable|numeric|min:0',
            'collection_date' => 'required|date',
            'notes' => 'nullable|string',
            'device_id' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()->id;

        if (!isset($validated['rate'])) {
            $product = Product::find($validated['product_id']);
            $validated['rate'] = $product->getCurrentRate();
        }

        $collection = Collection::create($validated);
        $collection->load(['supplier', 'product', 'user']);

        return response()->json($collection, 201);
    }

    public function show(Collection $collection)
    {
        $collection->load(['supplier', 'product', 'user']);

        return response()->json($collection);
    }

    public function update(Request $request, Collection $collection)
    {
        $validated = $request->validate([
            'supplier_id' => 'sometimes|required|exists:suppliers,id',
            'product_id' => 'sometimes|required|exists:products,id',
            'quantity' => 'sometimes|required|numeric|min:0.001',
            'unit' => 'sometimes|required|in:g,kg,ml,l',
            'rate' => 'sometimes|required|numeric|min:0',
            'collection_date' => 'sometimes|required|date',
            'notes' => 'nullable|string',
        ]);

        $collection->update($validated);
        $collection->load(['supplier', 'product', 'user']);

        return response()->json($collection);
    }

    public function destroy(Collection $collection)
    {
        $collection->delete();

        return response()->json([
            'message' => 'Collection deleted successfully',
        ]);
    }
}
