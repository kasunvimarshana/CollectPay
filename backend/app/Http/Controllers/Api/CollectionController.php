<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use Illuminate\Http\Request;

class CollectionController extends Controller
{
    /**
     * Get all collections for authenticated user
     */
    public function index(Request $request)
    {
        $query = Collection::with(['supplier', 'product', 'user'])
            ->where('user_id', $request->user()->id);

        // Filter by date range if provided
        if ($request->has('from_date')) {
            $query->where('collection_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('collection_date', '<=', $request->to_date);
        }

        // Filter by supplier if provided
        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        $collections = $query->orderBy('collection_date', 'desc')->paginate(50);

        return response()->json($collections);
    }

    /**
     * Store a new collection
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'sometimes|string|uuid',
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric|min:0.001',
            'unit' => 'required|string',
            'rate' => 'required|numeric|min:0',
            'amount' => 'required|numeric|min:0',
            'collection_date' => 'required|date',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $validated['user_id'] = $request->user()->id;

        $collection = Collection::create($validated);
        $collection->load(['supplier', 'product', 'user']);

        return response()->json($collection, 201);
    }

    /**
     * Get a specific collection
     */
    public function show(Request $request, Collection $collection)
    {
        // Check if user has access to this collection
        if ($collection->user_id !== $request->user()->id && !$request->user()->hasAnyRole(['admin', 'supervisor'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $collection->load(['supplier', 'product', 'user', 'payments']);

        return response()->json($collection);
    }

    /**
     * Update a collection
     */
    public function update(Request $request, Collection $collection)
    {
        // Check if user has access to this collection
        if ($collection->user_id !== $request->user()->id && !$request->user()->hasAnyRole(['admin', 'supervisor'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'supplier_id' => 'sometimes|exists:suppliers,id',
            'product_id' => 'sometimes|exists:products,id',
            'quantity' => 'sometimes|numeric|min:0.001',
            'unit' => 'sometimes|string',
            'rate' => 'sometimes|numeric|min:0',
            'amount' => 'sometimes|numeric|min:0',
            'collection_date' => 'sometimes|date',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $collection->update($validated);
        $collection->load(['supplier', 'product', 'user']);

        return response()->json($collection);
    }

    /**
     * Delete a collection
     */
    public function destroy(Request $request, Collection $collection)
    {
        // Check if user has access to this collection
        if ($collection->user_id !== $request->user()->id && !$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $collection->delete();

        return response()->json(['message' => 'Collection deleted successfully']);
    }
}
