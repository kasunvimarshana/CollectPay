<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $perPage = $request->get('per_page', 15);
        $suppliers = $query->orderBy('name')->paginate($perPage);

        return response()->json($suppliers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:suppliers,code',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $supplier = DB::transaction(function () use ($validated) {
            return Supplier::create($validated);
        });

        return response()->json($supplier, 201);
    }

    public function show(string $id)
    {
        $supplier = Supplier::with(['collections', 'payments'])->findOrFail($id);

        $supplier->total_collections = $supplier->getTotalCollectionsAmount();
        $supplier->total_payments = $supplier->getTotalPaymentsAmount();
        $supplier->balance = $supplier->getBalanceAmount();

        return response()->json($supplier);
    }

    public function update(Request $request, string $id)
    {
        $supplier = Supplier::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:255|unique:suppliers,code,' . $id,
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
            'version' => 'required|integer',
        ]);

        DB::transaction(function () use ($supplier, $validated) {
            if ($supplier->version != $validated['version']) {
                throw new \Exception('Version mismatch. Please refresh and try again.');
            }

            $validated['version'] = $supplier->version + 1;
            $supplier->update($validated);
        });

        return response()->json($supplier);
    }

    public function destroy(string $id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->delete();

        return response()->json(['message' => 'Supplier deleted successfully']);
    }
}
