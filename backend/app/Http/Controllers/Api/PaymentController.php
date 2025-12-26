<?php

namespace App\Http\Controllers\Api;

use App\Models\Payment;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends ApiController
{
    /**
     * Get all payments
     */
    public function index(Request $request)
    {
        $query = Payment::query()->with(['supplier', 'processor']);

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('payment_type')) {
            $query->where('payment_type', $request->payment_type);
        }

        if ($request->has('is_synced')) {
            $query->where('is_synced', $request->boolean('is_synced'));
        }

        if ($request->has('start_date')) {
            $query->where('payment_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('payment_date', '<=', $request->end_date);
        }

        $perPage = $request->get('per_page', 50);
        $payments = $query->orderBy('payment_date', 'desc')->paginate($perPage);

        return $this->success($payments);
    }

    /**
     * Get single payment
     */
    public function show($id)
    {
        $payment = Payment::with(['supplier', 'processor', 'creator'])->find($id);

        if (!$payment) {
            return $this->notFound('Payment not found');
        }

        return $this->success($payment);
    }

    /**
     * Create new payment
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'uuid' => 'sometimes|uuid|unique:payments,uuid',
            'supplier_id' => 'required|exists:suppliers,id',
            'payment_date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'payment_type' => 'required|in:advance,partial,full,adjustment',
            'payment_method' => 'nullable|string|max:50',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'allocation' => 'nullable|array',
            'is_synced' => 'sometimes|boolean',
            'version' => 'sometimes|integer',
        ]);

        if (isset($validated['uuid'])) {
            $existing = Payment::where('uuid', $validated['uuid'])->first();
            if ($existing) {
                if (isset($validated['version']) && $existing->version != $validated['version']) {
                    return $this->conflict([
                        'server_version' => $existing->version,
                        'server_data' => $existing->load('supplier'),
                    ], 'Version conflict detected');
                }
                return $this->update($request, $existing->id);
            }
        }

        DB::beginTransaction();
        try {
            $validated['processed_by'] = $request->user()->id;
            $validated['created_by'] = $request->user()->id;

            $payment = Payment::create($validated);

            DB::commit();
            return $this->success(
                $payment->load('supplier'),
                'Payment created successfully',
                201
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to create payment: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update payment
     */
    public function update(Request $request, $id)
    {
        $payment = Payment::find($id);

        if (!$payment) {
            return $this->notFound('Payment not found');
        }

        $validated = $request->validate([
            'supplier_id' => 'sometimes|exists:suppliers,id',
            'payment_date' => 'sometimes|date',
            'amount' => 'sometimes|numeric|min:0.01',
            'payment_type' => 'sometimes|in:advance,partial,full,adjustment',
            'payment_method' => 'nullable|string|max:50',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'allocation' => 'nullable|array',
            'is_synced' => 'sometimes|boolean',
            'version' => 'sometimes|integer',
        ]);

        if (isset($validated['version']) && $payment->version != $validated['version']) {
            return $this->conflict([
                'server_version' => $payment->version,
                'server_data' => $payment->load('supplier'),
            ], 'Version conflict detected');
        }

        DB::beginTransaction();
        try {
            $validated['updated_by'] = $request->user()->id;
            $payment->update($validated);

            DB::commit();
            return $this->success(
                $payment->load('supplier'),
                'Payment updated successfully'
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to update payment: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete payment
     */
    public function destroy($id)
    {
        $payment = Payment::find($id);

        if (!$payment) {
            return $this->notFound('Payment not found');
        }

        try {
            $payment->delete();
            return $this->success(null, 'Payment deleted successfully');
        } catch (\Exception $e) {
            return $this->error('Failed to delete payment: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Calculate payment allocation
     */
    public function calculateAllocation(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'sometimes|date',
        ]);

        $supplier = Supplier::with([
            'collections' => function ($query) use ($validated) {
                $query->where('collection_date', '<=', $validated['payment_date'] ?? now())
                    ->orderBy('collection_date', 'asc');
            }
        ])->find($validated['supplier_id']);

        // Get existing payments
        $totalPaid = $supplier->payments()
            ->where('payment_date', '<=', $validated['payment_date'] ?? now())
            ->sum('amount');

        $totalCollected = $supplier->collections
            ->sum('total_amount');

        $balance = $totalCollected - $totalPaid;

        $allocation = [
            'supplier_id' => $supplier->id,
            'supplier_name' => $supplier->name,
            'total_collected' => $totalCollected,
            'total_paid' => $totalPaid,
            'current_balance' => $balance,
            'payment_amount' => $validated['amount'],
            'remaining_balance' => max(0, $balance - $validated['amount']),
            'collections' => $supplier->collections->map(function ($collection) {
                return [
                    'id' => $collection->id,
                    'collection_date' => $collection->collection_date,
                    'product_name' => $collection->product->name ?? 'Unknown',
                    'quantity' => $collection->quantity,
                    'amount' => $collection->total_amount,
                ];
            }),
        ];

        return $this->success($allocation);
    }

    /**
     * Get payment summary
     */
    public function summary(Request $request)
    {
        $query = Payment::query();

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('start_date')) {
            $query->where('payment_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('payment_date', '<=', $request->end_date);
        }

        $summary = [
            'total_payments' => $query->count(),
            'total_amount' => $query->sum('amount'),
            'synced_count' => (clone $query)->where('is_synced', true)->count(),
            'pending_count' => (clone $query)->where('is_synced', false)->count(),
            'by_type' => (clone $query)
                ->select('payment_type', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
                ->groupBy('payment_type')
                ->get(),
        ];

        return $this->success($summary);
    }
}
