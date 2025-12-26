<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Services\PaymentCalculationService;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    private PaymentCalculationService $paymentService;

    public function __construct(PaymentCalculationService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function index(Request $request)
    {
        $query = Supplier::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $suppliers = $query->orderBy('name')->paginate(50);

        return response()->json($suppliers);
    }

    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:suppliers,code',
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,suspended',
            'metadata' => 'nullable|array',
        ]);

        $supplier = Supplier::create($request->all());

        return response()->json($supplier, 201);
    }

    public function show(Supplier $supplier)
    {
        $supplier->load(['creator', 'collections', 'payments']);
        
        // Get outstanding balance
        $outstanding = $this->paymentService->calculateOutstanding($supplier->id);

        return response()->json([
            'supplier' => $supplier,
            'outstanding' => $outstanding,
        ]);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $request->validate([
            'code' => 'sometimes|string|unique:suppliers,code,' . $supplier->id,
            'name' => 'sometimes|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,suspended',
            'metadata' => 'nullable|array',
        ]);

        $supplier->update($request->all());

        return response()->json($supplier);
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();

        return response()->json(['message' => 'Supplier deleted successfully']);
    }

    /**
     * Get supplier balance details
     */
    public function balance(Supplier $supplier, Request $request)
    {
        $details = $this->paymentService->getCalculationDetails(
            $supplier->id,
            $request->from_date,
            $request->to_date
        );

        return response()->json($details);
    }
}
