<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RateController extends Controller
{
    public function index(Request $request)
    {
        $query = Rate::with('product');

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('current_only') && $request->current_only) {
            $query->where('valid_from', '<=', now())
                ->where(function ($q) {
                    $q->whereNull('valid_to')
                        ->orWhere('valid_to', '>=', now());
                })
                ->orderBy('valid_from', 'desc');
        }

        $rates = $query->get();

        return response()->json($rates);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'rate' => 'required|numeric|min:0',
            'unit' => 'required|string',
            'valid_from' => 'required|date',
            'valid_to' => 'nullable|date|after:valid_from',
            'is_default' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $rate = Rate::create(array_merge($validator->validated(), [
            'created_by' => auth()->id(),
        ]));

        return response()->json($rate, 201);
    }

    public function show($id)
    {
        $rate = Rate::with('product')->findOrFail($id);

        return response()->json($rate);
    }

    public function update(Request $request, $id)
    {
        $rate = Rate::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'product_id' => 'sometimes|exists:products,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'rate' => 'sometimes|numeric|min:0',
            'unit' => 'sometimes|string',
            'valid_from' => 'sometimes|date',
            'valid_to' => 'nullable|date|after:valid_from',
            'is_default' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $rate->update($validator->validated());

        return response()->json($rate);
    }

    public function destroy($id)
    {
        $rate = Rate::findOrFail($id);
        $rate->delete();

        return response()->json(['message' => 'Rate deleted successfully']);
    }

    public function getEffectiveRate($productId, Request $request)
    {
        $date = $request->input('date', now());
        $supplierId = $request->input('supplier_id');
        $unit = $request->input('unit');

        $query = Rate::where('product_id', $productId)
            ->where('valid_from', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('valid_to')
                    ->orWhere('valid_to', '>=', $date);
            });

        if ($supplierId) {
            $query->where(function ($q) use ($supplierId) {
                $q->where('supplier_id', $supplierId)
                    ->orWhereNull('supplier_id');
            });
        }

        if ($unit) {
            $query->where('unit', $unit);
        }

        $rate = $query->orderBy('supplier_id', 'desc') // Supplier-specific rates first
            ->orderBy('valid_from', 'desc')
            ->first();

        if (! $rate) {
            return response()->json(['message' => 'No rate found for the specified criteria'], 404);
        }

        return response()->json($rate);
    }
}
