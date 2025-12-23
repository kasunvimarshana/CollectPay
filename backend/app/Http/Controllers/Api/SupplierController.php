<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Models\Supplier;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Supplier::class);

        $query = Supplier::query()->with(['creator', 'updater']);

        // Filter by ABAC - only show suppliers user has access to
        $user = $request->user();
        if (!in_array($user->role, ['admin', 'manager'])) {
            $userAttributes = $user->attributes ?? [];
            if (isset($userAttributes['allowed_suppliers'])) {
                $query->whereIn('id', $userAttributes['allowed_suppliers']);
            } else {
                $query->where('created_by', $user->id);
            }
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Pagination
        $perPage = min($request->get('per_page', 15), 100);
        $suppliers = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $suppliers,
        ]);
    }

    public function store(StoreSupplierRequest $request): JsonResponse
    {
        $this->authorize('create', Supplier::class);

        $supplier = Supplier::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
            'version' => 1,
        ]);

        // Log transaction
        Transaction::create([
            'entity_type' => 'suppliers',
            'entity_id' => $supplier->id,
            'user_id' => $request->user()->id,
            'action' => 'create',
            'data_after' => $supplier->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $supplier->load(['creator', 'updater']),
            'message' => 'Supplier created successfully',
        ], 201);
    }

    public function show(Request $request, Supplier $supplier): JsonResponse
    {
        $this->authorize('view', $supplier);

        return response()->json([
            'success' => true,
            'data' => $supplier->load(['creator', 'updater', 'products', 'payments']),
        ]);
    }

    public function update(UpdateSupplierRequest $request, Supplier $supplier): JsonResponse
    {
        $this->authorize('update', $supplier);

        $before = $supplier->toArray();

        $supplier->update([
            ...$request->validated(),
            'updated_by' => $request->user()->id,
            'version' => $supplier->version + 1,
        ]);

        // Log transaction
        Transaction::create([
            'entity_type' => 'suppliers',
            'entity_id' => $supplier->id,
            'user_id' => $request->user()->id,
            'action' => 'update',
            'data_before' => $before,
            'data_after' => $supplier->fresh()->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $supplier->load(['creator', 'updater']),
            'message' => 'Supplier updated successfully',
        ]);
    }

    public function destroy(Request $request, Supplier $supplier): JsonResponse
    {
        $this->authorize('delete', $supplier);

        $before = $supplier->toArray();

        // Log transaction before deleting
        Transaction::create([
            'entity_type' => 'suppliers',
            'entity_id' => $supplier->id,
            'user_id' => $request->user()->id,
            'action' => 'delete',
            'data_before' => $before,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $supplier->delete();

        return response()->json([
            'success' => true,
            'message' => 'Supplier deleted successfully',
        ]);
    }
}
