<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LedgerService;
use Illuminate\Http\Request;

class LedgerController extends Controller
{
    public function supplierLedger(Request $request, string $supplier)
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $service = new LedgerService();
        return response()->json(
            $service->supplierLedger($supplier, $validated['from'] ?? null, $validated['to'] ?? null)
        );
    }
}
