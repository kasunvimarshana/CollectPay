<?php

declare(strict_types=1);

namespace TrackVault\Presentation\Controllers;

use TrackVault\Domain\Repositories\CollectionRepositoryInterface;
use TrackVault\Domain\Entities\Collection;
use TrackVault\Domain\ValueObjects\CollectionId;
use TrackVault\Domain\ValueObjects\SupplierId;
use TrackVault\Domain\ValueObjects\ProductId;
use TrackVault\Domain\ValueObjects\UserId;
use TrackVault\Domain\ValueObjects\Quantity;
use TrackVault\Domain\ValueObjects\Money;
use Exception;

/**
 * Collection Controller
 * 
 * Handles collection CRUD operations
 */
final class CollectionController extends BaseController
{
    private CollectionRepositoryInterface $collectionRepository;

    public function __construct(CollectionRepositoryInterface $collectionRepository)
    {
        $this->collectionRepository = $collectionRepository;
    }

    public function index(): void
    {
        try {
            $limit = (int)($_GET['limit'] ?? 100);
            $offset = (int)($_GET['offset'] ?? 0);
            
            $collections = $this->collectionRepository->findAll($limit, $offset);
            
            $data = array_map(fn($collection) => $collection->toArray(), $collections);
            
            $this->successResponse($data);
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'FETCH_FAILED', 500);
        }
    }

    public function show(string $id): void
    {
        try {
            $collection = $this->collectionRepository->findById(new CollectionId($id));
            
            if (!$collection) {
                $this->errorResponse('Collection not found', 'NOT_FOUND', 404);
                return;
            }
            
            $this->successResponse($collection->toArray());
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'FETCH_FAILED', 500);
        }
    }

    public function store(): void
    {
        try {
            $data = $this->getRequestBody();
            
            // Validation
            $required = ['supplier_id', 'product_id', 'collector_id', 'quantity', 'unit', 'rate', 'collection_date'];
            foreach ($required as $field) {
                if (!isset($data[$field])) {
                    $this->errorResponse("Field '{$field}' is required", 'VALIDATION_ERROR', 400);
                    return;
                }
            }

            $quantity = new Quantity((float)$data['quantity'], $data['unit']);
            $rate = (float)$data['rate'];
            $totalAmount = $quantity->getValue() * $rate;

            $collection = new Collection(
                CollectionId::generate(),
                new SupplierId($data['supplier_id']),
                new ProductId($data['product_id']),
                new UserId($data['collector_id']),
                $quantity,
                $rate,
                new Money($totalAmount, $data['currency'] ?? 'USD'),
                new \DateTimeImmutable($data['collection_date']),
                $data['metadata'] ?? []
            );

            $this->collectionRepository->save($collection);
            
            $this->successResponse($collection->toArray(), 'Collection created successfully');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'CREATE_FAILED', 400);
        }
    }

    public function update(string $id): void
    {
        try {
            $collection = $this->collectionRepository->findById(new CollectionId($id));
            
            if (!$collection) {
                $this->errorResponse('Collection not found', 'NOT_FOUND', 404);
                return;
            }

            $data = $this->getRequestBody();
            
            // Calculate new total if quantity or rate changed
            $quantity = isset($data['quantity']) || isset($data['unit']) 
                ? new Quantity(
                    (float)($data['quantity'] ?? $collection->getQuantity()->getValue()),
                    $data['unit'] ?? $collection->getQuantity()->getUnit()
                  )
                : $collection->getQuantity();
            
            $rate = $data['rate'] ?? $collection->getRate();
            $totalAmount = $quantity->getValue() * $rate;

            // Create updated collection
            $updatedCollection = new Collection(
                $collection->getId(),
                isset($data['supplier_id']) ? new SupplierId($data['supplier_id']) : $collection->getSupplierId(),
                isset($data['product_id']) ? new ProductId($data['product_id']) : $collection->getProductId(),
                isset($data['collector_id']) ? new UserId($data['collector_id']) : $collection->getCollectorId(),
                $quantity,
                $rate,
                new Money($totalAmount, $data['currency'] ?? $collection->getTotalAmount()->getCurrency()),
                isset($data['collection_date']) ? new \DateTimeImmutable($data['collection_date']) : $collection->getCollectionDate(),
                $data['metadata'] ?? $collection->getMetadata(),
                $collection->getCreatedAt(),
                new \DateTimeImmutable(),
                null,
                $collection->getVersion() + 1
            );

            $this->collectionRepository->save($updatedCollection);
            
            $this->successResponse($updatedCollection->toArray(), 'Collection updated successfully');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'UPDATE_FAILED', 400);
        }
    }

    public function destroy(string $id): void
    {
        try {
            $collection = $this->collectionRepository->findById(new CollectionId($id));
            
            if (!$collection) {
                $this->errorResponse('Collection not found', 'NOT_FOUND', 404);
                return;
            }

            $this->collectionRepository->delete(new CollectionId($id));
            
            $this->successResponse(null, 'Collection deleted successfully');
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'DELETE_FAILED', 400);
        }
    }

    public function bySupplier(string $supplierId): void
    {
        try {
            $collections = $this->collectionRepository->findBySupplierId(new SupplierId($supplierId));
            
            $data = array_map(fn($collection) => $collection->toArray(), $collections);
            
            $this->successResponse($data);
            
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 'FETCH_FAILED', 500);
        }
    }
}
