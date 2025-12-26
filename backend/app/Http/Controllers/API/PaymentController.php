<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['supplier', 'creator']);

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('payment_type')) {
            $query->where('payment_type', $request->payment_type);
        }

        if ($request->has('date_from')) {
            $query->where('payment_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('payment_date', '<=', $request->date_to);
        }

        $payments = $query->latest('payment_date')->paginate($request->per_page ?? 15);
        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'required|exists:suppliers,id',
            'payment_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'payment_type' => 'required|in:advance,partial,full',
            'payment_method' => 'nullable|string|max:50',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payment = DB::transaction(function () use ($request) {
            return Payment::create([
                ...$request->all(),
                'created_by' => $request->user()->id,
            ]);
        });

        return response()->json([
            'message' => 'Payment created successfully',
            'data' => $payment->load(['supplier', 'creator']),
        ], 201);
    }

    public function show(string $id)
    {
        $payment = Payment::with(['supplier', 'creator'])->findOrFail($id);
        return response()->json($payment);
    }

    public function update(Request $request, string $id)
    {
        $payment = Payment::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'supplier_id' => 'sometimes|required|exists:suppliers,id',
            'payment_date' => 'sometimes|required|date',
            'amount' => 'sometimes|required|numeric|min:0',
            'payment_type' => 'sometimes|required|in:advance,partial,full',
            'payment_method' => 'nullable|string|max:50',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payment->update($request->all());

        return response()->json([
            'message' => 'Payment updated successfully',
            'data' => $payment->load(['supplier', 'creator']),
        ]);
    }

    public function destroy(string $id)
    {
        $payment = Payment::findOrFail($id);
        $payment->delete();

        return response()->json(['message' => 'Payment deleted successfully']);
    }
}
