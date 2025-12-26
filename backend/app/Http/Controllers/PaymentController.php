<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\Payment;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['supplier', 'user'])
            ->whereNull('deleted_at')
            ->orderBy('payment_date', 'desc');

        // Optional filters
        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('from_date')) {
            $query->where('payment_date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->where('payment_date', '<=', $request->to_date);
        }

        $payments = $query->paginate(50);

        return $this->successResponse($payments);
    }

    public function show($id)
    {
        $payment = Payment::with(['supplier', 'user'])
            ->whereNull('deleted_at')
            ->find($id);

        if (!$payment) {
            return $this->errorResponse('Payment not found', null, 404);
        }

        return $this->successResponse($payment);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'required|uuid|exists:suppliers,id',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:advance,partial,final',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string',
            'reference_number' => 'nullable|string|max:100',
            'idempotency_key' => 'nullable|string|unique:payments,idempotency_key',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        // Check for duplicate idempotency key
        if ($request->idempotency_key) {
            $existing = Payment::where('idempotency_key', $request->idempotency_key)->first();
            if ($existing) {
                return $this->successResponse($existing, 'Payment already exists (idempotent)', 200);
            }
        }

        $payment = Payment::create([
            'id' => (string) Str::uuid(),
            'supplier_id' => $request->supplier_id,
            'amount' => $request->amount,
            'type' => $request->type,
            'payment_date' => $request->payment_date,
            'notes' => $request->notes,
            'reference_number' => $request->reference_number,
            'user_id' => $request->user()->id,
            'idempotency_key' => $request->idempotency_key ?? (string) Str::uuid(),
            'version' => 1,
        ]);

        return $this->successResponse(
            $payment->load(['supplier', 'user']),
            'Payment created successfully',
            201
        );
    }

    public function update(Request $request, $id)
    {
        $payment = Payment::whereNull('deleted_at')->find($id);

        if (!$payment) {
            return $this->errorResponse('Payment not found', null, 404);
        }

        $validator = Validator::make($request->all(), [
            'amount' => 'sometimes|required|numeric|min:0.01',
            'type' => 'sometimes|required|in:advance,partial,final',
            'payment_date' => 'sometimes|required|date',
            'notes' => 'nullable|string',
            'reference_number' => 'nullable|string|max:100',
            'version' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        // Version check for optimistic locking
        if ($request->version !== $payment->version) {
            return $this->errorResponse(
                'Version conflict detected',
                ['version' => ['Server version is ' . $payment->version]],
                409
            );
        }

        $payment->update([
            'amount' => $request->amount ?? $payment->amount,
            'type' => $request->type ?? $payment->type,
            'payment_date' => $request->payment_date ?? $payment->payment_date,
            'notes' => $request->notes ?? $payment->notes,
            'reference_number' => $request->reference_number ?? $payment->reference_number,
            'version' => $payment->version + 1,
        ]);

        return $this->successResponse(
            $payment->load(['supplier', 'user']),
            'Payment updated successfully'
        );
    }

    public function destroy($id)
    {
        $payment = Payment::whereNull('deleted_at')->find($id);

        if (!$payment) {
            return $this->errorResponse('Payment not found', null, 404);
        }

        $payment->update([
            'deleted_at' => now(),
            'version' => $payment->version + 1,
        ]);

        return $this->successResponse(null, 'Payment deleted successfully');
    }
}
