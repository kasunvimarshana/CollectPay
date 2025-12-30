<?php

declare(strict_types=1);

namespace Presentation\Http\Controllers;

use Application\DTOs\CreateCollectionDTO;
use Application\UseCases\Collection\CreateCollectionUseCase;
use Application\UseCases\Collection\DeleteCollectionUseCase;
use Application\UseCases\Collection\GetCollectionUseCase;
use Application\UseCases\Collection\ListCollectionsUseCase;
use Application\UseCases\Collection\CalculateCollectionTotalUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Collection Controller
 * 
 * Handles CRUD operations for collections and collection calculations.
 * Follows Clean Architecture by delegating all business logic to use cases.
 */
final class CollectionController extends Controller
{
    public function __construct(
        private readonly CreateCollectionUseCase $createCollection,
        private readonly DeleteCollectionUseCase $deleteCollection,
        private readonly GetCollectionUseCase $getCollection,
        private readonly ListCollectionsUseCase $listCollections,
        private readonly CalculateCollectionTotalUseCase $calculateCollectionTotal
    ) {}

    /**
     * List all collections with pagination and filters.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
            'supplier_id' => 'string|uuid',
            'product_id' => 'string|uuid',
            'user_id' => 'string|uuid',
            'from_date' => 'date',
            'to_date' => 'date',
        ]);

        try {
            $filters = [];
            if (isset($validated['supplier_id'])) {
                $filters['supplier_id'] = $validated['supplier_id'];
            }
            if (isset($validated['product_id'])) {
                $filters['product_id'] = $validated['product_id'];
            }
            if (isset($validated['user_id'])) {
                $filters['user_id'] = $validated['user_id'];
            }
            if (isset($validated['from_date'])) {
                $filters['from_date'] = $validated['from_date'];
            }
            if (isset($validated['to_date'])) {
                $filters['to_date'] = $validated['to_date'];
            }

            $result = $this->listCollections->execute(
                page: (int) ($validated['page'] ?? 1),
                perPage: (int) ($validated['per_page'] ?? 15),
                filters: $filters
            );

            return $this->paginated([
                'data' => array_map(fn($collection) => [
                    'id' => $collection->id(),
                    'supplier_id' => $collection->supplierId(),
                    'product_id' => $collection->productId(),
                    'user_id' => $collection->userId(),
                    'quantity' => [
                        'value' => $collection->quantity()->value(),
                        'unit' => $collection->quantity()->unit()->value(),
                    ],
                    'rate' => [
                        'amount' => $collection->rate()->amount()->amount(),
                        'currency' => $collection->rate()->amount()->currency(),
                        'unit' => $collection->rate()->unit()->value(),
                        'effective_date' => $collection->rate()->effectiveDate()->format('Y-m-d'),
                    ],
                    'total_amount' => [
                        'amount' => $collection->totalAmount()->amount(),
                        'currency' => $collection->totalAmount()->currency(),
                    ],
                    'collected_at' => $collection->collectedAt()->format('Y-m-d H:i:s'),
                    'metadata' => $collection->metadata(),
                    'created_at' => $collection->createdAt()->format('Y-m-d H:i:s'),
                    'updated_at' => $collection->updatedAt()->format('Y-m-d H:i:s'),
                ], $result['data']),
                'total' => $result['total'],
                'page' => $result['page'],
                'per_page' => $result['per_page'],
                'last_page' => $result['last_page'],
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to list collections: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get a single collection by ID.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $collection = $this->getCollection->execute($id);

            return $this->success([
                'id' => $collection->id(),
                'supplier_id' => $collection->supplierId(),
                'product_id' => $collection->productId(),
                'user_id' => $collection->userId(),
                'quantity' => [
                    'value' => $collection->quantity()->value(),
                    'unit' => $collection->quantity()->unit()->value(),
                ],
                'rate' => [
                    'amount' => $collection->rate()->amount()->amount(),
                    'currency' => $collection->rate()->amount()->currency(),
                    'unit' => $collection->rate()->unit()->value(),
                    'effective_date' => $collection->rate()->effectiveDate()->format('Y-m-d'),
                ],
                'total_amount' => [
                    'amount' => $collection->totalAmount()->amount(),
                    'currency' => $collection->totalAmount()->currency(),
                ],
                'collected_at' => $collection->collectedAt()->format('Y-m-d H:i:s'),
                'metadata' => $collection->metadata(),
                'created_at' => $collection->createdAt()->format('Y-m-d H:i:s'),
                'updated_at' => $collection->updatedAt()->format('Y-m-d H:i:s'),
            ]);
        } catch (\Exception $e) {
            return $this->error('Collection not found: ' . $e->getMessage(), 404);
        }
    }

    /**
     * Create a new collection.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'supplier_id' => 'required|string|uuid',
            'product_id' => 'required|string|uuid',
            'user_id' => 'required|string|uuid',
            'quantity_value' => 'required|numeric|min:0',
            'quantity_unit' => 'required|string|in:kg,g,l,ml,unit,dozen',
            'collected_at' => 'required|date',
            'metadata' => 'nullable|array',
        ]);

        try {
            $dto = CreateCollectionDTO::fromArray([
                'supplier_id' => $validated['supplier_id'],
                'product_id' => $validated['product_id'],
                'user_id' => $validated['user_id'],
                'quantity_value' => (float) $validated['quantity_value'],
                'quantity_unit' => $validated['quantity_unit'],
                'collected_at' => $validated['collected_at'],
                'metadata' => $validated['metadata'] ?? [],
            ]);

            $collection = $this->createCollection->execute($dto);

            return $this->created([
                'id' => $collection->id(),
                'supplier_id' => $collection->supplierId(),
                'product_id' => $collection->productId(),
                'user_id' => $collection->userId(),
                'quantity' => [
                    'value' => $collection->quantity()->value(),
                    'unit' => $collection->quantity()->unit()->value(),
                ],
                'rate' => [
                    'amount' => $collection->rate()->amount()->amount(),
                    'currency' => $collection->rate()->amount()->currency(),
                    'unit' => $collection->rate()->unit()->value(),
                    'effective_date' => $collection->rate()->effectiveDate()->format('Y-m-d'),
                ],
                'total_amount' => [
                    'amount' => $collection->totalAmount()->amount(),
                    'currency' => $collection->totalAmount()->currency(),
                ],
                'collected_at' => $collection->collectedAt()->format('Y-m-d H:i:s'),
                'metadata' => $collection->metadata(),
                'created_at' => $collection->createdAt()->format('Y-m-d H:i:s'),
                'updated_at' => $collection->updatedAt()->format('Y-m-d H:i:s'),
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to create collection: ' . $e->getMessage(), 422);
        }
    }

    /**
     * Delete a collection.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $this->deleteCollection->execute($id);
            return $this->noContent();
        } catch (\Exception $e) {
            return $this->error('Failed to delete collection: ' . $e->getMessage(), 422);
        }
    }

    /**
     * Calculate total collections for a supplier.
     */
    public function calculateTotal(Request $request, string $supplierId): JsonResponse
    {
        $validated = $request->validate([
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date',
        ]);

        try {
            $fromDate = isset($validated['from_date']) 
                ? new \DateTimeImmutable($validated['from_date']) 
                : null;
            $toDate = isset($validated['to_date']) 
                ? new \DateTimeImmutable($validated['to_date']) 
                : null;

            $total = $this->calculateCollectionTotal->execute($supplierId, $fromDate, $toDate);

            return $this->success([
                'supplier_id' => $supplierId,
                'total_amount' => [
                    'amount' => $total->amount(),
                    'currency' => $total->currency(),
                ],
                'from_date' => $fromDate?->format('Y-m-d'),
                'to_date' => $toDate?->format('Y-m-d'),
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to calculate collection total: ' . $e->getMessage(), 422);
        }
    }
}
