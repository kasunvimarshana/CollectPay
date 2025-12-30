<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Application\UseCases\Collection\CreateCollectionUseCase;
use Application\UseCases\Collection\GetCollectionUseCase;
use Application\UseCases\Collection\ListCollectionsUseCase;
use Application\DTOs\CreateCollectionDTO;
use Domain\Repositories\CollectionRepositoryInterface;

class CollectionController extends Controller
{
    public function __construct(
        private readonly CollectionRepositoryInterface $collectionRepository,
        private readonly CreateCollectionUseCase $createCollectionUseCase,
        private readonly GetCollectionUseCase $getCollectionUseCase,
        private readonly ListCollectionsUseCase $listCollectionsUseCase
    ) {}

    /**
     * Display a listing of collections.
     */
    public function index(Request $request): JsonResponse
    {
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 20);
        $supplierId = $request->get('supplier_id');

        if ($supplierId) {
            $collections = $this->listCollectionsUseCase->executeBySupplier($supplierId, (int) $page, (int) $perPage);
        } else {
            $collections = $this->listCollectionsUseCase->execute((int) $page, (int) $perPage);
        }

        return response()->json([
            'data' => array_map(fn($collection) => $collection->toArray(), $collections),
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Store a newly created collection.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'supplier_id' => 'required|string|uuid',
            'product_id' => 'required|string|uuid',
            'rate_id' => 'required|string|uuid',
            'quantity_value' => 'required|numeric|min:0.0001',
            'quantity_unit' => 'required|string|max:10',
            'total_amount' => 'required|numeric|min:0',
            'total_amount_currency' => 'nullable|string|size:3',
            'collection_date' => 'required|date',
            'collected_by' => 'required|string|uuid',
            'notes' => 'nullable|string',
        ]);

        try {
            $dto = CreateCollectionDTO::fromArray($validated);
            $collection = $this->createCollectionUseCase->execute($dto);

            return response()->json([
                'message' => 'Collection created successfully',
                'data' => $collection->toArray(),
            ], 201);
        } catch (\DomainException $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display the specified collection.
     */
    public function show(string $id): JsonResponse
    {
        $collection = $this->getCollectionUseCase->execute($id);

        if (!$collection) {
            return response()->json([
                'error' => 'Collection not found',
            ], 404);
        }

        return response()->json([
            'data' => $collection->toArray(),
        ]);
    }

    /**
     * Remove the specified collection.
     */
    public function destroy(string $id): JsonResponse
    {
        $collection = $this->collectionRepository->findById($id);

        if (!$collection) {
            return response()->json([
                'error' => 'Collection not found',
            ], 404);
        }

        $collection->delete();
        $this->collectionRepository->save($collection);

        return response()->json([
            'message' => 'Collection deleted successfully',
        ]);
    }
}
