<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ProductRate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductRateController extends Controller
{
    public function index(Request $request)
    {
        $query = ProductRate::with(['product', 'creator']);

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $rates = $query->latest()->paginate($request->per_page ?? 15);
        return response()->json($rates);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'unit' => 'required|string|max:20',
            'rate' => 'required|numeric|min:0',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $rate = ProductRate::create([
            ...$request->all(),
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Product rate created successfully',
            'data' => $rate->load(['product', 'creator']),
        ], 201);
    }

    public function show(string $id)
    {
        $rate = ProductRate::with(['product', 'creator'])->findOrFail($id);
        return response()->json($rate);
    }

    public function update(Request $request, string $id)
    {
        $rate = ProductRate::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'product_id' => 'sometimes|required|exists:products,id',
            'unit' => 'sometimes|required|string|max:20',
            'rate' => 'sometimes|required|numeric|min:0',
            'effective_from' => 'sometimes|required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $rate->update($request->all());

        return response()->json([
            'message' => 'Product rate updated successfully',
            'data' => $rate->load(['product', 'creator']),
        ]);
    }

    public function destroy(string $id)
    {
        $rate = ProductRate::findOrFail($id);
        $rate->delete();

        return response()->json(['message' => 'Product rate deleted successfully']);
    }
}
