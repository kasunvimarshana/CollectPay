<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Models\Payment;
use App\Models\Supplier;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Payment::query()->with(['supplier', 'product', 'creator', 'updater']);

        // Filter by supplier
        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        // Filter by product
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Filter by payment type
        if ($request->has('payment_type')) {
            $query->where('payment_type', $request->payment_type);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('payment_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('payment_date', '<=', $request->to_date);
        }

        // Pagination
        $perPage = min($request->get('per_page', 15), 100);
        $payments = $query->latest('payment_date')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $payments,
        ]);
    }

    public function store(StorePaymentRequest $request): JsonResponse
    {
        $payment = Payment::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
            'version' => 1,
        ]);

        // Log transaction
        Transaction::create([
            'entity_type' => 'payments',
            'entity_id' => $payment->id,
            'user_id' => $request->user()->id,
            'action' => 'create',
            'data_after' => $payment->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $payment->load(['supplier', 'product', 'creator', 'updater']),
            'message' => 'Payment created successfully',
        ], 201);
    }

    public function show(Payment $payment): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $payment->load(['supplier', 'product', 'creator', 'updater']),
        ]);
    }

    public function update(Request $request, Payment $payment): JsonResponse
    {
        $request->validate([
            'amount' => 'sometimes|required|numeric|min:0',
            'payment_type' => 'sometimes|required|in:advance,partial,full',
            'payment_method' => 'sometimes|nullable|in:cash,bank_transfer,check',
            'reference_number' => 'sometimes|nullable|string|max:255',
            'notes' => 'sometimes|nullable|string',
            'payment_date' => 'sometimes|required|date',
        ]);

        $before = $payment->toArray();

        $payment->update([
            ...$request->only(['amount', 'payment_type', 'payment_method', 'reference_number', 'notes', 'payment_date']),
            'updated_by' => $request->user()->id,
            'version' => $payment->version + 1,
        ]);

        // Log transaction
        Transaction::create([
            'entity_type' => 'payments',
            'entity_id' => $payment->id,
            'user_id' => $request->user()->id,
            'action' => 'update',
            'data_before' => $before,
            'data_after' => $payment->fresh()->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $payment->load(['supplier', 'product', 'creator', 'updater']),
            'message' => 'Payment updated successfully',
        ]);
    }

    public function destroy(Request $request, Payment $payment): JsonResponse
    {
        $before = $payment->toArray();

        // Log transaction before deleting
        Transaction::create([
            'entity_type' => 'payments',
            'entity_id' => $payment->id,
            'user_id' => $request->user()->id,
            'action' => 'delete',
            'data_before' => $before,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $payment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Payment deleted successfully',
        ]);
    }

    public function bySupplier(Request $request, Supplier $supplier): JsonResponse
    {
        $query = $supplier->payments()
            ->with(['product', 'creator', 'updater']);

        // Filter by payment type
        if ($request->has('payment_type')) {
            $query->where('payment_type', $request->payment_type);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('payment_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('payment_date', '<=', $request->to_date);
        }

        $perPage = min($request->get('per_page', 15), 100);
        $payments = $query->latest('payment_date')->paginate($perPage);

        // Calculate totals
        $totals = $supplier->payments()
            ->selectRaw('
                SUM(CASE WHEN payment_type = "advance" THEN amount ELSE 0 END) as total_advance,
                SUM(CASE WHEN payment_type = "partial" THEN amount ELSE 0 END) as total_partial,
                SUM(CASE WHEN payment_type = "full" THEN amount ELSE 0 END) as total_full,
                SUM(amount) as total_amount
            ')
            ->first();

        return response()->json([
            'success' => true,
            'data' => $payments,
            'summary' => $totals,
        ]);
    }
}
