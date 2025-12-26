<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
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

        $perPage = $request->input('per_page', 15);

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:suppliers,code',
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'contact_person' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive,suspended',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $supplier = Supplier::create(array_merge($validated, [
            'created_by' => $request->user()->id,
        ]));

        return response()->json($supplier, 201);
    }

    public function show($id)
    {
        $supplier = Supplier::with(['transactions', 'payments'])->findOrFail($id);

        return response()->json([
            'supplier' => $supplier,
            'balance' => $supplier->balance,
        ]);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        $validated = $request->validate([
            'code' => 'sometimes|string|unique:suppliers,code,'.$id,
            'name' => 'sometimes|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'contact_person' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive,suspended',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $supplier->update($validated);

        return response()->json($supplier);
    }

    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->delete();

        return response()->json(['message' => 'Supplier deleted successfully']);
    }

    public function balance($id)
    {
        $supplier = Supplier::findOrFail($id);
        $calculationService = new \App\Services\PaymentCalculationService;

        $balance = $calculationService->getSupplierBalance($id);

        return response()->json($balance);
    }
}
