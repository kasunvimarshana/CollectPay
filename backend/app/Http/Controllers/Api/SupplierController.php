<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Models\SupplierBalance;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::with(['balance', 'creator']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $suppliers = $query->latest()->paginate($request->input('per_page', 15));

        return response()->json($suppliers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'secondary_phone' => 'nullable|string|max:20',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'address' => 'nullable|string',
            'village' => 'nullable|string|max:255',
            'district' => 'nullable|string|max:255',
            'metadata' => 'nullable|array',
        ]);

        $validated['created_by'] = $request->user()->id;

        $supplier = Supplier::create($validated);

        // Create balance record
        SupplierBalance::create(['supplier_id' => $supplier->id]);

        AuditLog::log('supplier', $supplier->id, 'created', null, $supplier->toArray());

        return response()->json($supplier->load('balance'), 201);
    }

    public function show(Supplier $supplier)
    {
        return response()->json($supplier->load(['balance', 'creator', 'updater']));
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'secondary_phone' => 'nullable|string|max:20',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'address' => 'nullable|string',
            'village' => 'nullable|string|max:255',
            'district' => 'nullable|string|max:255',
            'metadata' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
        ]);

        $oldValues = $supplier->toArray();
        $validated['updated_by'] = $request->user()->id;

        $supplier->update($validated);

        AuditLog::log('supplier', $supplier->id, 'updated', $oldValues, $supplier->fresh()->toArray());

        return response()->json($supplier->load('balance'));
    }

    public function destroy(Supplier $supplier)
    {
        AuditLog::log('supplier', $supplier->id, 'deleted', $supplier->toArray(), null);

        $supplier->delete();

        return response()->json(['message' => 'Supplier deleted successfully']);
    }

    public function balance(Supplier $supplier)
    {
        if (!$supplier->balance) {
            SupplierBalance::create(['supplier_id' => $supplier->id]);
            $supplier->load('balance');
        }

        $supplier->balance->recalculate();

        return response()->json($supplier->balance->fresh());
    }

    public function transactions(Request $request, Supplier $supplier)
    {
        $collections = $supplier->collections()
            ->with(['product', 'collector'])
            ->latest('collected_at')
            ->limit(50)
            ->get();

        $payments = $supplier->payments()
            ->with('processor')
            ->latest('payment_date')
            ->limit(50)
            ->get();

        return response()->json([
            'collections' => $collections,
            'payments' => $payments,
        ]);
    }
}
