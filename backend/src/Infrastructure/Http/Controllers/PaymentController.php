<?php

namespace Src\Infrastructure\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Src\Infrastructure\Persistence\Eloquent\Models\PaymentModel;
use Src\Infrastructure\Persistence\Eloquent\Models\AuditLogModel;

class PaymentController
{
    public function index(Request $request)
    {
        $query = PaymentModel::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('collection_id')) {
            $query->where('collection_id', $request->collection_id);
        }

        $payments = $query->with(['collection', 'payer', 'rate', 'creator'])
            ->orderBy('payment_date', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'collection_id' => 'required|exists:collections,id',
            'rate_id' => 'nullable|exists:rates,id',
            'payer_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'payment_method' => 'required|in:cash,card,bank_transfer,mobile_money,other',
            'notes' => 'nullable|string',
            'payment_date' => 'required|date',
            'is_automated' => 'nullable|boolean',
            'metadata' => 'nullable|array',
            'idempotency_key' => 'required|string|unique:payments,idempotency_key',
            'device_id' => 'nullable|string',
        ]);

        // Check for idempotency
        $existingPayment = PaymentModel::where('idempotency_key', $validated['idempotency_key'])->first();
        if ($existingPayment) {
            return response()->json($existingPayment, 200);
        }

        $validated['uuid'] = (string) Str::uuid();
        $validated['created_by'] = $request->user()->id;
        $validated['version'] = 1;
        $validated['status'] = 'pending';

        $payment = PaymentModel::create($validated);

        // Create audit log
        AuditLogModel::create([
            'user_id' => $request->user()->id,
            'auditable_type' => PaymentModel::class,
            'auditable_id' => $payment->id,
            'event' => 'created',
            'new_values' => $payment->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'device_id' => $validated['device_id'] ?? null,
        ]);

        return response()->json($payment->load(['collection', 'payer', 'rate']), 201);
    }

    public function show(string $uuid)
    {
        $payment = PaymentModel::where('uuid', $uuid)
            ->with(['collection', 'payer', 'rate', 'creator', 'updater'])
            ->firstOrFail();

        return response()->json($payment);
    }

    public function update(Request $request, string $uuid)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,processing,completed,failed,cancelled',
            'notes' => 'nullable|string',
            'processed_at' => 'nullable|date',
            'metadata' => 'nullable|array',
        ]);

        $payment = PaymentModel::where('uuid', $uuid)->firstOrFail();
        
        $oldValues = $payment->toArray();
        
        $validated['updated_by'] = $request->user()->id;
        $validated['version'] = $payment->version + 1;

        $payment->update($validated);

        // Create audit log
        AuditLogModel::create([
            'user_id' => $request->user()->id,
            'auditable_type' => PaymentModel::class,
            'auditable_id' => $payment->id,
            'event' => 'updated',
            'old_values' => $oldValues,
            'new_values' => $payment->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json($payment->load(['collection', 'payer', 'rate']));
    }

    public function destroy(string $uuid)
    {
        $payment = PaymentModel::where('uuid', $uuid)->firstOrFail();
        $payment->delete();

        return response()->json(['message' => 'Payment deleted successfully']);
    }

    public function batchCreate(Request $request)
    {
        $validated = $request->validate([
            'payments' => 'required|array',
            'payments.*.collection_id' => 'required|exists:collections,id',
            'payments.*.payer_id' => 'required|exists:users,id',
            'payments.*.amount' => 'required|numeric|min:0',
            'payments.*.payment_method' => 'required|in:cash,card,bank_transfer,mobile_money,other',
            'payments.*.payment_date' => 'required|date',
            'payments.*.idempotency_key' => 'required|string',
        ]);

        $createdPayments = [];
        
        foreach ($validated['payments'] as $paymentData) {
            // Check idempotency
            $existing = PaymentModel::where('idempotency_key', $paymentData['idempotency_key'])->first();
            if ($existing) {
                $createdPayments[] = $existing;
                continue;
            }

            $paymentData['uuid'] = (string) Str::uuid();
            $paymentData['created_by'] = $request->user()->id;
            $paymentData['version'] = 1;
            $paymentData['status'] = 'pending';

            $payment = PaymentModel::create($paymentData);
            $createdPayments[] = $payment;
        }

        return response()->json([
            'message' => 'Batch payment creation completed',
            'payments' => $createdPayments,
        ], 201);
    }
}
