<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ProductRate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductRateController extends Controller
{
    public function index(Request $request)
    {
        $query = ProductRate::with('product');

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('unit')) {
            $query->where('unit', $request->unit);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Server-side sorting
        $sortBy = $request->get('sort_by', 'effective_date');
        $sortOrder = $request->get('sort_order', 'desc');
        
        // Validate sort parameters
        $allowedSortFields = ['effective_date', 'rate', 'unit', 'created_at', 'updated_at'];
        $sortBy = in_array($sortBy, $allowedSortFields) ? $sortBy : 'effective_date';
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc']) ? strtolower($sortOrder) : 'desc';
        
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $rates = $query->paginate($perPage);

        return response()->json($rates);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'unit' => 'required|string|max:50',
            'rate' => 'required|numeric|min:0.01',
            'effective_date' => 'required|date',
            'end_date' => 'nullable|date|after:effective_date',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $rate = DB::transaction(function () use ($validated) {
            return ProductRate::create($validated);
        });

        return response()->json($rate->load('product'), 201);
    }

    public function show(string $id)
    {
        $rate = ProductRate::with('product')->findOrFail($id);
        return response()->json($rate);
    }

    public function update(Request $request, string $id)
    {
        $rate = ProductRate::findOrFail($id);

        $validated = $request->validate([
            'product_id' => 'sometimes|required|exists:products,id',
            'unit' => 'sometimes|required|string|max:50',
            'rate' => 'sometimes|required|numeric|min:0.01',
            'effective_date' => 'sometimes|required|date',
            'end_date' => 'nullable|date|after:effective_date',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
            'version' => 'required|integer',
        ]);

        DB::transaction(function () use ($rate, $validated) {
            if ($rate->version != $validated['version']) {
                throw new \Exception('Version mismatch. Please refresh and try again.');
            }

            $validated['version'] = $rate->version + 1;
            $rate->update($validated);
        });

        return response()->json($rate->load('product'));
    }

    public function destroy(string $id)
    {
        $rate = ProductRate::findOrFail($id);
        $rate->delete();

        return response()->json(['message' => 'Product rate deleted successfully']);
    }
}
