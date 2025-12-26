<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\PaymentAuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /**
     * Display a listing of payments
     */
    public function index(Request $request)
    {
        $query = Payment::query()->with(['supplier', 'payer', 'approver']);

        // Filter by supplier
        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        // Filter by payment type
        if ($request->has('payment_type')) {
            $query->where('payment_type', $request->payment_type);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('payment_date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('payment_date', '<=', $request->end_date);
        }

        $perPage = $request->get('per_page', 15);
        return response()->json($query->orderBy('payment_date', 'desc')->paginate($perPage));
    }

    /**
     * Store a newly created payment
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'payment_type' => 'required|string|in:advance,partial,final',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'nullable|string',
            'reference_number' => 'nullable|string',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
            'collection_allocations' => 'nullable|array',
            'collection_allocations.*.collection_id' => 'required|exists:collections,id',
            'collection_allocations.*.amount' => 'required|numeric|min:0',
        ]);

        $payment = DB::transaction(function () use ($validated, $request) {
            // Create the payment
            $payment = Payment::create([
                'supplier_id' => $validated['supplier_id'],
                'payment_type' => $validated['payment_type'],
                'amount' => $validated['amount'],
                'payment_date' => $validated['payment_date'],
                'payment_method' => $validated['payment_method'] ?? null,
                'reference_number' => $validated['reference_number'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'metadata' => $validated['metadata'] ?? null,
                'paid_by' => $request->user()->id,
                'version' => 1,
            ]);

            // Allocate payment to collections if specified
            if (isset($validated['collection_allocations'])) {
                $totalAllocated = 0;

                foreach ($validated['collection_allocations'] as $allocation) {
                    $payment->collections()->attach($allocation['collection_id'], [
                        'allocated_amount' => $allocation['amount'],
                    ]);
                    $totalAllocated += $allocation['amount'];
                }

                // Validate that total allocated doesn't exceed payment amount
                if ($totalAllocated > $payment->amount) {
                    throw new \Exception('Total allocated amount cannot exceed payment amount.');
                }
            }

            // Create audit log
            PaymentAuditLog::create([
                'payment_id' => $payment->id,
                'action' => 'created',
                'new_data' => $payment->toArray(),
                'user_id' => $request->user()->id,
                'ip_address' => $request->ip(),
            ]);

            return $payment->load(['supplier', 'payer', 'collections']);
        });

        return response()->json($payment, 201);
    }

    /**
     * Display the specified payment
     */
    public function show($id)
    {
        $payment = Payment::with(['supplier', 'payer', 'approver', 'collections', 'auditLogs'])
            ->findOrFail($id);

        // Add calculated fields
        $payment->total_allocated = $payment->totalAllocated();
        $payment->unallocated = $payment->unallocatedAmount();

        return response()->json($payment);
    }

    /**
     * Update the specified payment with optimistic locking
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'payment_type' => 'sometimes|required|string|in:advance,partial,final',
            'amount' => 'sometimes|required|numeric|min:0',
            'payment_date' => 'sometimes|required|date',
            'payment_method' => 'nullable|string',
            'reference_number' => 'nullable|string',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
            'version' => 'required|integer',
        ]);

        $payment = DB::transaction(function () use ($id, $validated, $request) {
            $payment = Payment::lockForUpdate()->findOrFail($id);

            // Check version for optimistic locking
            if ($payment->version !== $validated['version']) {
                throw new \Exception('Payment has been modified by another user. Please refresh and try again.');
            }

            $oldData = $payment->toArray();

            // Increment version
            $validated['version'] = $payment->version + 1;

            $payment->update($validated);

            // Create audit log
            PaymentAuditLog::create([
                'payment_id' => $payment->id,
                'action' => 'updated',
                'old_data' => $oldData,
                'new_data' => $payment->fresh()->toArray(),
                'user_id' => $request->user()->id,
                'ip_address' => $request->ip(),
            ]);

            return $payment->load(['supplier', 'payer', 'approver', 'collections']);
        });

        return response()->json($payment);
    }

    /**
     * Remove the specified payment
     */
    public function destroy(Request $request, $id)
    {
        $payment = DB::transaction(function () use ($id, $request) {
            $payment = Payment::findOrFail($id);

            $oldData = $payment->toArray();

            // Create audit log before deletion
            PaymentAuditLog::create([
                'payment_id' => $payment->id,
                'action' => 'deleted',
                'old_data' => $oldData,
                'user_id' => $request->user()->id,
                'ip_address' => $request->ip(),
            ]);

            $payment->delete();

            return $payment;
        });

        return response()->json([
            'message' => 'Payment deleted successfully',
        ]);
    }

    /**
     * Approve a payment
     */
    public function approve(Request $request, $id)
    {
        $payment = DB::transaction(function () use ($id, $request) {
            $payment = Payment::findOrFail($id);

            $oldData = $payment->toArray();

            $payment->update([
                'approved_by' => $request->user()->id,
            ]);

            // Create audit log
            PaymentAuditLog::create([
                'payment_id' => $payment->id,
                'action' => 'approved',
                'old_data' => $oldData,
                'new_data' => $payment->fresh()->toArray(),
                'user_id' => $request->user()->id,
                'ip_address' => $request->ip(),
            ]);

            return $payment->load(['supplier', 'payer', 'approver']);
        });

        return response()->json($payment);
    }
}
