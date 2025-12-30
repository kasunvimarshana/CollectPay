<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ProductRate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductRateController extends Controller
{
    /**
     * Display a listing of product rates.
     */
    public function index(Request $request)
    {
        $query = ProductRate::with('product');

        // Filter by product
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->where('effective_from', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->where(function ($q) use ($request) {
                $q->whereNull('effective_to')
                    ->orWhere('effective_to', '<=', $request->to_date);
            });
        }

        $perPage = $request->get('per_page', 15);
        $rates = $query->orderBy('effective_from', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $rates,
        ]);
    }

    /**
     * Store a newly created product rate.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'rate_per_unit' => 'required|numeric|min:0',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $rate = ProductRate::create([
            'product_id' => $request->product_id,
            'rate_per_unit' => $request->rate_per_unit,
            'effective_from' => $request->effective_from,
            'effective_to' => $request->effective_to,
        ]);

        AuditLog::log('create', 'ProductRate', $rate->id, null, $rate->toArray(), 'Product rate created', auth()->id());

        return response()->json([
            'success' => true,
            'message' => 'Product rate created successfully',
            'data' => $rate->load('product'),
        ], 201);
    }

    /**
     * Display the specified product rate.
     */
    public function show(ProductRate $productRate)
    {
        return response()->json([
            'success' => true,
            'data' => $productRate->load('product'),
        ]);
    }

    /**
     * Update the specified product rate.
     */
    public function update(Request $request, ProductRate $productRate)
    {
        $validator = Validator::make($request->all(), [
            'rate_per_unit' => 'sometimes|required|numeric|min:0',
            'effective_from' => 'sometimes|required|date',
            'effective_to' => 'nullable|date|after:effective_from',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $oldData = $productRate->toArray();

        $productRate->update($request->only(['rate_per_unit', 'effective_from', 'effective_to']));

        AuditLog::log('update', 'ProductRate', $productRate->id, $oldData, $productRate->toArray(), 'Product rate updated', auth()->id());

        return response()->json([
            'success' => true,
            'message' => 'Product rate updated successfully',
            'data' => $productRate->load('product'),
        ]);
    }

    /**
     * Remove the specified product rate.
     */
    public function destroy(ProductRate $productRate)
    {
        $oldData = $productRate->toArray();

        $productRate->delete();

        AuditLog::log('delete', 'ProductRate', $productRate->id, $oldData, null, 'Product rate deleted', auth()->id());

        return response()->json([
            'success' => true,
            'message' => 'Product rate deleted successfully',
        ]);
    }
}
