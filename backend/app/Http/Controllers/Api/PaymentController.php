<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['supplier', 'user']);

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('payment_type')) {
            $query->where('payment_type', $request->payment_type);
        }

        if ($request->has('sync_status')) {
            $query->where('sync_status', $request->sync_status);
        }

        if ($request->has('date_from')) {
            $query->where('payment_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('payment_date', '<=', $request->date_to);
        }

        $payments = $query->orderBy('payment_date', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_type' => 'required|in:advance,partial,full',
            'payment_method' => 'required|in:cash,bank_transfer,mobile_money,check',
            'reference_number' => 'nullable|string|max:255',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string',
            'device_id' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()->id;

        $payment = Payment::create($validated);
        $payment->load(['supplier', 'user']);

        return response()->json($payment, 201);
    }

    public function show(Payment $payment)
    {
        $payment->load(['supplier', 'user']);

        return response()->json($payment);
    }

    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'supplier_id' => 'sometimes|required|exists:suppliers,id',
            'amount' => 'sometimes|required|numeric|min:0.01',
            'payment_type' => 'sometimes|required|in:advance,partial,full',
            'payment_method' => 'sometimes|required|in:cash,bank_transfer,mobile_money,check',
            'reference_number' => 'nullable|string|max:255',
            'payment_date' => 'sometimes|required|date',
            'notes' => 'nullable|string',
        ]);

        $payment->update($validated);
        $payment->load(['supplier', 'user']);

        return response()->json($payment);
    }

    public function destroy(Payment $payment)
    {
        $payment->delete();

        return response()->json([
            'message' => 'Payment deleted successfully',
        ]);
    }
}
