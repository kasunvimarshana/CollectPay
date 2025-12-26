<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\PaymentCalculationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    protected $paymentCalculationService;

    public function __construct(PaymentCalculationService $paymentCalculationService)
    {
        $this->paymentCalculationService = $paymentCalculationService;
    }

    public function index(Request $request)
    {
        $query = Transaction::with(['supplier', 'product']);

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('from_date')) {
            $query->where('transaction_date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->where('transaction_date', '<=', $request->to_date);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')->get();

        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'uuid' => 'nullable|string|unique:transactions,uuid',
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|string',
            'transaction_date' => 'required|date',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
            'device_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            // Calculate amount using PaymentCalculationService
            $calculationResult = $this->paymentCalculationService->calculateTransactionAmount(
                $request->product_id,
                $request->supplier_id,
                $request->quantity,
                $request->unit,
                \Carbon\Carbon::parse($request->transaction_date)
            );

            $transaction = Transaction::create([
                'uuid' => $request->uuid ?? \Illuminate\Support\Str::uuid(),
                'supplier_id' => $request->supplier_id,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'unit' => $request->unit,
                'rate' => $calculationResult['rate'],
                'amount' => $calculationResult['amount'],
                'transaction_date' => $request->transaction_date,
                'notes' => $request->notes,
                'metadata' => $request->metadata,
                'created_by' => auth()->id(),
                'device_id' => $request->device_id,
            ]);

            DB::commit();

            return response()->json($transaction->load(['supplier', 'product']), 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['error' => 'Failed to create transaction: '.$e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $transaction = Transaction::with(['supplier', 'product', 'rate', 'user'])->findOrFail($id);

        return response()->json($transaction);
    }

    public function update(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'supplier_id' => 'sometimes|exists:suppliers,id',
            'product_id' => 'sometimes|exists:products,id',
            'quantity' => 'sometimes|numeric|min:0',
            'unit' => 'sometimes|string',
            'transaction_date' => 'sometimes|date',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            // Recalculate amount if quantities, unit, or date changed
            if ($request->has('quantity') || $request->has('unit') ||
                $request->has('transaction_date') || $request->has('product_id')) {

                $calculationResult = $this->paymentCalculationService->calculateTransactionAmount(
                    $request->product_id ?? $transaction->product_id,
                    $request->supplier_id ?? $transaction->supplier_id,
                    $request->quantity ?? $transaction->quantity,
                    $request->unit ?? $transaction->unit,
                    \Carbon\Carbon::parse($request->transaction_date ?? $transaction->transaction_date)
                );

                $transaction->rate = $calculationResult['rate'];
                $transaction->amount = $calculationResult['amount'];
            }

            $transaction->update($validator->validated());
            DB::commit();

            return response()->json($transaction->load(['supplier', 'product']));
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['error' => 'Failed to update transaction: '.$e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $transaction = Transaction::findOrFail($id);

        DB::beginTransaction();
        try {
            $transaction->delete();
            DB::commit();

            return response()->json(['message' => 'Transaction deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['error' => 'Failed to delete transaction: '.$e->getMessage()], 500);
        }
    }
}
