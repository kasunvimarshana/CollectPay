<?php

namespace App\Http\Controllers\Api\V1;

use App\Application\DTOs\SupplierDTO;
use App\Application\UseCases\Supplier\CreateSupplierUseCase;
use App\Application\UseCases\Supplier\UpdateSupplierUseCase;
use App\Application\UseCases\Supplier\GetSupplierUseCase;
use App\Application\UseCases\Supplier\ListSuppliersUseCase;
use App\Application\UseCases\Supplier\DeleteSupplierUseCase;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Supplier API Controller
 * 
 * Handles HTTP requests for supplier management
 */
class SupplierController extends Controller
{
    public function __construct(
        private CreateSupplierUseCase $createUseCase,
        private UpdateSupplierUseCase $updateUseCase,
        private GetSupplierUseCase $getUseCase,
        private ListSuppliersUseCase $listUseCase,
        private DeleteSupplierUseCase $deleteUseCase
    ) {}

    /**
     * Display a listing of suppliers
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'is_active' => $request->get('is_active'),
            'search' => $request->get('search'),
        ];

        $page = (int) $request->get('page', 1);
        $perPage = (int) $request->get('per_page', 50);

        $result = $this->listUseCase->execute($filters, $page, $perPage);

        return response()->json([
            'data' => SupplierResource::collection(collect($result['data']))->toArray($request),
            'meta' => $result['meta']
        ]);
    }

    /**
     * Store a newly created supplier
     */
    public function store(StoreSupplierRequest $request): JsonResponse
    {
        $dto = SupplierDTO::fromArray($request->validated());
        $supplier = $this->createUseCase->execute($dto);

        return response()->json(
            new SupplierResource((object) $supplier->toArray()),
            201
        );
    }

    /**
     * Display the specified supplier
     */
    public function show(int $id): JsonResponse
    {
        $supplier = $this->getUseCase->execute($id);

        if (!$supplier) {
            return response()->json([
                'message' => 'Supplier not found'
            ], 404);
        }

        return response()->json(
            new SupplierResource((object) $supplier->toArray())
        );
    }

    /**
     * Update the specified supplier
     */
    public function update(UpdateSupplierRequest $request, int $id): JsonResponse
    {
        $dto = SupplierDTO::fromArray($request->validated());
        $supplier = $this->updateUseCase->execute($id, $dto);

        return response()->json(
            new SupplierResource((object) $supplier->toArray())
        );
    }

    /**
     * Remove the specified supplier
     */
    public function destroy(int $id): JsonResponse
    {
        $this->deleteUseCase->execute($id);

        return response()->json(null, 204);
    }
}
