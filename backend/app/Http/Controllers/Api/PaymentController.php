<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['supplier', 'processor']);

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->input('supplier_id'));
        }

        if ($request->filled('payment_type')) {
            $query->where('payment_type', $request->input('payment_type'));
        }

        if ($request->filled('from_date')) {
            $query->where('payment_date', '>=', $request->input('from_date'));
        }

        if ($request->filled('to_date')) {
            $query->where('payment_date', '<=', $request->input('to_date'));
        }

        $payments = $query->latest('payment_date')
            ->paginate($request->input('per_page', 15));

        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'payment_type' => 'required|in:advance,partial,full,adjustment',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string',
            'reference_number' => 'nullable|string',
            'notes' => 'nullable|string',
            'client_uuid' => 'nullable|string|unique:payments,client_uuid',
            'device_id' => 'nullable|string',
        ]);

        $validated['processed_by'] = $request->user()->id;

        $payment = Payment::create($validated);

        // Update supplier balance
        $payment->supplier->balance?->recalculate();

        AuditLog::log('payment', $payment->id, 'created', null, $payment->toArray());

        return response()->json($payment->load(['supplier', 'processor']), 201);
    }

    public function show(Payment $payment)
    {
        return response()->json($payment->load(['supplier', 'processor']));
    }

    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'payment_type' => 'sometimes|in:advance,partial,full,adjustment',
            'amount' => 'sometimes|numeric|min:0',
            'payment_date' => 'sometimes|date',
            'payment_method' => 'sometimes|string',
            'reference_number' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $oldValues = $payment->toArray();
        $payment->update($validated);

        // Update supplier balance
        $payment->supplier->balance?->recalculate();

        AuditLog::log('payment', $payment->id, 'updated', $oldValues, $payment->fresh()->toArray());

        return response()->json($payment->fresh()->load(['supplier', 'processor']));
    }

    public function destroy(Payment $payment)
    {
        AuditLog::log('payment', $payment->id, 'deleted', $payment->toArray(), null);

        $supplierId = $payment->supplier_id;
        $payment->delete();

        // Update supplier balance
        \App\Models\Supplier::find($supplierId)?->balance?->recalculate();

        return response()->json(['message' => 'Payment deleted successfully']);
    }
}
