<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SyncService;
use Illuminate\Http\Request;

class SyncController extends Controller
{
    private SyncService $syncService;

    public function __construct(SyncService $syncService)
    {
        $this->syncService = $syncService;
    }

    public function syncTransactions(Request $request)
    {
        $validated = $request->validate([
            'device_id' => 'required|integer|exists:devices,id',
            'transactions' => 'required|array',
            'transactions.*.uuid' => 'required|string',
            'transactions.*.supplier_id' => 'required|integer',
            'transactions.*.product_id' => 'required|integer',
            'transactions.*.quantity' => 'required|numeric',
            'transactions.*.unit' => 'required|string',
            'transactions.*.rate' => 'required|numeric',
            'transactions.*.amount' => 'required|numeric',
            'transactions.*.transaction_date' => 'required|date',
        ]);

        $results = $this->syncService->syncTransactions(
            $validated['transactions'],
            $validated['device_id']
        );

        $this->syncService->updateDeviceSync($validated['device_id']);

        return response()->json($results);
    }

    public function syncPayments(Request $request)
    {
        $validated = $request->validate([
            'device_id' => 'required|integer|exists:devices,id',
            'payments' => 'required|array',
            'payments.*.uuid' => 'required|string',
            'payments.*.supplier_id' => 'required|integer',
            'payments.*.amount' => 'required|numeric',
            'payments.*.payment_type' => 'required|in:advance,partial,full,adjustment',
            'payments.*.payment_method' => 'required|string',
            'payments.*.payment_date' => 'required|date',
        ]);

        $results = $this->syncService->syncPayments(
            $validated['payments'],
            $validated['device_id']
        );

        $this->syncService->updateDeviceSync($validated['device_id']);

        return response()->json($results);
    }

    public function getUpdates(Request $request)
    {
        $validated = $request->validate([
            'device_id' => 'required|integer|exists:devices,id',
            'last_sync' => 'sometimes|date',
        ]);

        $lastSync = $validated['last_sync'] ?? null;
        $deviceId = $validated['device_id'];

        $transactions = \App\Models\Transaction::when($lastSync, function ($query) use ($lastSync) {
            return $query->where('updated_at', '>', $lastSync);
        })->where('device_id', '!=', $deviceId)->get();

        $payments = \App\Models\Payment::when($lastSync, function ($query) use ($lastSync) {
            return $query->where('updated_at', '>', $lastSync);
        })->where('device_id', '!=', $deviceId)->get();

        $suppliers = \App\Models\Supplier::when($lastSync, function ($query) use ($lastSync) {
            return $query->where('updated_at', '>', $lastSync);
        })->get();

        $products = \App\Models\Product::when($lastSync, function ($query) use ($lastSync) {
            return $query->where('updated_at', '>', $lastSync);
        })->get();

        $rates = \App\Models\Rate::when($lastSync, function ($query) use ($lastSync) {
            return $query->where('updated_at', '>', $lastSync);
        })->get();

        return response()->json([
            'transactions' => $transactions,
            'payments' => $payments,
            'suppliers' => $suppliers,
            'products' => $products,
            'rates' => $rates,
            'sync_timestamp' => now()->toDateTimeString(),
        ]);
    }
}
