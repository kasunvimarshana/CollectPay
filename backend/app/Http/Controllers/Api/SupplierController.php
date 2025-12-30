<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Application\UseCases\Supplier\CreateSupplierUseCase;
use Application\DTOs\CreateSupplierDTO;
use Domain\Repositories\SupplierRepositoryInterface;

class SupplierController extends Controller
{
    public function __construct(
        private readonly SupplierRepositoryInterface $supplierRepository,
        private readonly CreateSupplierUseCase $createSupplierUseCase
    ) {}

    /**
     * Display a listing of suppliers.
     */
    public function index(Request $request): JsonResponse
    {
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 20);

        $suppliers = $this->supplierRepository->findAll((int) $page, (int) $perPage);

        return response()->json([
            'data' => array_map(fn($supplier) => $supplier->toArray(), $suppliers),
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Store a newly created supplier.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:suppliers,code',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
        ]);

        try {
            $dto = CreateSupplierDTO::fromArray($validated);
            $supplier = $this->createSupplierUseCase->execute($dto);

            return response()->json([
                'message' => 'Supplier created successfully',
                'data' => $supplier->toArray(),
            ], 201);
        } catch (\DomainException $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display the specified supplier.
     */
    public function show(string $id): JsonResponse
    {
        $supplier = $this->supplierRepository->findById($id);

        if (!$supplier) {
            return response()->json([
                'error' => 'Supplier not found',
            ], 404);
        }

        return response()->json([
            'data' => $supplier->toArray(),
        ]);
    }

    /**
     * Update the specified supplier.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $supplier = $this->supplierRepository->findById($id);

        if (!$supplier) {
            return response()->json([
                'error' => 'Supplier not found',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
        ]);

        $supplier->updateDetails(
            $validated['name'],
            $validated['address'] ?? null,
            $validated['phone'] ?? null,
            $validated['email'] ?? null
        );

        $this->supplierRepository->save($supplier);

        return response()->json([
            'message' => 'Supplier updated successfully',
            'data' => $supplier->toArray(),
        ]);
    }

    /**
     * Remove the specified supplier.
     */
    public function destroy(string $id): JsonResponse
    {
        $supplier = $this->supplierRepository->findById($id);

        if (!$supplier) {
            return response()->json([
                'error' => 'Supplier not found',
            ], 404);
        }

        $supplier->delete();
        $this->supplierRepository->save($supplier);

        return response()->json([
            'message' => 'Supplier deleted successfully',
        ]);
    }
}

