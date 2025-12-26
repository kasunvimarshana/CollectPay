<?php

namespace App\Http\Controllers\Api;

use App\Domain\Supplier\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends ApiController
{
    public function index(Request $request)
    {
        $query = Supplier::query();

        // Apply filters
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%");
            });
        }

        if ($request->has('region')) {
            $query->where('region', $request->region);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Include balance calculation
        if ($request->boolean('with_balance')) {
            $query->withBalance();
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = min($request->get('per_page', 20), 100);
        $suppliers = $query->paginate($perPage);

        return $this->paginated($suppliers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:1000'],
            'region' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'payment_method' => ['nullable', 'string', 'in:cash,bank_transfer,mobile_money'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'bank_account' => ['nullable', 'string', 'max:50'],
            'mobile_money_number' => ['nullable', 'string', 'max:20'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'client_id' => ['nullable', 'uuid'],
        ]);

        $validated['created_by'] = $request->user()->id;

        $supplier = Supplier::create($validated);

        return $this->created($supplier, 'Supplier created successfully');
    }

    public function show(Supplier $supplier)
    {
        $supplier->load(['creator']);
        
        // Add balance info
        $supplier->total_collections = $supplier->getTotalCollectionsAmount();
        $supplier->total_payments = $supplier->getTotalPaymentsAmount();
        $supplier->balance_due = $supplier->getBalanceDue();

        return $this->success($supplier);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:1000'],
            'region' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'payment_method' => ['nullable', 'string', 'in:cash,bank_transfer,mobile_money'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'bank_account' => ['nullable', 'string', 'max:50'],
            'mobile_money_number' => ['nullable', 'string', 'max:20'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $supplier->update($validated);

        return $this->success($supplier->fresh(), 'Supplier updated successfully');
    }

    public function destroy(Supplier $supplier)
    {
        // Check for existing collections/payments
        if ($supplier->collections()->exists() || $supplier->payments()->exists()) {
            return $this->error(
                'Cannot delete supplier with existing collections or payments. Deactivate instead.',
                422
            );
        }

        $supplier->delete();

        return $this->success(null, 'Supplier deleted successfully');
    }

    public function balance(Supplier $supplier, Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        return $this->success([
            'supplier_id' => $supplier->id,
            'supplier_name' => $supplier->name,
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'total_collections' => $supplier->getTotalCollectionsAmount($startDate, $endDate),
            'total_payments' => $supplier->getTotalPaymentsAmount($startDate, $endDate),
            'balance_due' => $supplier->getBalanceDue($startDate, $endDate),
        ]);
    }

    public function regions()
    {
        $regions = Supplier::select('region')
            ->whereNotNull('region')
            ->distinct()
            ->orderBy('region')
            ->pluck('region');

        return $this->success($regions);
    }
}
