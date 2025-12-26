<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rate;
use Illuminate\Http\Request;

class RateController extends Controller
{
    public function index(Request $request)
    {
        $query = Rate::with(['product', 'supplier']);

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('effective_date')) {
            $date = $request->effective_date;
            $query->where('effective_from', '<=', $date)
                ->where(function ($q) use ($date) {
                    $q->whereNull('effective_to')
                        ->orWhere('effective_to', '>=', $date);
                });
        }

        $rates = $query->orderBy('effective_from', 'desc')->paginate(50);

        return response()->json($rates);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'rate' => 'required|numeric|min:0.01',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_active' => 'nullable|boolean',
            'applied_scope' => 'nullable|in:general,supplier_specific',
            'notes' => 'nullable|string',
        ]);

        $rate = Rate::create($request->all());

        return response()->json($rate->load(['product', 'supplier']), 201);
    }

    public function show(Rate $rate)
    {
        $rate->load(['product', 'supplier']);

        return response()->json($rate);
    }

    public function update(Request $request, Rate $rate)
    {
        $request->validate([
            'rate' => 'sometimes|numeric|min:0.01',
            'effective_from' => 'sometimes|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_active' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        $rate->update($request->all());

        return response()->json($rate->load(['product', 'supplier']));
    }

    public function destroy(Rate $rate)
    {
        $rate->delete();

        return response()->json(['message' => 'Rate deleted successfully']);
    }

    /**
     * Get applicable rate for a specific date and product
     */
    public function getApplicable(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'date' => 'required|date',
            'supplier_id' => 'nullable|exists:suppliers,id',
        ]);

        $rate = Rate::getApplicableRate(
            $request->product_id,
            $request->date,
            $request->supplier_id
        );

        if (!$rate) {
            return response()->json([
                'message' => 'No applicable rate found',
            ], 404);
        }

        return response()->json($rate->load(['product', 'supplier']));
    }
}
