<?php

declare(strict_types=1);

namespace Presentation\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Application\UseCases\Supplier\CreateSupplierUseCase;
use Application\UseCases\Supplier\UpdateSupplierUseCase;
use Application\UseCases\Supplier\GetSupplierUseCase;
use Application\UseCases\Supplier\ListSuppliersUseCase;
use Application\UseCases\Supplier\DeleteSupplierUseCase;
use Application\DTOs\CreateSupplierDTO;
use Application\DTOs\UpdateSupplierDTO;
use Presentation\Http\Requests\CreateSupplierRequest;
use Presentation\Http\Requests\UpdateSupplierRequest;
use Presentation\Http\Resources\SupplierResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use InvalidArgumentException;
use Exception;

/**
 * Supplier Controller
 * 
 * Handles HTTP requests for supplier management
 * Delegates business logic to use cases
 */
class SupplierController extends Controller
{
    public function __construct(
        private readonly CreateSupplierUseCase $createSupplier,
        private readonly UpdateSupplierUseCase $updateSupplier,
        private readonly GetSupplierUseCase $getSupplier,
        private readonly ListSuppliersUseCase $listSuppliers,
        private readonly DeleteSupplierUseCase $deleteSupplier
    ) {
    }

    /**
     * List all suppliers with optional filters
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = [];
            
            if ($request->has('active')) {
                $filters['active'] = filter_var($request->get('active'), FILTER_VALIDATE_BOOLEAN);
            }
            
            if ($request->has('search')) {
                $filters['search'] = $request->get('search');
            }

            $page = (int) $request->get('page', 1);
            $perPage = (int) $request->get('per_page', 15);

            $result = $this->listSuppliers->execute($filters, $page, $perPage);

            return response()->json([
                'success' => true,
                'data' => SupplierResource::collection($result['data']),
                'meta' => [
                    'total' => $result['total'],
                    'page' => $result['page'],
                    'per_page' => $result['per_page'],
                    'last_page' => $result['last_page'],
                ],
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve suppliers',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a single supplier by ID
     */
    public function show(string $id): JsonResponse
    {
        try {
            $supplier = $this->getSupplier->execute($id);

            return response()->json([
                'success' => true,
                'data' => new SupplierResource($supplier),
            ]);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve supplier',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new supplier
     */
    public function store(CreateSupplierRequest $request): JsonResponse
    {
        try {
            $dto = CreateSupplierDTO::fromArray($request->validated());
            $supplier = $this->createSupplier->execute($dto);

            return response()->json([
                'success' => true,
                'message' => 'Supplier created successfully',
                'data' => new SupplierResource($supplier),
            ], 201);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create supplier',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update an existing supplier
     */
    public function update(UpdateSupplierRequest $request, string $id): JsonResponse
    {
        try {
            $data = array_merge($request->validated(), ['id' => $id]);
            $dto = UpdateSupplierDTO::fromArray($data);
            $supplier = $this->updateSupplier->execute($dto);

            return response()->json([
                'success' => true,
                'message' => 'Supplier updated successfully',
                'data' => new SupplierResource($supplier),
            ]);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getMessage() === "Supplier not found with ID: {$id}" ? 404 : 422);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update supplier',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a supplier
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $this->deleteSupplier->execute($id);

            return response()->json([
                'success' => true,
                'message' => 'Supplier deleted successfully',
            ]);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete supplier',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
