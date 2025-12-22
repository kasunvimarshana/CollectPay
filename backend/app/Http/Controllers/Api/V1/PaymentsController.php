<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class PaymentsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->authorizeResource(Payment::class, 'payment');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Payment::query();
        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->string('supplier_id'));
        }
        $user = $request->user();
        if (!$request->filled('supplier_id') && !$user->hasAnyRole(['admin','manager']) && !$user->attr('allow_all_suppliers', false)) {
            $ids = (array) $user->attr('allowed_supplier_ids', []);
            if (!empty($ids)) {
                $query->whereIn('supplier_id', $ids);
            } else {
                $query->whereRaw('1=0');
            }
        }
        return $query->orderByDesc('paid_at')->paginate(50);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePaymentRequest $request, PaymentService $service)
    {
        $payment = $service->record($request->validated());
        return response()->json($payment, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Payment $payment)
    {
        return $payment;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function payable(string $supplierId, PaymentService $service)
    {
        $this->authorize('viewAny', Payment::class);
        return $service->computePayable($supplierId);
    }
}
