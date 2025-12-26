<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class CollectionController extends Controller
{
    public function index(Request $request)
    {
        $query = Collection::with(['supplier', 'product', 'productRate', 'collector']);

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('collected_by')) {
            $query->where('collected_by', $request->collected_by);
        }

        if ($request->has('date_from')) {
            $query->where('collection_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('collection_date', '<=', $request->date_to);
        }

        $collections = $query->latest('collection_date')->paginate($request->per_page ?? 15);
        return response()->json($collections);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
            'collection_date' => 'required|date',
            'quantity' => 'required|numeric|min:0.001',
            'unit' => 'required|string|max:20',
            'rate_applied' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $collection = DB::transaction(function () use ($request) {
            return Collection::create([
                ...$request->all(),
                'collected_by' => $request->user()->id,
            ]);
        });

        return response()->json([
            'message' => 'Collection created successfully',
            'data' => $collection->load(['supplier', 'product', 'productRate', 'collector']),
        ], 201);
    }

    public function show(string $id)
    {
        $collection = Collection::with(['supplier', 'product', 'productRate', 'collector'])->findOrFail($id);
        return response()->json($collection);
    }

    public function update(Request $request, string $id)
    {
        $collection = Collection::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'supplier_id' => 'sometimes|required|exists:suppliers,id',
            'product_id' => 'sometimes|required|exists:products,id',
            'collection_date' => 'sometimes|required|date',
            'quantity' => 'sometimes|required|numeric|min:0.001',
            'unit' => 'sometimes|required|string|max:20',
            'rate_applied' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $collection->update($request->all());

        return response()->json([
            'message' => 'Collection updated successfully',
            'data' => $collection->load(['supplier', 'product', 'productRate', 'collector']),
        ]);
    }

    public function destroy(string $id)
    {
        $collection = Collection::findOrFail($id);
        $collection->delete();

        return response()->json(['message' => 'Collection deleted successfully']);
    }
}
