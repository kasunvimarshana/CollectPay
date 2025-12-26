<?php

namespace App\Http\Controllers\Api;

use App\Domain\Payment\Models\Payment;
use App\Application\Payment\Services\PaymentCalculationService;
use Illuminate\Http\Request;

class PaymentController extends ApiController
{
    public function __construct(
        protected PaymentCalculationService $calculationService
    ) {}

    public function index(Request $request)
    {
        $query = Payment::query();

        if ($request->has('supplier_id')) {
            $query->forSupplier($request->supplier_id);
        }

        if ($request->has('payment_type')) {
            $query->ofType($request->payment_type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->betweenDates($request->start_date, $request->end_date);
        }

        $query->with(['supplier:id,name,code', 'paidBy:id,name', 'approvedBy:id,name']);

        $sortBy = $request->get('sort_by', 'payment_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = min($request->get('per_page', 20), 100);
        $payments = $query->paginate($perPage);

        return $this->paginated($payments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => ['required', 'uuid', 'exists:suppliers,id'],
            'payment_type' => ['required', 'string', 'in:advance,partial,settlement,adjustment'],
            'amount' => ['required_unless:payment_type,settlement', 'numeric', 'gt:0'],
            'currency' => ['nullable', 'string', 'max:3'],
            'payment_method' => ['required', 'string', 'in:cash,bank_transfer,mobile_money,check'],
            'transaction_reference' => ['nullable', 'string', 'max:100'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'check_number' => ['nullable', 'string', 'max:50'],
            'period_start' => ['required_if:payment_type,settlement', 'date'],
            'period_end' => ['required_if:payment_type,settlement', 'date', 'after_or_equal:period_start'],
            'adjustments' => ['nullable', 'numeric'],
            'payment_date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'client_id' => ['nullable', 'uuid'],
        ]);

        $validated['paid_by'] = $request->user()->id;
        $validated['currency'] = $validated['currency'] ?? 'LKR';

        $payment = Payment::create($validated);

        return $this->created(
            $payment->load(['supplier:id,name', 'paidBy:id,name']),
            'Payment recorded successfully'
        );
    }

    public function show(Payment $payment)
    {
        $payment->load([
            'supplier',
            'paidBy:id,name',
            'approvedBy:id,name',
            'collections'
        ]);

        return $this->success($payment);
    }

    public function update(Request $request, Payment $payment)
    {
        // Cannot update approved/completed payments
        if (in_array($payment->status, ['approved', 'completed'])) {
            return $this->error('Cannot modify approved or completed payments', 422);
        }

        $validated = $request->validate([
            'amount' => ['sometimes', 'numeric', 'gt:0'],
            'payment_method' => ['sometimes', 'string', 'in:cash,bank_transfer,mobile_money,check'],
            'transaction_reference' => ['nullable', 'string', 'max:100'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'check_number' => ['nullable', 'string', 'max:50'],
            'adjustments' => ['nullable', 'numeric'],
            'payment_date' => ['sometimes', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $payment->update($validated);

        return $this->success(
            $payment->fresh(['supplier:id,name', 'paidBy:id,name']),
            'Payment updated successfully'
        );
    }

    public function destroy(Payment $payment)
    {
        if (in_array($payment->status, ['approved', 'completed'])) {
            return $this->error('Cannot delete approved or completed payments', 422);
        }

        $payment->delete();

        return $this->success(null, 'Payment deleted successfully');
    }

    public function approve(Payment $payment)
    {
        $user = request()->user();

        if (!$user->isAdmin() && !$user->isManager()) {
            return $this->forbidden('Only managers can approve payments');
        }

        if ($payment->status !== 'pending') {
            return $this->error('Only pending payments can be approved', 422);
        }

        $payment->approve($user);

        return $this->success($payment->fresh(), 'Payment approved');
    }

    public function complete(Payment $payment)
    {
        if ($payment->status !== 'approved') {
            return $this->error('Only approved payments can be completed', 422);
        }

        $payment->complete();

        return $this->success($payment->fresh(), 'Payment completed');
    }

    public function cancel(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        if ($payment->status === 'completed') {
            return $this->error('Cannot cancel completed payments', 422);
        }

        $payment->notes = ($payment->notes ? $payment->notes . "\n" : '') 
            . "CANCELLED: " . $validated['reason'];
        $payment->cancel();

        return $this->success($payment->fresh(), 'Payment cancelled');
    }

    public function calculateSettlement(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => ['required', 'uuid', 'exists:suppliers,id'],
            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date', 'after_or_equal:period_start'],
            'adjustments' => ['nullable', 'numeric'],
        ]);

        $calculation = $this->calculationService->calculateSettlement(
            $validated['supplier_id'],
            $validated['period_start'],
            $validated['period_end'],
            $validated['adjustments'] ?? null
        );

        return $this->success($calculation);
    }

    public function createSettlement(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => ['required', 'uuid', 'exists:suppliers,id'],
            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date', 'after_or_equal:period_start'],
            'payment_method' => ['required', 'string', 'in:cash,bank_transfer,mobile_money,check'],
            'adjustments' => ['nullable', 'numeric'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $payment = $this->calculationService->createSettlementPayment(
            $validated['supplier_id'],
            $validated['period_start'],
            $validated['period_end'],
            $request->user()->id,
            $validated['payment_method'],
            $validated['adjustments'] ?? null,
            $validated['notes'] ?? null
        );

        return $this->created($payment, 'Settlement payment created');
    }

    public function supplierStatement(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => ['required', 'uuid', 'exists:suppliers,id'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $statement = $this->calculationService->getSupplierStatement(
            $validated['supplier_id'],
            $validated['start_date'] ?? null,
            $validated['end_date'] ?? null
        );

        return $this->success($statement);
    }

    public function summary(Request $request)
    {
        $validated = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'supplier_id' => ['nullable', 'uuid'],
        ]);

        $query = Payment::approved()
            ->betweenDates($validated['start_date'], $validated['end_date']);

        if (isset($validated['supplier_id'])) {
            $query->forSupplier($validated['supplier_id']);
        }

        $summary = $query->selectRaw('
            COUNT(*) as total_payments,
            SUM(amount) as total_amount,
            payment_type,
            payment_method
        ')
        ->groupBy('payment_type', 'payment_method')
        ->get();

        $totals = Payment::approved()
            ->betweenDates($validated['start_date'], $validated['end_date'])
            ->when(isset($validated['supplier_id']), fn($q) => $q->forSupplier($validated['supplier_id']))
            ->selectRaw('
                COUNT(*) as total_payments,
                SUM(amount) as total_amount,
                SUM(CASE WHEN payment_type = "advance" THEN amount ELSE 0 END) as total_advances,
                SUM(CASE WHEN payment_type = "partial" THEN amount ELSE 0 END) as total_partials,
                SUM(CASE WHEN payment_type = "settlement" THEN amount ELSE 0 END) as total_settlements
            ')
            ->first();

        return $this->success([
            'period' => [
                'start' => $validated['start_date'],
                'end' => $validated['end_date'],
            ],
            'totals' => $totals,
            'by_type_and_method' => $summary,
        ]);
    }
}
