<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class CollectionController extends Controller
{
    public function index(Request $request)
    {
        $query = Collection::with(['supplier', 'product', 'rate', 'collector']);

        if ($request->has('supplier_id')) {
            $query->forSupplier($request->supplier_id);
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('from_date') && $request->has('to_date')) {
            $query->forDateRange($request->from_date, $request->to_date);
        }

        if ($request->has('collector_id')) {
            $query->where('collector_id', $request->collector_id);
        }

        if ($request->has('sync_status')) {
            $query->where('sync_status', $request->sync_status);
        }

        $collections = $query->orderBy('collection_date', 'desc')
            ->paginate($request->per_page ?? 50);

        return response()->json([
            'success' => true,
            'collections' => $collections,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'uuid' => 'nullable|string|unique:collections,uuid',
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
            'collection_date' => 'required|date',
            'quantity' => 'required|numeric|min:0.001',
            'rate_applied' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            $product = Product::findOrFail($request->product_id);
            
            // Get current rate if not provided
            if (!$request->has('rate_applied')) {
                $rate = $product->getCurrentRate(
                    $request->supplier_id,
                    $request->collection_date
                );
                
                if (!$rate) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No active rate found for this product and date',
                    ], 422);
                }
                
                $rateApplied = $rate->rate;
                $rateId = $rate->id;
            } else {
                $rateApplied = $request->rate_applied;
                $rateId = $request->rate_id ?? null;
            }

            $amount = bcmul($request->quantity, $rateApplied, 2);

            $collection = Collection::create([
                'uuid' => $request->uuid,
                'supplier_id' => $request->supplier_id,
                'product_id' => $request->product_id,
                'rate_id' => $rateId,
                'collection_date' => $request->collection_date,
                'quantity' => $request->quantity,
                'unit' => $product->unit,
                'rate_applied' => $rateApplied,
                'amount' => $amount,
                'notes' => $request->notes,
                'collector_id' => auth()->id(),
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
                'sync_status' => 'synced',
            ]);

            // Update supplier balance
            $collection->supplier->updateBalance($amount);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Collection created successfully',
                'collection' => $collection->load(['supplier', 'product', 'rate']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create collection',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        $collection = Collection::with(['supplier', 'product', 'rate', 'collector'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'collection' => $collection,
        ]);
    }

    public function update(Request $request, $id)
    {
        $collection = Collection::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'quantity' => 'sometimes|numeric|min:0.001',
            'collection_date' => 'sometimes|date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Revert old amount from supplier balance
            $collection->supplier->updateBalance(-$collection->amount);

            // Update collection
            if ($request->has('quantity')) {
                $newAmount = bcmul($request->quantity, $collection->rate_applied, 2);
                $collection->quantity = $request->quantity;
                $collection->amount = $newAmount;
            }

            if ($request->has('collection_date')) {
                $collection->collection_date = $request->collection_date;
            }

            if ($request->has('notes')) {
                $collection->notes = $request->notes;
            }

            $collection->updated_by = auth()->id();
            $collection->save();

            // Apply new amount to supplier balance
            $collection->supplier->updateBalance($collection->amount);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Collection updated successfully',
                'collection' => $collection->fresh()->load(['supplier', 'product', 'rate']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update collection',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        $collection = Collection::findOrFail($id);

        DB::beginTransaction();
        try {
            // Revert amount from supplier balance
            $collection->supplier->updateBalance(-$collection->amount);

            $collection->updated_by = auth()->id();
            $collection->save();
            $collection->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Collection deleted successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete collection',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
