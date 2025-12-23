<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()->with(['supplier', 'creator', 'updater']);

        // Filter by supplier
        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
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
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Pagination
        $perPage = min($request->get('per_page', 15), 100);
        $products = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = Product::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
            'version' => 1,
        ]);

        // Log transaction
        Transaction::create([
            'entity_type' => 'products',
            'entity_id' => $product->id,
            'user_id' => $request->user()->id,
            'action' => 'create',
            'data_after' => $product->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $product->load(['supplier', 'creator', 'updater']),
            'message' => 'Product created successfully',
        ], 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $product->load(['supplier', 'creator', 'updater', 'rates', 'payments']),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $before = $product->toArray();

        $product->update([
            ...$request->validated(),
            'updated_by' => $request->user()->id,
            'version' => $product->version + 1,
        ]);

        // Log transaction
        Transaction::create([
            'entity_type' => 'products',
            'entity_id' => $product->id,
            'user_id' => $request->user()->id,
            'action' => 'update',
            'data_before' => $before,
            'data_after' => $product->fresh()->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $product->load(['supplier', 'creator', 'updater']),
            'message' => 'Product updated successfully',
        ]);
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        $before = $product->toArray();

        // Log transaction before deleting
        Transaction::create([
            'entity_type' => 'products',
            'entity_id' => $product->id,
            'user_id' => $request->user()->id,
            'action' => 'delete',
            'data_before' => $before,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully',
        ]);
    }

    public function bySupplier(Request $request, $supplierId): JsonResponse
    {
        $query = Product::query()
            ->with(['supplier', 'creator', 'updater'])
            ->where('supplier_id', $supplierId);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = min($request->get('per_page', 15), 100);
        $products = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }
}
