<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Models\CollectionAuditLog;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CollectionController extends Controller
{
    /**
     * Display a listing of collections
     */
    public function index(Request $request)
    {
        $query = Collection::query()->with(['supplier', 'product', 'collector', 'rate']);

        // Filter by supplier
        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        // Filter by product
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Filter by collector
        if ($request->has('collector_id')) {
            $query->where('collector_id', $request->collector_id);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('collection_date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('collection_date', '<=', $request->end_date);
        }

        $perPage = $request->get('per_page', 15);
        return response()->json($query->orderBy('collection_date', 'desc')->paginate($perPage));
    }

    /**
     * Store a newly created collection
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
            'collection_date' => 'required|date',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|string',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $collection = DB::transaction(function () use ($validated, $request) {
            // Get the product
            $product = Product::findOrFail($validated['product_id']);

            // Get the applicable rate for the collection date
            $rate = $product->getCurrentRate($validated['unit'], $validated['collection_date']);

            if (!$rate) {
                throw new \Exception('No valid rate found for the product and unit on the collection date.');
            }

            // Create the collection
            $collection = Collection::create([
                'supplier_id' => $validated['supplier_id'],
                'product_id' => $validated['product_id'],
                'collector_id' => $request->user()->id,
                'collection_date' => $validated['collection_date'],
                'quantity' => $validated['quantity'],
                'unit' => $validated['unit'],
                'rate_id' => $rate->id,
                'rate_applied' => $rate->rate,
                'notes' => $validated['notes'] ?? null,
                'metadata' => $validated['metadata'] ?? null,
                'version' => 1,
            ]);

            // Create audit log
            CollectionAuditLog::create([
                'collection_id' => $collection->id,
                'action' => 'created',
                'new_data' => $collection->toArray(),
                'user_id' => $request->user()->id,
                'ip_address' => $request->ip(),
            ]);

            return $collection->load(['supplier', 'product', 'collector', 'rate']);
        });

        return response()->json($collection, 201);
    }

    /**
     * Display the specified collection
     */
    public function show($id)
    {
        $collection = Collection::with(['supplier', 'product', 'collector', 'rate', 'payments', 'auditLogs'])
            ->findOrFail($id);

        // Add calculated fields
        $collection->total_allocated = $collection->totalAllocatedPayments();
        $collection->outstanding = $collection->outstandingAmount();

        return response()->json($collection);
    }

    /**
     * Update the specified collection with optimistic locking
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'supplier_id' => 'sometimes|required|exists:suppliers,id',
            'product_id' => 'sometimes|required|exists:products,id',
            'collection_date' => 'sometimes|required|date',
            'quantity' => 'sometimes|required|numeric|min:0',
            'unit' => 'sometimes|required|string',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
            'version' => 'required|integer', // For optimistic locking
        ]);

        $collection = DB::transaction(function () use ($id, $validated, $request) {
            $collection = Collection::lockForUpdate()->findOrFail($id);

            // Check version for optimistic locking
            if ($collection->version !== $validated['version']) {
                throw new \Exception('Collection has been modified by another user. Please refresh and try again.');
            }

            $oldData = $collection->toArray();

            // Update rate if product, unit, or date changed
            if (
                isset($validated['product_id']) ||
                isset($validated['unit']) ||
                isset($validated['collection_date'])
            ) {
                $productId = $validated['product_id'] ?? $collection->product_id;
                $unit = $validated['unit'] ?? $collection->unit;
                $date = $validated['collection_date'] ?? $collection->collection_date;

                $product = Product::findOrFail($productId);
                $rate = $product->getCurrentRate($unit, $date);

                if (!$rate) {
                    throw new \Exception('No valid rate found for the updated product and unit.');
                }

                $validated['rate_id'] = $rate->id;
                $validated['rate_applied'] = $rate->rate;
            }

            // Increment version
            $validated['version'] = $collection->version + 1;

            $collection->update($validated);

            // Create audit log
            CollectionAuditLog::create([
                'collection_id' => $collection->id,
                'action' => 'updated',
                'old_data' => $oldData,
                'new_data' => $collection->fresh()->toArray(),
                'user_id' => $request->user()->id,
                'ip_address' => $request->ip(),
            ]);

            return $collection->load(['supplier', 'product', 'collector', 'rate']);
        });

        return response()->json($collection);
    }

    /**
     * Remove the specified collection
     */
    public function destroy(Request $request, $id)
    {
        $collection = DB::transaction(function () use ($id, $request) {
            $collection = Collection::findOrFail($id);

            // Check if collection has payments
            if ($collection->payments()->count() > 0) {
                throw new \Exception('Cannot delete collection with associated payments.');
            }

            $oldData = $collection->toArray();

            // Create audit log before deletion
            CollectionAuditLog::create([
                'collection_id' => $collection->id,
                'action' => 'deleted',
                'old_data' => $oldData,
                'user_id' => $request->user()->id,
                'ip_address' => $request->ip(),
            ]);

            $collection->delete();

            return $collection;
        });

        return response()->json([
            'message' => 'Collection deleted successfully',
        ]);
    }
}
