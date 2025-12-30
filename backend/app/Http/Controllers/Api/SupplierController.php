<?php

namespace App\Http\Controllers\Api;

use App\Application\DTOs\SupplierDTO;
use App\Application\UseCases\Supplier\CreateSupplierUseCase;
use App\Application\UseCases\Supplier\DeleteSupplierUseCase;
use App\Application\UseCases\Supplier\GetSupplierUseCase;
use App\Application\UseCases\Supplier\ListSuppliersUseCase;
use App\Application\UseCases\Supplier\UpdateSupplierUseCase;
use App\Domain\Repositories\SupplierRepositoryInterface;
use App\Domain\Services\AuditServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Supplier Controller
 *
 * Handles HTTP requests for supplier operations.
 * Follows Clean Architecture by delegating business logic to Use Cases.
 * This is the Interface/Presentation layer.
 */
class SupplierController extends Controller
{
    private SupplierRepositoryInterface $repository;

    private AuditServiceInterface $auditService;

    public function __construct(
        SupplierRepositoryInterface $repository,
        AuditServiceInterface $auditService
    ) {
        $this->repository = $repository;
        $this->auditService = $auditService;
    }

    /**
     * Display a listing of suppliers.
     */
    public function index(Request $request)
    {
        try {
            $useCase = new ListSuppliersUseCase($this->repository);

            $filters = [
                'status' => $request->get('status'),
                'search' => $request->get('search'),
            ];

            $filters = array_filter($filters, fn ($value) => $value !== null);

            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 15);

            $result = $useCase->execute($filters, $page, $perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => array_map(fn ($entity) => $entity->toArray(), $result['data']),
                    'total' => $result['total'],
                    'current_page' => $result['current_page'],
                    'per_page' => $result['per_page'],
                    'last_page' => $result['last_page'],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve suppliers',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created supplier.
     */
    public function store(Request $request)
    {
        // Input validation (at presentation layer)
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'status' => 'nullable|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Auto-generate code if not provided
            $code = $request->code ?? 'SUP'.str_pad(Supplier::count() + 1, 6, '0', STR_PAD_LEFT);

            // Create DTO from request
            $dto = SupplierDTO::fromArray([
                'name' => $request->name,
                'code' => $code,
                'contact_person' => $request->contact_person,
                'phone' => $request->phone,
                'email' => $request->email,
                'address' => $request->address,
                'city' => $request->city,
                'state' => $request->state,
                'country' => $request->country,
                'postal_code' => $request->postal_code,
                'status' => $request->get('status', 'active'),
            ]);

            // Execute use case
            $useCase = new CreateSupplierUseCase($this->repository);
            $supplier = $useCase->execute($dto);

            // Log audit trail using service (Clean Architecture)
            $this->auditService->log('create', 'Supplier', $supplier->getId(), null, $supplier->toArray(), 'Supplier created', auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Supplier created successfully',
                'data' => $supplier->toArray(),
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create supplier',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified supplier.
     */
    public function show($id)
    {
        try {
            $useCase = new GetSupplierUseCase($this->repository);
            $supplier = $useCase->execute($id);

            return response()->json([
                'success' => true,
                'data' => $supplier->toArray(),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve supplier',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified supplier.
     */
    public function update(Request $request, $id)
    {
        // Input validation
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'code' => 'nullable|string|max:50',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'status' => 'nullable|in:active,inactive',
            'version' => 'required|integer', // Required for optimistic locking
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Get current supplier to preserve unchanged fields
            $getUseCase = new GetSupplierUseCase($this->repository);
            $currentSupplier = $getUseCase->execute($id);

            // Create DTO with merged data (current + updates)
            $dto = SupplierDTO::fromArray([
                'name' => $request->get('name', $currentSupplier->getName()),
                'code' => $request->get('code', $currentSupplier->getCode()),
                'contact_person' => $request->has('contact_person') ? $request->contact_person : $currentSupplier->getContactPerson(),
                'phone' => $request->has('phone') ? $request->phone : $currentSupplier->getPhone(),
                'email' => $request->has('email') ? $request->email : $currentSupplier->getEmail(),
                'address' => $request->has('address') ? $request->address : $currentSupplier->getAddress(),
                'city' => $request->has('city') ? $request->city : $currentSupplier->getCity(),
                'state' => $request->has('state') ? $request->state : $currentSupplier->getState(),
                'country' => $request->has('country') ? $request->country : $currentSupplier->getCountry(),
                'postal_code' => $request->has('postal_code') ? $request->postal_code : $currentSupplier->getPostalCode(),
                'status' => $request->get('status', $currentSupplier->getStatus()),
                'version' => $request->version,
            ]);

            // Execute use case
            $useCase = new UpdateSupplierUseCase($this->repository);
            $updatedSupplier = $useCase->execute($id, $dto);

            // Log audit trail using service (Clean Architecture)
            $this->auditService->log('update', 'Supplier', $updatedSupplier->getId(),
                $currentSupplier->toArray(), $updatedSupplier->toArray(),
                'Supplier updated', auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Supplier updated successfully',
                'data' => $updatedSupplier->toArray(),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 409); // Conflict status code for version mismatch
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update supplier',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified supplier.
     */
    public function destroy($id)
    {
        try {
            // Get supplier before deletion for audit log
            $getUseCase = new GetSupplierUseCase($this->repository);
            $supplier = $getUseCase->execute($id);
            $oldData = $supplier->toArray();

            // Execute delete use case
            $useCase = new DeleteSupplierUseCase($this->repository);
            $useCase->execute($id);

            // Log audit trail using service (Clean Architecture)
            $this->auditService->log('delete', 'Supplier', $id, $oldData, null, 'Supplier deleted', auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Supplier deleted successfully',
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete supplier',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get collections for a supplier.
     */
    public function collections($id)
    {
        try {
            $filters = [];
            $collections = $this->repository->getCollections($id, $filters);

            return response()->json([
                'success' => true,
                'data' => $collections,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve collections',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get payments for a supplier.
     */
    public function payments($id)
    {
        try {
            $filters = [];
            $payments = $this->repository->getPayments($id, $filters);

            return response()->json([
                'success' => true,
                'data' => $payments,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve payments',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get balance for a supplier.
     */
    public function balance($id)
    {
        try {
            // Get supplier to include name
            $getUseCase = new GetSupplierUseCase($this->repository);
            $supplier = $getUseCase->execute($id);

            // Get balance
            $balance = $this->repository->getBalance($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'supplier_id' => $id,
                    'supplier_name' => $supplier->getName(),
                    'total_collections' => $balance['total_collections'],
                    'total_payments' => $balance['total_payments'],
                    'outstanding_balance' => $balance['outstanding_balance'],
                ],
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to calculate balance',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
