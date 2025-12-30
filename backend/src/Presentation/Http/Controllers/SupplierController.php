<?php

declare(strict_types=1);

namespace Presentation\Http\Controllers;

use Application\DTOs\CreateSupplierDTO;
use Application\DTOs\UpdateSupplierDTO;
use Application\UseCases\Supplier\CreateSupplierUseCase;
use Application\UseCases\Supplier\UpdateSupplierUseCase;
use Application\UseCases\Supplier\DeleteSupplierUseCase;
use Application\UseCases\Supplier\GetSupplierUseCase;
use Application\UseCases\Supplier\ListSuppliersUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Supplier Controller
 * 
 * Handles CRUD operations for suppliers.
 * Follows Clean Architecture by delegating all business logic to use cases.
 */
final class SupplierController extends Controller
{
    public function __construct(
        private readonly CreateSupplierUseCase $createSupplier,
        private readonly UpdateSupplierUseCase $updateSupplier,
        private readonly DeleteSupplierUseCase $deleteSupplier,
        private readonly GetSupplierUseCase $getSupplier,
        private readonly ListSuppliersUseCase $listSuppliers
    ) {}

    /**
     * List all suppliers with pagination and filters.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
            'is_active' => 'boolean',
            'search' => 'string|max:255',
        ]);

        try {
            $result = $this->listSuppliers->execute(
                page: (int) ($validated['page'] ?? 1),
                perPage: (int) ($validated['per_page'] ?? 15),
                filters: [
                    'is_active' => $validated['is_active'] ?? null,
                    'search' => $validated['search'] ?? null,
                ]
            );

            return $this->paginated([
                'data' => array_map(fn($supplier) => [
                    'id' => $supplier->id(),
                    'name' => $supplier->name(),
                    'email' => $supplier->email()?->value(),
                    'phone' => $supplier->phone()?->value(),
                    'address' => $supplier->address(),
                    'is_active' => $supplier->isActive(),
                    'metadata' => $supplier->metadata(),
                    'created_at' => $supplier->createdAt()->format('Y-m-d H:i:s'),
                    'updated_at' => $supplier->updatedAt()->format('Y-m-d H:i:s'),
                ], $result['data']),
                'total' => $result['total'],
                'page' => $result['page'],
                'per_page' => $result['per_page'],
                'last_page' => $result['last_page'],
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to list suppliers: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get a single supplier by ID.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $supplier = $this->getSupplier->execute($id);

            return $this->success([
                'id' => $supplier->id(),
                'name' => $supplier->name(),
                'email' => $supplier->email()?->value(),
                'phone' => $supplier->phone()?->value(),
                'address' => $supplier->address(),
                'is_active' => $supplier->isActive(),
                'metadata' => $supplier->metadata(),
                'created_at' => $supplier->createdAt()->format('Y-m-d H:i:s'),
                'updated_at' => $supplier->updatedAt()->format('Y-m-d H:i:s'),
            ]);
        } catch (\Exception $e) {
            return $this->error('Supplier not found: ' . $e->getMessage(), 404);
        }
    }

    /**
     * Create a new supplier.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'metadata' => 'nullable|array',
        ]);

        try {
            $dto = CreateSupplierDTO::fromArray([
                'name' => $validated['name'],
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
                'metadata' => $validated['metadata'] ?? [],
                'is_active' => true,
            ]);

            $supplier = $this->createSupplier->execute($dto);

            return $this->created([
                'id' => $supplier->id(),
                'name' => $supplier->name(),
                'email' => $supplier->email()?->value(),
                'phone' => $supplier->phone()?->value(),
                'address' => $supplier->address(),
                'is_active' => $supplier->isActive(),
                'metadata' => $supplier->metadata(),
                'created_at' => $supplier->createdAt()->format('Y-m-d H:i:s'),
                'updated_at' => $supplier->updatedAt()->format('Y-m-d H:i:s'),
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to create supplier: ' . $e->getMessage(), 422);
        }
    }

    /**
     * Update an existing supplier.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'metadata' => 'nullable|array',
        ]);

        try {
            $dto = UpdateSupplierDTO::fromArray($validated);
            $supplier = $this->updateSupplier->execute($id, $dto);

            return $this->success([
                'id' => $supplier->id(),
                'name' => $supplier->name(),
                'email' => $supplier->email()?->value(),
                'phone' => $supplier->phone()?->value(),
                'address' => $supplier->address(),
                'is_active' => $supplier->isActive(),
                'metadata' => $supplier->metadata(),
                'created_at' => $supplier->createdAt()->format('Y-m-d H:i:s'),
                'updated_at' => $supplier->updatedAt()->format('Y-m-d H:i:s'),
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to update supplier: ' . $e->getMessage(), 422);
        }
    }

    /**
     * Delete a supplier.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $this->deleteSupplier->execute($id);
            return $this->noContent();
        } catch (\Exception $e) {
            return $this->error('Failed to delete supplier: ' . $e->getMessage(), 422);
        }
    }
}
