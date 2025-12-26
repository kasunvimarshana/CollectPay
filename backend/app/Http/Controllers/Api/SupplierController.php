<?php

namespace App\Http\Controllers\Api;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupplierController extends ApiController
{
    /**
     * Get all suppliers
     */
    public function index(Request $request)
    {
        $query = Supplier::query()->with(['creator', 'updater']);

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 50);
        $suppliers = $query->orderBy('name')->paginate($perPage);

        return $this->success($suppliers);
    }

    /**
     * Get single supplier
     */
    public function show($id)
    {
        $supplier = Supplier::with(['rates.product', 'creator', 'updater'])->find($id);

        if (!$supplier) {
            return $this->notFound('Supplier not found');
        }

        // Include balance information
        $supplier->total_collections = $supplier->getTotalCollections();
        $supplier->total_payments = $supplier->getTotalPayments();
        $supplier->balance = $supplier->getBalance();

        return $this->success($supplier);
    }

    /**
     * Create new supplier
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'uuid' => 'sometimes|uuid|unique:suppliers,uuid',
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'registration_number' => 'nullable|string|max:100',
            'metadata' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
            'version' => 'sometimes|integer',
        ]);

        // Check for version conflict (optimistic locking)
        if (isset($validated['uuid'])) {
            $existing = Supplier::where('uuid', $validated['uuid'])->first();
            if ($existing) {
                if (isset($validated['version']) && $existing->version != $validated['version']) {
                    return $this->conflict([
                        'server_version' => $existing->version,
                        'server_data' => $existing,
                    ], 'Version conflict detected');
                }
                // Update existing instead
                return $this->update($request, $existing->id);
            }
        }

        DB::beginTransaction();
        try {
            $validated['created_by'] = $request->user()->id;
            $supplier = Supplier::create($validated);

            DB::commit();
            return $this->success($supplier, 'Supplier created successfully', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to create supplier: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update supplier
     */
    public function update(Request $request, $id)
    {
        $supplier = Supplier::find($id);

        if (!$supplier) {
            return $this->notFound('Supplier not found');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'registration_number' => 'nullable|string|max:100',
            'metadata' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
            'version' => 'sometimes|integer',
        ]);

        // Check version conflict
        if (isset($validated['version']) && $supplier->version != $validated['version']) {
            return $this->conflict([
                'server_version' => $supplier->version,
                'server_data' => $supplier,
            ], 'Version conflict detected');
        }

        DB::beginTransaction();
        try {
            $validated['updated_by'] = $request->user()->id;
            $supplier->update($validated);

            DB::commit();
            return $this->success($supplier, 'Supplier updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to update supplier: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete supplier
     */
    public function destroy($id)
    {
        $supplier = Supplier::find($id);

        if (!$supplier) {
            return $this->notFound('Supplier not found');
        }

        try {
            $supplier->delete();
            return $this->success(null, 'Supplier deleted successfully');
        } catch (\Exception $e) {
            return $this->error('Failed to delete supplier: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get supplier balance and transactions
     */
    public function balance(Request $request, $id)
    {
        $supplier = Supplier::find($id);

        if (!$supplier) {
            return $this->notFound('Supplier not found');
        }

        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $data = [
            'supplier' => $supplier,
            'total_collections' => $supplier->getTotalCollections($startDate, $endDate),
            'total_payments' => $supplier->getTotalPayments($startDate, $endDate),
            'balance' => $supplier->getBalance($startDate, $endDate),
            'recent_collections' => $supplier->collections()
                ->when($startDate, fn($q) => $q->where('collection_date', '>=', $startDate))
                ->when($endDate, fn($q) => $q->where('collection_date', '<=', $endDate))
                ->with('product')
                ->orderBy('collection_date', 'desc')
                ->limit(10)
                ->get(),
            'recent_payments' => $supplier->payments()
                ->when($startDate, fn($q) => $q->where('payment_date', '>=', $startDate))
                ->when($endDate, fn($q) => $q->where('payment_date', '<=', $endDate))
                ->orderBy('payment_date', 'desc')
                ->limit(10)
                ->get(),
        ];

        return $this->success($data);
    }
}
