<?php

namespace App\Http\Controllers\Api;

use App\Application\DTOs\ProductDTO;
use App\Application\DTOs\ProductRateDTO;
use App\Application\UseCases\Product\CreateProductUseCase;
use App\Application\UseCases\Product\DeleteProductUseCase;
use App\Application\UseCases\Product\GetProductUseCase;
use App\Application\UseCases\Product\ListProductsUseCase;
use App\Application\UseCases\Product\UpdateProductUseCase;
use App\Application\UseCases\ProductRate\AddProductRateUseCase;
use App\Application\UseCases\ProductRate\GetCurrentRateUseCase;
use App\Application\UseCases\ProductRate\ListProductRatesUseCase;
use App\Domain\Repositories\ProductRateRepositoryInterface;
use App\Domain\Repositories\ProductRepositoryInterface;
use App\Domain\Services\AuditServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    private ProductRepositoryInterface $repository;

    private ProductRateRepositoryInterface $rateRepository;

    private AuditServiceInterface $auditService;

    public function __construct(
        ProductRepositoryInterface $repository,
        ProductRateRepositoryInterface $rateRepository,
        AuditServiceInterface $auditService
    ) {
        $this->repository = $repository;
        $this->rateRepository = $rateRepository;
        $this->auditService = $auditService;
    }

    /**
     * Display a listing of products.
     */
    public function index(Request $request)
    {
        try {
            $useCase = new ListProductsUseCase($this->repository);

            $filters = [
                'status' => $request->get('status'),
                'search' => $request->get('search'),
                'base_unit' => $request->get('base_unit'),
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
                    'current_page' => $result['page'],
                    'per_page' => $result['per_page'],
                    'last_page' => $result['last_page'],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve products',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:products',
            'description' => 'nullable|string',
            'base_unit' => 'required|string|max:20',
            'allowed_units' => 'nullable|array',
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
            $code = $request->code ?? 'PRD'.str_pad(Product::count() + 1, 6, '0', STR_PAD_LEFT);

            $dto = ProductDTO::fromArray([
                'name' => $request->name,
                'code' => $code,
                'description' => $request->description,
                'base_unit' => $request->base_unit,
                'allowed_units' => $request->allowed_units ?? [$request->base_unit],
                'status' => $request->get('status', 'active'),
                'metadata' => $request->get('metadata', []),
            ]);

            $useCase = new CreateProductUseCase($this->repository);
            $product = $useCase->execute($dto);

            $this->auditService->log(
                'create',
                'Product',
                $product->getId(),
                null,
                $product->toArray(),
                'Product created',
                auth()->id()
            );

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'data' => $product->toArray(),
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified product.
     */
    public function show($id)
    {
        try {
            $useCase = new GetProductUseCase($this->repository);
            $product = $useCase->execute($id);

            return response()->json([
                'success' => true,
                'data' => $product->toArray(),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'code' => 'nullable|string|max:50|unique:products,code,'.$id,
            'description' => 'nullable|string',
            'base_unit' => 'sometimes|required|string|max:20',
            'allowed_units' => 'nullable|array',
            'status' => 'nullable|in:active,inactive',
            'version' => 'required|integer', // Version control
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $existingProduct = $this->repository->findById($id);
            if (! $existingProduct) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found',
                ], 404);
            }

            $dto = ProductDTO::fromArray([
                'name' => $request->get('name', $existingProduct->getName()),
                'code' => $request->get('code', $existingProduct->getCode()),
                'description' => $request->get('description', $existingProduct->getDescription()),
                'base_unit' => $request->get('base_unit', $existingProduct->getBaseUnit()),
                'allowed_units' => $request->get('allowed_units', $existingProduct->getAllowedUnits()),
                'status' => $request->get('status', $existingProduct->getStatus()),
                'metadata' => $request->get('metadata', $existingProduct->getMetadata()),
                'id' => $id,
                'version' => $request->version,
            ]);

            $useCase = new UpdateProductUseCase($this->repository);
            $product = $useCase->execute($id, $dto);

            $this->auditService->log(
                'update',
                'Product',
                $product->getId(),
                $existingProduct->toArray(),
                $product->toArray(),
                'Product updated',
                auth()->id()
            );

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'data' => $product->toArray(),
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
            ], 409); // Conflict
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified product.
     */
    public function destroy($id)
    {
        try {
            $useCase = new GetProductUseCase($this->repository);
            $product = $useCase->execute($id);
            $oldData = $product->toArray();

            $deleteUseCase = new DeleteProductUseCase($this->repository);
            $deleteUseCase->execute($id);

            $this->auditService->log(
                'delete',
                'Product',
                $id,
                $oldData,
                null,
                'Product deleted',
                auth()->id()
            );

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully',
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all rates for a product.
     */
    public function rates($id)
    {
        try {
            $useCase = new ListProductRatesUseCase($this->rateRepository);
            $rates = $useCase->execute($id, false);

            return response()->json([
                'success' => true,
                'data' => array_map(fn ($rate) => $rate->toArray(), $rates),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve rates',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Add a new rate for a product.
     */
    public function addRate(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'rate' => 'required|numeric|min:0',
            'unit' => 'required|string|max:20',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'is_active' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $dto = ProductRateDTO::fromArray([
                'product_id' => $id,
                'rate' => $request->rate,
                'unit' => $request->unit,
                'effective_from' => $request->effective_from,
                'effective_to' => $request->effective_to,
                'is_active' => $request->get('is_active', true),
                'notes' => $request->notes,
            ]);

            $useCase = new AddProductRateUseCase($this->rateRepository, $this->repository);
            $rate = $useCase->execute($dto);

            $this->auditService->log(
                'add_rate',
                'Product',
                $id,
                null,
                $rate->toArray(),
                'Product rate added',
                auth()->id()
            );

            return response()->json([
                'success' => true,
                'message' => 'Rate added successfully',
                'data' => $rate->toArray(),
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add rate',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get current rate for a product.
     */
    public function currentRate($id)
    {
        try {
            $product = $this->repository->findById($id);
            if (! $product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found',
                ], 404);
            }

            $unit = request()->get('unit', $product->getBaseUnit());

            $useCase = new GetCurrentRateUseCase($this->rateRepository, $this->repository);
            $rate = $useCase->execute($id, $unit);

            return response()->json([
                'success' => true,
                'data' => $rate->toArray(),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve current rate',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
