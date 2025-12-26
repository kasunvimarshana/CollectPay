<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Models\Payment;
use App\Services\PaymentCalculationService;
use App\Services\AuditService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    private PaymentCalculationService $paymentService;
    private AuditService $auditService;

    public function __construct(
        PaymentCalculationService $paymentService,
        AuditService $auditService
    ) {
        $this->paymentService = $paymentService;
        $this->auditService = $auditService;
    }

    public function index(Request $request)
    {
        $query = Payment::with(['supplier', 'processor']);

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('from_date')) {
            $query->where('payment_date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->where('payment_date', '<=', $request->to_date);
        }

        if ($request->has('payment_type')) {
            $query->where('payment_type', $request->payment_type);
        }

        $payments = $query->orderBy('payment_date', 'desc')->paginate(50);

        return response()->json($payments);
    }

    public function store(StorePaymentRequest $request)
    {
        // Validate payment amount
        $validation = $this->paymentService->validatePaymentAmount(
            $request->supplier_id,
            $request->amount
        );

        if (!$validation['is_valid'] && $request->payment_type !== 'advance') {
            return response()->json([
                'message' => $validation['message'],
                'validation' => $validation,
            ], 422);
        }

        $payment = $this->paymentService->processPayment($request->validated());
        
        $this->auditService->log(
            'payment',
            $payment->id,
            'created',
            null,
            $payment->toArray(),
            $request
        );

        return response()->json($payment, 201);
    }

    public function show(Payment $payment)
    {
        $payment->load(['supplier', 'processor']);

        return response()->json($payment);
    }

    public function update(Request $request, Payment $payment)
    {
        $request->validate([
            'amount' => 'sometimes|numeric|min:0.01',
            'payment_date' => 'sometimes|date',
            'payment_time' => 'nullable|date_format:H:i:s',
            'payment_method' => 'nullable|in:cash,bank_transfer,check,mobile_money',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $oldValues = $payment->toArray();
        
        $payment->update($request->all());
        
        $this->auditService->log(
            'payment',
            $payment->id,
            'updated',
            $oldValues,
            $payment->toArray(),
            $request
        );

        return response()->json($payment);
    }

    public function destroy(Request $request, Payment $payment)
    {
        $oldValues = $payment->toArray();
        
        $payment->delete();
        
        $this->auditService->log(
            'payment',
            $payment->id,
            'deleted',
            $oldValues,
            null,
            $request
        );

        return response()->json(['message' => 'Payment deleted successfully']);
    }

    /**
     * Validate payment amount before processing
     */
    public function validateAmount(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'amount' => 'required|numeric|min:0.01',
        ]);

        $validation = $this->paymentService->validatePaymentAmount(
            $request->supplier_id,
            $request->amount
        );

        return response()->json($validation);
    }
}
