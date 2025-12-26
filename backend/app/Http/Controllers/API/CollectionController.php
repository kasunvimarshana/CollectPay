<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CollectionController extends Controller
{
    public function index(Request $request)
    {
        $query = Collection::with(['supplier', 'product', 'user', 'productRate']);

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->input('supplier_id'));
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->input('product_id'));
        }

        if ($request->has('date_from')) {
            $query->where('collection_date', '>=', $request->input('date_from'));
        }

        if ($request->has('date_to')) {
            $query->where('collection_date', '<=', $request->input('date_to'));
        }

        $collections = $query->orderBy('collection_date', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($collections);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
            'collection_date' => 'required|date',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|string|max:255',
            'notes' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            $product = Product::findOrFail($validated['product_id']);
            $currentRate = $product->getCurrentRate($validated['unit']);

            if (!$currentRate) {
                throw ValidationException::withMessages([
                    'product_id' => ['No active rate found for this product and unit.']
                ]);
            }

            $collection = Collection::create([
                'supplier_id' => $validated['supplier_id'],
                'product_id' => $validated['product_id'],
                'user_id' => $request->user()->id,
                'product_rate_id' => $currentRate->id,
                'collection_date' => $validated['collection_date'],
                'quantity' => $validated['quantity'],
                'unit' => $validated['unit'],
                'rate_applied' => $currentRate->rate,
                'total_amount' => $validated['quantity'] * $currentRate->rate,
                'notes' => $validated['notes'] ?? null
            ]);

            DB::commit();
            return response()->json([
                'message' => 'Collection recorded successfully',
                'collection' => $collection->load(['supplier', 'product', 'user', 'productRate'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function show($id)
    {
        $collection = Collection::with(['supplier', 'product', 'user', 'productRate'])
            ->findOrFail($id);
        return response()->json(['collection' => $collection]);
    }

    public function update(Request $request, $id)
    {
        $collection = Collection::findOrFail($id);

        if ($request->has('version') && $collection->version != $request->input('version')) {
            throw ValidationException::withMessages([
                'version' => ['This record has been modified by another user. Please refresh and try again.']
            ]);
        }

        $validated = $request->validate([
            'collection_date' => 'sometimes|required|date',
            'quantity' => 'sometimes|required|numeric|min:0',
            'notes' => 'nullable|string',
            'version' => 'integer'
        ]);

        DB::transaction(function () use ($collection, $validated) {
            if (isset($validated['quantity'])) {
                $validated['total_amount'] = $validated['quantity'] * $collection->rate_applied;
            }
            
            $collection->update($validated);
            $collection->increment('version');
        });

        return response()->json([
            'message' => 'Collection updated successfully',
            'collection' => $collection->fresh()->load(['supplier', 'product', 'user'])
        ]);
    }

    public function destroy($id)
    {
        $collection = Collection::findOrFail($id);
        $collection->delete();
        return response()->json(['message' => 'Collection deleted successfully']);
    }
}
