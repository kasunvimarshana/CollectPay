<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Rate;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RateController extends Controller
{
    /**
     * Display a listing of rates
     */
    public function index(Request $request)
    {
        $query = Rate::with('product');
        
        // Filter by product
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }
        
        // Filter by unit
        if ($request->has('unit')) {
            $query->where('unit', $request->unit);
        }
        
        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }
        
        // Filter by date range
        if ($request->has('date')) {
            $date = $request->date;
            $query->where('effective_from', '<=', $date)
                ->where(function($q) use ($date) {
                    $q->whereNull('effective_to')
                      ->orWhere('effective_to', '>=', $date);
                });
        }
        
        // Pagination
        $perPage = $request->get('per_page', 15);
        $rates = $query->latest('effective_from')->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $rates
        ]);
    }

    /**
     * Store a newly created rate
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'rate' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Get the latest version for this product and unit
        $latestVersion = Rate::where('product_id', $request->product_id)
            ->where('unit', $request->unit)
            ->max('version') ?? 0;

        $rate = Rate::create(array_merge(
            $request->all(),
            ['version' => $latestVersion + 1]
        ));

        $rate->load('product');

        return response()->json([
            'success' => true,
            'message' => 'Rate created successfully',
            'data' => $rate
        ], 201);
    }

    /**
     * Display the specified rate
     */
    public function show(Rate $rate)
    {
        $rate->load('product');
        
        return response()->json([
            'success' => true,
            'data' => $rate
        ]);
    }

    /**
     * Update the specified rate
     */
    public function update(Request $request, Rate $rate)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'sometimes|required|exists:products,id',
            'rate' => 'sometimes|required|numeric|min:0',
            'unit' => 'sometimes|required|string|max:50',
            'effective_from' => 'sometimes|required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $rate->update($request->all());
        $rate->load('product');

        return response()->json([
            'success' => true,
            'message' => 'Rate updated successfully',
            'data' => $rate
        ]);
    }

    /**
     * Remove the specified rate
     */
    public function destroy(Rate $rate)
    {
        // Check if rate is used in collections
        if ($rate->collections()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete rate that is used in collections'
            ], 422);
        }

        $rate->delete();

        return response()->json([
            'success' => true,
            'message' => 'Rate deleted successfully'
        ]);
    }
}
