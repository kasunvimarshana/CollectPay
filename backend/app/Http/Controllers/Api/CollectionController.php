<?php

namespace App\Http\Controllers\Api;

use App\Models\Collection;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CollectionController extends ApiController
{
    /**
     * Get all collections
     */
    public function index(Request $request)
    {
        $query = Collection::query()
            ->with(['supplier', 'product', 'rate', 'collector']);

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('is_synced')) {
            $query->where('is_synced', $request->boolean('is_synced'));
        }

        if ($request->has('start_date')) {
            $query->where('collection_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('collection_date', '<=', $request->end_date);
        }

        $perPage = $request->get('per_page', 50);
        $collections = $query->orderBy('collection_date', 'desc')->paginate($perPage);

        return $this->success($collections);
    }

    /**
     * Get single collection
     */
    public function show($id)
    {
        $collection = Collection::with([
            'supplier',
            'product',
            'rate',
            'collector',
            'creator'
        ])->find($id);

        if (!$collection) {
            return $this->notFound('Collection not found');
        }

        return $this->success($collection);
    }

    /**
     * Create new collection
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'uuid' => 'sometimes|uuid|unique:collections,uuid',
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
            'collection_date' => 'required|date',
            'quantity' => 'required|numeric|min:0.001',
            'unit' => 'required|string|max:20',
            'rate_applied' => 'sometimes|numeric|min:0',
            'notes' => 'nullable|string',
            'is_synced' => 'sometimes|boolean',
            'version' => 'sometimes|integer',
        ]);

        if (isset($validated['uuid'])) {
            $existing = Collection::where('uuid', $validated['uuid'])->first();
            if ($existing) {
                if (isset($validated['version']) && $existing->version != $validated['version']) {
                    return $this->conflict([
                        'server_version' => $existing->version,
                        'server_data' => $existing->load(['supplier', 'product']),
                    ], 'Version conflict detected');
                }
                return $this->update($request, $existing->id);
            }
        }

        DB::beginTransaction();
        try {
            // Get the current rate if not provided
            if (!isset($validated['rate_applied'])) {
                $product = Product::find($validated['product_id']);
                $rate = $product->getCurrentRate(
                    $validated['supplier_id'],
                    $validated['collection_date']
                );

                if (!$rate) {
                    DB::rollBack();
                    return $this->error('No active rate found for this product and supplier on the collection date', 422);
                }

                $validated['rate_applied'] = $rate->rate;
                $validated['rate_id'] = $rate->id;
            }

            // Calculate total amount
            $validated['total_amount'] = $validated['quantity'] * $validated['rate_applied'];
            $validated['collected_by'] = $request->user()->id;
            $validated['created_by'] = $request->user()->id;

            $collection = Collection::create($validated);

            DB::commit();
            return $this->success(
                $collection->load(['supplier', 'product', 'rate']),
                'Collection created successfully',
                201
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to create collection: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update collection
     */
    public function update(Request $request, $id)
    {
        $collection = Collection::find($id);

        if (!$collection) {
            return $this->notFound('Collection not found');
        }

        $validated = $request->validate([
            'supplier_id' => 'sometimes|exists:suppliers,id',
            'product_id' => 'sometimes|exists:products,id',
            'collection_date' => 'sometimes|date',
            'quantity' => 'sometimes|numeric|min:0.001',
            'unit' => 'sometimes|string|max:20',
            'rate_applied' => 'sometimes|numeric|min:0',
            'notes' => 'nullable|string',
            'is_synced' => 'sometimes|boolean',
            'version' => 'sometimes|integer',
        ]);

        if (isset($validated['version']) && $collection->version != $validated['version']) {
            return $this->conflict([
                'server_version' => $collection->version,
                'server_data' => $collection->load(['supplier', 'product']),
            ], 'Version conflict detected');
        }

        DB::beginTransaction();
        try {
            $validated['updated_by'] = $request->user()->id;
            $collection->update($validated);

            DB::commit();
            return $this->success(
                $collection->load(['supplier', 'product', 'rate']),
                'Collection updated successfully'
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to update collection: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete collection
     */
    public function destroy($id)
    {
        $collection = Collection::find($id);

        if (!$collection) {
            return $this->notFound('Collection not found');
        }

        try {
            $collection->delete();
            return $this->success(null, 'Collection deleted successfully');
        } catch (\Exception $e) {
            return $this->error('Failed to delete collection: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get summary statistics
     */
    public function summary(Request $request)
    {
        $query = Collection::query();

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('start_date')) {
            $query->where('collection_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('collection_date', '<=', $request->end_date);
        }

        $summary = [
            'total_collections' => $query->count(),
            'total_amount' => $query->sum('total_amount'),
            'synced_count' => (clone $query)->where('is_synced', true)->count(),
            'pending_count' => (clone $query)->where('is_synced', false)->count(),
            'by_product' => (clone $query)
                ->select('product_id', DB::raw('SUM(quantity) as total_quantity'), DB::raw('SUM(total_amount) as total_amount'))
                ->with('product:id,name,unit')
                ->groupBy('product_id')
                ->get(),
        ];

        return $this->success($summary);
    }
}
