<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Rate;
use Illuminate\Http\Request;

class RatesController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->authorizeResource(Rate::class, 'rate');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Rate::query();
        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->string('supplier_id'));
        }
        if ($request->filled('product_id')) {
            $query->where('product_id', $request->string('product_id'));
        }
        $user = $request->user();
        if (!$request->filled('supplier_id') && !$user->hasAnyRole(['admin','manager']) && !$user->attr('allow_all_suppliers', false)) {
            $ids = (array) $user->attr('allowed_supplier_ids', []);
            if (!empty($ids)) {
                $query->whereIn('supplier_id', $ids);
            } else {
                $query->whereRaw('1=0');
            }
        }
        return $query->orderByDesc('effective_from')->paginate(50);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
            'price_per_unit' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after_or_equal:effective_from',
        ]);
        $rate = Rate::create($data);
        return response()->json($rate, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Rate $rate)
    {
        return $rate;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Rate $rate)
    {
        $data = $request->validate([
            'price_per_unit' => 'sometimes|numeric|min:0',
            'currency' => 'sometimes|string|size:3',
            'effective_from' => 'sometimes|date',
            'effective_to' => 'nullable|date|after_or_equal:effective_from',
        ]);
        $rate->update($data);
        return $rate;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Rate $rate)
    {
        $rate->delete();
        return response()->noContent();
    }
}
