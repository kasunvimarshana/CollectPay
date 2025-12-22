<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * Get all payments for authenticated user
     */
    public function index(Request $request)
    {
        $query = Payment::with(['supplier', 'collection', 'user'])
            ->where('user_id', $request->user()->id);

        // Filter by date range if provided
        if ($request->has('from_date')) {
            $query->where('payment_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('payment_date', '<=', $request->to_date);
        }

        // Filter by supplier if provided
        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        // Filter by payment type if provided
        if ($request->has('payment_type')) {
            $query->where('payment_type', $request->payment_type);
        }

        $payments = $query->orderBy('payment_date', 'desc')->paginate(50);

        return response()->json($payments);
    }

    /**
     * Store a new payment
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'sometimes|string|uuid',
            'supplier_id' => 'required|exists:suppliers,id',
            'collection_id' => 'nullable|exists:collections,id',
            'payment_type' => 'required|string|in:advance,partial,full',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'nullable|string|in:cash,bank_transfer,check',
            'reference_number' => 'nullable|string',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $validated['user_id'] = $request->user()->id;

        $payment = Payment::create($validated);
        $payment->load(['supplier', 'collection', 'user']);

        return response()->json($payment, 201);
    }

    /**
     * Get a specific payment
     */
    public function show(Request $request, Payment $payment)
    {
        // Check if user has access to this payment
        if ($payment->user_id !== $request->user()->id && !$request->user()->hasAnyRole(['admin', 'supervisor'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $payment->load(['supplier', 'collection', 'user']);

        return response()->json($payment);
    }

    /**
     * Update a payment
     */
    public function update(Request $request, Payment $payment)
    {
        // Check if user has access to this payment
        if ($payment->user_id !== $request->user()->id && !$request->user()->hasAnyRole(['admin', 'supervisor'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'supplier_id' => 'sometimes|exists:suppliers,id',
            'collection_id' => 'nullable|exists:collections,id',
            'payment_type' => 'sometimes|string|in:advance,partial,full',
            'amount' => 'sometimes|numeric|min:0.01',
            'payment_date' => 'sometimes|date',
            'payment_method' => 'nullable|string|in:cash,bank_transfer,check',
            'reference_number' => 'nullable|string',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $payment->update($validated);
        $payment->load(['supplier', 'collection', 'user']);

        return response()->json($payment);
    }

    /**
     * Delete a payment
     */
    public function destroy(Request $request, Payment $payment)
    {
        // Check if user has access to this payment
        if ($payment->user_id !== $request->user()->id && !$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $payment->delete();

        return response()->json(['message' => 'Payment deleted successfully']);
    }

    /**
     * Get payment summary for a supplier
     */
    public function summary(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date',
        ]);

        $query = Payment::where('supplier_id', $request->supplier_id)
            ->where('user_id', $request->user()->id);

        if ($request->has('from_date')) {
            $query->where('payment_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->where('payment_date', '<=', $request->to_date);
        }

        $summary = [
            'total_amount' => $query->sum('amount'),
            'advance_amount' => (clone $query)->where('payment_type', 'advance')->sum('amount'),
            'partial_amount' => (clone $query)->where('payment_type', 'partial')->sum('amount'),
            'full_amount' => (clone $query)->where('payment_type', 'full')->sum('amount'),
            'payment_count' => $query->count(),
        ];

        return response()->json($summary);
    }
}
