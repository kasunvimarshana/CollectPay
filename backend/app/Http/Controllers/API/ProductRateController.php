<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Application\UseCases\CreateProductRateUseCase;
use App\Application\UseCases\UpdateProductRateUseCase;
use App\Application\UseCases\GetProductRateUseCase;
use App\Application\UseCases\DeleteProductRateUseCase;
use App\Application\DTOs\CreateProductRateDTO;
use App\Application\DTOs\UpdateProductRateDTO;
use App\Domain\Repositories\ProductRateRepositoryInterface;
use App\Domain\Exceptions\EntityNotFoundException;
use App\Domain\Exceptions\VersionConflictException;
use App\Models\ProductRate;
use Illuminate\Http\Request;

class ProductRateController extends Controller
{
    private ProductRateRepositoryInterface $productRateRepository;
    private CreateProductRateUseCase $createProductRateUseCase;
    private UpdateProductRateUseCase $updateProductRateUseCase;
    private GetProductRateUseCase $getProductRateUseCase;
    private DeleteProductRateUseCase $deleteProductRateUseCase;

    public function __construct(
        ProductRateRepositoryInterface $productRateRepository,
        CreateProductRateUseCase $createProductRateUseCase,
        UpdateProductRateUseCase $updateProductRateUseCase,
        GetProductRateUseCase $getProductRateUseCase,
        DeleteProductRateUseCase $deleteProductRateUseCase
    ) {
        $this->productRateRepository = $productRateRepository;
        $this->createProductRateUseCase = $createProductRateUseCase;
        $this->updateProductRateUseCase = $updateProductRateUseCase;
        $this->getProductRateUseCase = $getProductRateUseCase;
        $this->deleteProductRateUseCase = $deleteProductRateUseCase;
    }
    /**
     * @OA\Get(
     *     path="/api/product-rates",
     *     tags={"Product Rates"},
     *     summary="List all product rates",
     *     description="Get paginated list of product rates with optional filters and sorting",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="product_id",
     *         in="query",
     *         description="Filter by product ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="unit",
     *         in="query",
     *         description="Filter by unit",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="is_active",
     *         in="query",
     *         description="Filter by active status",
     *         required=false,
     *         @OA\Schema(type="boolean")
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Sort by field",
     *         required=false,
     *         @OA\Schema(type="string", enum={"effective_date","rate","unit","created_at","updated_at"}, default="effective_date")
     *     ),
     *     @OA\Parameter(
     *         name="sort_order",
     *         in="query",
     *         description="Sort order",
     *         required=false,
     *         @OA\Schema(type="string", enum={"asc","desc"}, default="desc")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Results per page (max: 100)",
     *         required=false,
     *         @OA\Schema(type="integer", default=15, maximum=100)
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number",
     *         required=false,
     *         @OA\Schema(type="integer", default=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="product_id", type="integer"),
     *                 @OA\Property(property="unit", type="string"),
     *                 @OA\Property(property="rate", type="number", format="float"),
     *                 @OA\Property(property="effective_date", type="string", format="date"),
     *                 @OA\Property(property="end_date", type="string", format="date", nullable=true),
     *                 @OA\Property(property="is_active", type="boolean"),
     *                 @OA\Property(property="version", type="integer")
     *             )),
     *             @OA\Property(property="current_page", type="integer"),
     *             @OA\Property(property="per_page", type="integer"),
     *             @OA\Property(property="total", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request)
    {
        $filters = [
            'product_id' => $request->input('product_id'),
            'unit' => $request->input('unit'),
            'is_active' => $request->input('is_active'),
            'sort_by' => $request->input('sort_by', 'effective_date'),
            'sort_order' => $request->input('sort_order', 'desc'),
        ];

        $page = (int) $request->input('page', 1);
        $perPage = min((int) $request->input('per_page', 15), 100);

        $rates = $this->productRateRepository->findAll($filters, $page, $perPage);
        $total = $this->productRateRepository->count($filters);

        // Convert entities to arrays and include product relationship
        $data = array_map(function($rate) {
            $rateData = $rate->toArray();
            
            // Load product relationship using model temporarily
            // TODO: Move this to use case or create a dedicated DTO
            $model = ProductRate::with('product')->find($rate->getId());
            if ($model) {
                $rateData['product'] = $model->product;
            }
            
            return $rateData;
        }, $rates);

        return response()->json([
            'data' => $data,
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'last_page' => ceil($total / $perPage),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/product-rates",
     *     tags={"Product Rates"},
     *     summary="Create a new product rate",
     *     description="Create a new product rate record",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_id","unit","rate","effective_date"},
     *             @OA\Property(property="product_id", type="integer", example=1),
     *             @OA\Property(property="unit", type="string", maxLength=50, example="kg"),
     *             @OA\Property(property="rate", type="number", format="float", minimum=0.01, example=120.00),
     *             @OA\Property(property="effective_date", type="string", format="date", example="2025-12-26"),
     *             @OA\Property(property="end_date", type="string", format="date", nullable=true, example=null),
     *             @OA\Property(property="metadata", type="object"),
     *             @OA\Property(property="is_active", type="boolean", default=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Product rate created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="product_id", type="integer"),
     *             @OA\Property(property="unit", type="string"),
     *             @OA\Property(property="rate", type="number", format="float"),
     *             @OA\Property(property="effective_date", type="string", format="date"),
     *             @OA\Property(property="is_active", type="boolean"),
     *             @OA\Property(property="version", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'unit' => 'required|string|max:50',
            'rate' => 'required|numeric|min:0.01',
            'effective_date' => 'required|date',
            'end_date' => 'nullable|date|after:effective_date',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        try {
            $dto = CreateProductRateDTO::fromArray($validated);
            $rate = $this->createProductRateUseCase->execute($dto);
            
            // Load product relationship for response
            $model = ProductRate::with('product')->find($rate->getId());
            
            return response()->json($model, 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            \Log::error('Failed to create product rate', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to create product rate'], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/product-rates/{id}",
     *     tags={"Product Rates"},
     *     summary="Get product rate details",
     *     description="Get a single product rate by ID with related product",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Product Rate ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="product_id", type="integer"),
     *             @OA\Property(property="unit", type="string"),
     *             @OA\Property(property="rate", type="number", format="float"),
     *             @OA\Property(property="effective_date", type="string", format="date"),
     *             @OA\Property(property="end_date", type="string", format="date", nullable=true),
     *             @OA\Property(property="is_active", type="boolean"),
     *             @OA\Property(property="version", type="integer"),
     *             @OA\Property(property="product", type="object",
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="name", type="string"),
     *                 @OA\Property(property="code", type="string")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=404, description="Product rate not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function show(string $id)
    {
        try {
            $rate = $this->getProductRateUseCase->execute((int) $id);
            
            // Load product relationship for response
            $model = ProductRate::with('product')->findOrFail($id);
            
            return response()->json($model);
        } catch (EntityNotFoundException $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            \Log::error('Failed to retrieve product rate', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to retrieve product rate'], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/product-rates/{id}",
     *     tags={"Product Rates"},
     *     summary="Update a product rate",
     *     description="Update an existing product rate record with version control",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Product Rate ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"version"},
     *             @OA\Property(property="product_id", type="integer"),
     *             @OA\Property(property="unit", type="string", maxLength=50),
     *             @OA\Property(property="rate", type="number", format="float", minimum=0.01),
     *             @OA\Property(property="effective_date", type="string", format="date"),
     *             @OA\Property(property="end_date", type="string", format="date", nullable=true),
     *             @OA\Property(property="metadata", type="object"),
     *             @OA\Property(property="is_active", type="boolean"),
     *             @OA\Property(property="version", type="integer", description="Current version for optimistic locking")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Product rate updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="rate", type="number", format="float"),
     *             @OA\Property(property="version", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Product rate not found"),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=500, description="Version mismatch"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'product_id' => 'sometimes|required|exists:products,id',
            'unit' => 'sometimes|required|string|max:50',
            'rate' => 'sometimes|required|numeric|min:0.01',
            'effective_date' => 'sometimes|required|date',
            'end_date' => 'nullable|date|after:effective_date',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
            'version' => 'required|integer',
        ]);

        try {
            $dto = UpdateProductRateDTO::fromArray((int) $id, $validated);
            $rate = $this->updateProductRateUseCase->execute($dto);
            
            // Load product relationship for response
            $model = ProductRate::with('product')->find($rate->getId());
            
            return response()->json($model);
        } catch (EntityNotFoundException $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        } catch (VersionConflictException $e) {
            return response()->json(['error' => $e->getMessage()], 409);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            \Log::error('Failed to update product rate', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to update product rate'], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/product-rates/{id}",
     *     tags={"Product Rates"},
     *     summary="Delete a product rate",
     *     description="Soft delete a product rate record",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Product Rate ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Product rate deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Product rate deleted successfully")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Product rate not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function destroy(string $id)
    {
        try {
            $deleted = $this->deleteProductRateUseCase->execute((int) $id);

            if (!$deleted) {
                return response()->json(['error' => 'Product rate not found'], 404);
            }

            return response()->json(['message' => 'Product rate deleted successfully']);
        } catch (\Exception $e) {
            \Log::error('Failed to delete product rate', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to delete product rate'], 500);
        }
    }
}
