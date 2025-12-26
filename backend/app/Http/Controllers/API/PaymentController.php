<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['supplier', 'user']);

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->input('supplier_id'));
        }

        if ($request->has('date_from')) {
            $query->where('payment_date', '>=', $request->input('date_from'));
        }

        if ($request->has('date_to')) {
            $query->where('payment_date', '<=', $request->input('date_to'));
        }

        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        $payments = $query->orderBy('payment_date', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'payment_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'type' => 'required|in:advance,partial,full',
            'reference_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string'
        ]);

        $payment = Payment::create([
            'supplier_id' => $validated['supplier_id'],
            'user_id' => $request->user()->id,
            'payment_date' => $validated['payment_date'],
            'amount' => $validated['amount'],
            'type' => $validated['type'],
            'reference_number' => $validated['reference_number'] ?? null,
            'notes' => $validated['notes'] ?? null
        ]);

        return response()->json([
            'message' => 'Payment recorded successfully',
            'payment' => $payment->load(['supplier', 'user'])
        ], 201);
    }

    public function show($id)
    {
        $payment = Payment::with(['supplier', 'user'])->findOrFail($id);
        return response()->json(['payment' => $payment]);
    }

    public function update(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);

        if ($request->has('version') && $payment->version != $request->input('version')) {
            throw ValidationException::withMessages([
                'version' => ['This record has been modified by another user. Please refresh and try again.']
            ]);
        }

        $validated = $request->validate([
            'payment_date' => 'sometimes|required|date',
            'amount' => 'sometimes|required|numeric|min:0',
            'type' => 'sometimes|required|in:advance,partial,full',
            'reference_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'version' => 'integer'
        ]);

        DB::transaction(function () use ($payment, $validated) {
            $payment->update($validated);
            $payment->increment('version');
        });

        return response()->json([
            'message' => 'Payment updated successfully',
            'payment' => $payment->fresh()->load(['supplier', 'user'])
        ]);
    }

    public function destroy($id)
    {
        $payment = Payment::findOrFail($id);
        $payment->delete();
        return response()->json(['message' => 'Payment deleted successfully']);
    }
}
