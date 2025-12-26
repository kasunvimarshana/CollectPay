<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['supplier', 'user']);

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('payment_type')) {
            $query->where('payment_type', $request->payment_type);
        }

        if ($request->has('from_date')) {
            $query->where('payment_date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->where('payment_date', '<=', $request->to_date);
        }

        $perPage = $request->get('per_page', 15);
        $payments = $query->orderBy('payment_date', 'desc')->paginate($perPage);

        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'payment_date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'payment_type' => 'required|in:advance,partial,full',
            'payment_method' => 'nullable|string|max:100',
            'reference_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $payment = DB::transaction(function () use ($validated, $request) {
            $validated['user_id'] = $request->user()->id;
            return Payment::create($validated);
        });

        return response()->json($payment->load(['supplier', 'user']), 201);
    }

    public function show(string $id)
    {
        $payment = Payment::with(['supplier', 'user'])->findOrFail($id);
        return response()->json($payment);
    }

    public function update(Request $request, string $id)
    {
        $payment = Payment::findOrFail($id);

        $validated = $request->validate([
            'supplier_id' => 'sometimes|required|exists:suppliers,id',
            'payment_date' => 'sometimes|required|date',
            'amount' => 'sometimes|required|numeric|min:0.01',
            'payment_type' => 'sometimes|required|in:advance,partial,full',
            'payment_method' => 'nullable|string|max:100',
            'reference_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
            'version' => 'required|integer',
        ]);

        DB::transaction(function () use ($payment, $validated) {
            if ($payment->version != $validated['version']) {
                throw new \Exception('Version mismatch. Please refresh and try again.');
            }

            $validated['version'] = $payment->version + 1;
            $payment->update($validated);
        });

        return response()->json($payment->load(['supplier', 'user']));
    }

    public function destroy(string $id)
    {
        $payment = Payment::findOrFail($id);
        $payment->delete();

        return response()->json(['message' => 'Payment deleted successfully']);
    }

    public function getSupplierBalance(string $supplierId)
    {
        $supplier = Supplier::findOrFail($supplierId);

        $totalCollections = $supplier->getTotalCollectionsAmount();
        $totalPayments = $supplier->getTotalPaymentsAmount();
        $balance = $supplier->getBalanceAmount();

        return response()->json([
            'supplier_id' => $supplier->id,
            'supplier_name' => $supplier->name,
            'total_collections' => $totalCollections,
            'total_payments' => $totalPayments,
            'balance' => $balance,
        ]);
    }
}
