<?php

namespace LedgerFlow\Presentation\Controllers;

use LedgerFlow\Application\UseCases\CreateCollection;
use LedgerFlow\Domain\Repositories\CollectionRepositoryInterface;

class CollectionController
{
    private CollectionRepositoryInterface $collectionRepository;
    private CreateCollection $createCollection;

    public function __construct(
        CollectionRepositoryInterface $collectionRepository,
        CreateCollection $createCollection
    ) {
        $this->collectionRepository = $collectionRepository;
        $this->createCollection = $createCollection;
    }

    public function index(): void
    {
        try {
            $collections = $this->collectionRepository->findAll();
            $collectionsData = array_map(function ($collection) {
                return [
                    'id' => $collection->getId(),
                    'supplier_id' => $collection->getSupplierId(),
                    'product_id' => $collection->getProductId(),
                    'quantity' => $collection->getQuantity(),
                    'rate' => $collection->getRate(),
                    'total_amount' => $collection->getTotalAmount(),
                    'collection_date' => $collection->getCollectionDate()->format('Y-m-d'),
                    'notes' => $collection->getNotes(),
                    'collected_by' => $collection->getCollectedBy(),
                    'created_at' => $collection->getCreatedAt()->format('Y-m-d H:i:s'),
                    'updated_at' => $collection->getUpdatedAt()->format('Y-m-d H:i:s')
                ];
            }, $collections);

            http_response_code(200);
            echo json_encode($collectionsData);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    public function show(string $id): void
    {
        try {
            $collection = $this->collectionRepository->findById($id);

            if (!$collection) {
                http_response_code(404);
                echo json_encode(['error' => 'Collection not found']);
                return;
            }

            http_response_code(200);
            echo json_encode([
                'id' => $collection->getId(),
                'supplier_id' => $collection->getSupplierId(),
                'product_id' => $collection->getProductId(),
                'quantity' => $collection->getQuantity(),
                'rate' => $collection->getRate(),
                'total_amount' => $collection->getTotalAmount(),
                'collection_date' => $collection->getCollectionDate()->format('Y-m-d'),
                'notes' => $collection->getNotes(),
                'collected_by' => $collection->getCollectedBy(),
                'created_at' => $collection->getCreatedAt()->format('Y-m-d H:i:s'),
                'updated_at' => $collection->getUpdatedAt()->format('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    public function store(): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $collection = $this->createCollection->execute($data);

            http_response_code(201);
            echo json_encode([
                'id' => $collection->getId(),
                'supplier_id' => $collection->getSupplierId(),
                'product_id' => $collection->getProductId(),
                'quantity' => $collection->getQuantity(),
                'rate' => $collection->getRate(),
                'total_amount' => $collection->getTotalAmount(),
                'collection_date' => $collection->getCollectionDate()->format('Y-m-d'),
                'notes' => $collection->getNotes(),
                'collected_by' => $collection->getCollectedBy(),
                'created_at' => $collection->getCreatedAt()->format('Y-m-d H:i:s')
            ]);
        } catch (\InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    public function update(string $id): void
    {
        try {
            $collection = $this->collectionRepository->findById($id);

            if (!$collection) {
                http_response_code(404);
                echo json_encode(['error' => 'Collection not found']);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true);

            if (isset($data['quantity'])) {
                $collection->setQuantity((float)$data['quantity']);
            }
            if (isset($data['rate'])) {
                $collection->setRate((float)$data['rate']);
            }
            if (isset($data['notes'])) {
                $collection->setNotes($data['notes']);
            }

            $collection->setUpdatedAt(new \DateTime());
            $collection->incrementVersion();

            $this->collectionRepository->save($collection);

            http_response_code(200);
            echo json_encode([
                'id' => $collection->getId(),
                'quantity' => $collection->getQuantity(),
                'rate' => $collection->getRate(),
                'total_amount' => $collection->getTotalAmount(),
                'notes' => $collection->getNotes(),
                'updated_at' => $collection->getUpdatedAt()->format('Y-m-d H:i:s')
            ]);
        } catch (\RuntimeException $e) {
            http_response_code(409);
            echo json_encode(['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    public function delete(string $id): void
    {
        try {
            $collection = $this->collectionRepository->findById($id);

            if (!$collection) {
                http_response_code(404);
                echo json_encode(['error' => 'Collection not found']);
                return;
            }

            $this->collectionRepository->delete($id);

            http_response_code(204);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    public function bySupplier(string $supplierId): void
    {
        try {
            $collections = $this->collectionRepository->findBySupplierId($supplierId);
            $collectionsData = array_map(function ($collection) {
                return [
                    'id' => $collection->getId(),
                    'product_id' => $collection->getProductId(),
                    'quantity' => $collection->getQuantity(),
                    'rate' => $collection->getRate(),
                    'total_amount' => $collection->getTotalAmount(),
                    'collection_date' => $collection->getCollectionDate()->format('Y-m-d'),
                    'notes' => $collection->getNotes(),
                    'created_at' => $collection->getCreatedAt()->format('Y-m-d H:i:s')
                ];
            }, $collections);

            http_response_code(200);
            echo json_encode($collectionsData);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }
}
