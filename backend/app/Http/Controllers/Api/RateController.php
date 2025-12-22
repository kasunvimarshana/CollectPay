<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rate;
use Illuminate\Http\Request;

class RateController extends Controller
{
    /**
     * Get rates with optional filtering
     */
    public function index(Request $request)
    {
        $query = Rate::with(['product', 'supplier']);

        // Filter by product
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Filter by supplier
        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        // Filter by date
        if ($request->has('date')) {
            $date = $request->date;
            $query->where('effective_from', '<=', $date)
                  ->where(function($q) use ($date) {
                      $q->whereNull('effective_to')
                        ->orWhere('effective_to', '>=', $date);
                  });
        }

        // Only active rates
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $rates = $query->orderBy('effective_from', 'desc')->paginate(50);

        return response()->json($rates);
    }

    /**
     * Get current rate for product and supplier
     */
    public function current(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'date' => 'nullable|date',
        ]);

        $date = $validated['date'] ?? now()->toDateString();
        
        $query = Rate::with(['product', 'supplier'])
            ->where('product_id', $validated['product_id'])
            ->where('is_active', true)
            ->where('effective_from', '<=', $date)
            ->where(function($q) use ($date) {
                $q->whereNull('effective_to')
                  ->orWhere('effective_to', '>=', $date);
            });

        if (isset($validated['supplier_id'])) {
            $query->where('supplier_id', $validated['supplier_id']);
        } else {
            $query->whereNull('supplier_id');
        }

        $rate = $query->orderBy('effective_from', 'desc')->first();

        if (!$rate) {
            return response()->json(['message' => 'No active rate found'], 404);
        }

        return response()->json($rate);
    }

    /**
     * Store a new rate
     */
    public function store(Request $request)
    {
        // Only admins and supervisors can create rates
        if (!$request->user()->hasAnyRole(['admin', 'supervisor'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'rate' => 'required|numeric|min:0',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_active' => 'sometimes|boolean',
        ]);

        $rate = Rate::create($validated);
        $rate->load(['product', 'supplier']);

        return response()->json($rate, 201);
    }

    /**
     * Update a rate
     */
    public function update(Request $request, Rate $rate)
    {
        // Only admins and supervisors can update rates
        if (!$request->user()->hasAnyRole(['admin', 'supervisor'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'product_id' => 'sometimes|exists:products,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'rate' => 'sometimes|numeric|min:0',
            'effective_from' => 'sometimes|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_active' => 'sometimes|boolean',
        ]);

        $rate->update($validated);
        $rate->load(['product', 'supplier']);

        return response()->json($rate);
    }

    /**
     * Delete a rate
     */
    public function destroy(Request $request, Rate $rate)
    {
        // Only admins can delete rates
        if (!$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rate->delete();

        return response()->json(['message' => 'Rate deleted successfully']);
    }
}
