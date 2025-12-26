<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Application\UseCases\CreateCollectionUseCase;
use App\Application\UseCases\UpdateCollectionUseCase;
use App\Application\UseCases\GetCollectionUseCase;
use App\Application\UseCases\DeleteCollectionUseCase;
use App\Application\DTOs\CreateCollectionDTO;
use App\Application\DTOs\UpdateCollectionDTO;
use App\Domain\Repositories\CollectionRepositoryInterface;
use App\Domain\Exceptions\EntityNotFoundException;
use App\Domain\Exceptions\VersionConflictException;
use App\Domain\Exceptions\InvalidOperationException;
use App\Models\Collection;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CollectionController extends Controller
{
    private CollectionRepositoryInterface $collectionRepository;
    private CreateCollectionUseCase $createCollectionUseCase;
    private UpdateCollectionUseCase $updateCollectionUseCase;
    private GetCollectionUseCase $getCollectionUseCase;
    private DeleteCollectionUseCase $deleteCollectionUseCase;

    public function __construct(
        CollectionRepositoryInterface $collectionRepository,
        CreateCollectionUseCase $createCollectionUseCase,
        UpdateCollectionUseCase $updateCollectionUseCase,
        GetCollectionUseCase $getCollectionUseCase,
        DeleteCollectionUseCase $deleteCollectionUseCase
    ) {
        $this->collectionRepository = $collectionRepository;
        $this->createCollectionUseCase = $createCollectionUseCase;
        $this->updateCollectionUseCase = $updateCollectionUseCase;
        $this->getCollectionUseCase = $getCollectionUseCase;
        $this->deleteCollectionUseCase = $deleteCollectionUseCase;
    }
    /**
     * @OA\Get(
     *     path="/api/collections",
     *     tags={"Collections"},
     *     summary="List all collections",
     *     description="Get paginated list of collections with filtering and sorting",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="supplier_id",
     *         in="query",
     *         description="Filter by supplier ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="product_id",
     *         in="query",
     *         description="Filter by product ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="from_date",
     *         in="query",
     *         description="Filter from date (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="to_date",
     *         in="query",
     *         description="Filter to date (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Sort by field",
     *         required=false,
     *         @OA\Schema(type="string", enum={"collection_date","quantity","total_amount","created_at","updated_at"}, default="collection_date")
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
     *         description="Results per page",
     *         required=false,
     *         @OA\Schema(type="integer", default=15, maximum=100)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="supplier_id", type="integer"),
     *                 @OA\Property(property="product_id", type="integer"),
     *                 @OA\Property(property="collection_date", type="string", format="date"),
     *                 @OA\Property(property="quantity", type="number"),
     *                 @OA\Property(property="unit", type="string"),
     *                 @OA\Property(property="rate_applied", type="number"),
     *                 @OA\Property(property="total_amount", type="number")
     *             ))
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request)
    {
        $filters = [
            'supplier_id' => $request->input('supplier_id'),
            'product_id' => $request->input('product_id'),
            'from_date' => $request->input('from_date'),
            'to_date' => $request->input('to_date'),
            'sort_by' => $request->input('sort_by', 'collection_date'),
            'sort_order' => $request->input('sort_order', 'desc'),
        ];

        $page = (int) $request->input('page', 1);
        $perPage = min((int) $request->input('per_page', 15), 100);

        $collections = $this->collectionRepository->findAll($filters, $page, $perPage);
        $total = $this->collectionRepository->count($filters);

        // Convert entities to arrays and include relationships
        $data = array_map(function($collection) {
            $collectionData = $collection->toArray();
            
            // Load relationships using original model for now
            // TODO: Move this to a dedicated use case or service
            $model = Collection::with(['supplier', 'product', 'user', 'productRate'])
                ->find($collection->getId());
            
            if ($model) {
                $collectionData['supplier'] = $model->supplier;
                $collectionData['product'] = $model->product;
                $collectionData['user'] = $model->user;
                $collectionData['product_rate'] = $model->productRate;
            }
            
            return $collectionData;
        }, $collections);

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
     *     path="/api/collections",
     *     tags={"Collections"},
     *     summary="Create a new collection",
     *     description="Create a new collection record. Rate and total amount are calculated automatically.",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"supplier_id","product_id","collection_date","quantity","unit"},
     *             @OA\Property(property="supplier_id", type="integer", example=1),
     *             @OA\Property(property="product_id", type="integer", example=1),
     *             @OA\Property(property="collection_date", type="string", format="date", example="2025-12-25"),
     *             @OA\Property(property="quantity", type="number", minimum=0.001, example=50.5),
     *             @OA\Property(property="unit", type="string", maxLength=50, example="kg"),
     *             @OA\Property(property="notes", type="string", example="Afternoon collection"),
     *             @OA\Property(property="metadata", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Collection created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="supplier_id", type="integer"),
     *             @OA\Property(property="product_id", type="integer"),
     *             @OA\Property(property="collection_date", type="string", format="date"),
     *             @OA\Property(property="quantity", type="number"),
     *             @OA\Property(property="unit", type="string"),
     *             @OA\Property(property="rate_applied", type="number", description="Automatically applied rate"),
     *             @OA\Property(property="total_amount", type="number", description="Calculated as quantity * rate_applied")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
            'collection_date' => 'required|date',
            'quantity' => 'required|numeric|min:0.001',
            'unit' => 'required|string|max:50',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        try {
            $validated['user_id'] = $request->user()->id;
            $dto = CreateCollectionDTO::fromArray($validated);
            $collection = $this->createCollectionUseCase->execute($dto);
            
            // Load relationships for response
            $model = Collection::with(['supplier', 'product', 'user', 'productRate'])
                ->find($collection->getId());
            
            return response()->json($model, 201);
        } catch (InvalidOperationException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            \Log::error('Failed to create collection', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to create collection'], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $collection = $this->getCollectionUseCase->execute((int) $id);
            
            // Load relationships for response
            $model = Collection::with(['supplier', 'product', 'user', 'productRate'])
                ->findOrFail($id);
                
            return response()->json($model);
        } catch (EntityNotFoundException $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            \Log::error('Failed to retrieve collection', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to retrieve collection'], 500);
        }
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'supplier_id' => 'sometimes|required|exists:suppliers,id',
            'product_id' => 'sometimes|required|exists:products,id',
            'collection_date' => 'sometimes|required|date',
            'quantity' => 'sometimes|required|numeric|min:0.001',
            'unit' => 'sometimes|required|string|max:50',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
            'version' => 'required|integer',
        ]);

        try {
            $dto = UpdateCollectionDTO::fromArray((int) $id, $validated);
            $collection = $this->updateCollectionUseCase->execute($dto);
            
            // Load relationships for response
            $model = Collection::with(['supplier', 'product', 'user', 'productRate'])
                ->find($collection->getId());
            
            return response()->json($model);
        } catch (EntityNotFoundException $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        } catch (VersionConflictException $e) {
            return response()->json(['error' => $e->getMessage()], 409);
        } catch (InvalidOperationException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            \Log::error('Failed to update collection', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to update collection'], 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            $deleted = $this->deleteCollectionUseCase->execute((int) $id);

            if (!$deleted) {
                return response()->json(['error' => 'Collection not found'], 404);
            }

            return response()->json(['message' => 'Collection deleted successfully']);
        } catch (\Exception $e) {
            \Log::error('Failed to delete collection', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to delete collection'], 500);
        }
    }
}
