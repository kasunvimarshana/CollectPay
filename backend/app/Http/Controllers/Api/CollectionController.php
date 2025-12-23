<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\ProductRate;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class CollectionController extends Controller
{
    public function index(Request $request)
    {
        $query = Collection::with(['supplier', 'product', 'collector', 'rate']);

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->input('supplier_id'));
        }

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->input('product_id'));
        }

        if ($request->filled('collector_id')) {
            $query->where('collector_id', $request->input('collector_id'));
        }

        if ($request->filled('from_date')) {
            $query->where('collected_at', '>=', $request->input('from_date'));
        }

        if ($request->filled('to_date')) {
            $query->where('collected_at', '<=', $request->input('to_date'));
        }

        $collections = $query->latest('collected_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($collections);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric|min:0.001',
            'unit' => 'required|in:gram,kilogram,liter,milliliter',
            'collected_at' => 'required|date',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
            'client_uuid' => 'nullable|string|unique:collections,client_uuid',
            'device_id' => 'nullable|string',
        ]);

        // Get applicable rate
        $product = \App\Models\Product::findOrFail($validated['product_id']);
        $rate = $product->getRateForDate($validated['collected_at']);

        if (!$rate) {
            return response()->json([
                'message' => 'No rate available for this product at the specified date.'
            ], 422);
        }

        $validated['collector_id'] = $request->user()->id;
        $validated['rate_id'] = $rate->id;
        $validated['rate_applied'] = $rate->rate;

        $collection = Collection::create($validated);

        // Update supplier balance
        $collection->supplier->balance?->recalculate();

        AuditLog::log('collection', $collection->id, 'created', null, $collection->toArray());

        return response()->json($collection->load(['supplier', 'product', 'collector', 'rate']), 201);
    }

    public function show(Collection $collection)
    {
        return response()->json($collection->load(['supplier', 'product', 'collector', 'rate']));
    }

    public function update(Request $request, Collection $collection)
    {
        $validated = $request->validate([
            'quantity' => 'sometimes|numeric|min:0.001',
            'unit' => 'sometimes|in:gram,kilogram,liter,milliliter',
            'collected_at' => 'sometimes|date',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $oldValues = $collection->toArray();

        // If quantity, unit, or date changed, recalculate rate
        if (isset($validated['quantity']) || isset($validated['unit']) || isset($validated['collected_at'])) {
            $collectedAt = $validated['collected_at'] ?? $collection->collected_at;
            $rate = $collection->product->getRateForDate($collectedAt);

            if (!$rate) {
                return response()->json([
                    'message' => 'No rate available for this product at the specified date.'
                ], 422);
            }

            $validated['rate_id'] = $rate->id;
            $validated['rate_applied'] = $rate->rate;
        }

        $collection->update($validated);

        // Update supplier balance
        $collection->supplier->balance?->recalculate();

        AuditLog::log('collection', $collection->id, 'updated', $oldValues, $collection->fresh()->toArray());

        return response()->json($collection->fresh()->load(['supplier', 'product', 'collector', 'rate']));
    }

    public function destroy(Collection $collection)
    {
        AuditLog::log('collection', $collection->id, 'deleted', $collection->toArray(), null);

        $supplierId = $collection->supplier_id;
        $collection->delete();

        // Update supplier balance
        \App\Models\Supplier::find($supplierId)?->balance?->recalculate();

        return response()->json(['message' => 'Collection deleted successfully']);
    }

    public function myCollections(Request $request)
    {
        $collections = Collection::with(['supplier', 'product', 'rate'])
            ->where('collector_id', $request->user()->id)
            ->latest('collected_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($collections);
    }
}
