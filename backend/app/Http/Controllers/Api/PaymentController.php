<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['supplier']);

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('payment_type')) {
            $query->where('payment_type', $request->payment_type);
        }

        if ($request->has('from_date')) {
            $query->where('payment_date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->where('payment_date', '<=', $request->to_date);
        }

        $payments = $query->orderBy('payment_date', 'desc')->get();

        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'uuid' => 'nullable|string|unique:payments,uuid',
            'supplier_id' => 'required|exists:suppliers,id',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_type' => 'required|in:advance,partial,full,adjustment',
            'payment_method' => 'required|string|max:50',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
            'device_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $payment = Payment::create([
                'uuid' => $request->uuid ?? \Illuminate\Support\Str::uuid(),
                'supplier_id' => $request->supplier_id,
                'amount' => $request->amount,
                'payment_type' => $request->payment_type,
                'payment_method' => $request->payment_method,
                'reference_number' => $request->reference_number,
                'payment_date' => $request->payment_date,
                'notes' => $request->notes,
                'metadata' => $request->metadata,
                'created_by' => auth()->id(),
                'device_id' => $request->device_id,
            ]);

            DB::commit();

            return response()->json($payment->load(['supplier']), 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['error' => 'Failed to create payment: '.$e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $payment = Payment::with(['supplier'])->findOrFail($id);

        return response()->json($payment);
    }

    public function update(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'supplier_id' => 'sometimes|exists:suppliers,id',
            'amount' => 'sometimes|numeric|min:0',
            'payment_date' => 'sometimes|date',
            'payment_type' => 'sometimes|in:advance,partial,full,adjustment',
            'payment_method' => 'sometimes|string|max:50',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $payment->update($validator->validated());
            DB::commit();

            return response()->json($payment->load(['supplier']));
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['error' => 'Failed to update payment: '.$e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $payment = Payment::findOrFail($id);

        DB::beginTransaction();
        try {
            $payment->delete();
            DB::commit();

            return response()->json(['message' => 'Payment deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['error' => 'Failed to delete payment: '.$e->getMessage()], 500);
        }
    }
}
