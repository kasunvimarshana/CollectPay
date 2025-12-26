<?php

namespace App\Application\UseCases;

use App\Application\DTOs\BatchSyncDTO;
use App\Application\DTOs\SyncOperationDTO;
use App\Application\DTOs\CreateSupplierDTO;
use App\Application\DTOs\UpdateSupplierDTO;
use App\Application\DTOs\CreateProductDTO;
use App\Application\DTOs\UpdateProductDTO;
use App\Application\DTOs\CreateProductRateDTO;
use App\Application\DTOs\UpdateProductRateDTO;
use App\Application\DTOs\CreateCollectionDTO;
use App\Application\DTOs\UpdateCollectionDTO;
use App\Application\DTOs\CreatePaymentDTO;
use App\Application\DTOs\UpdatePaymentDTO;
use App\Domain\Exceptions\EntityNotFoundException;
use App\Domain\Exceptions\VersionConflictException;
use App\Domain\Repositories\SupplierRepositoryInterface;
use App\Domain\Repositories\ProductRepositoryInterface;
use App\Domain\Repositories\ProductRateRepositoryInterface;
use App\Domain\Repositories\CollectionRepositoryInterface;
use App\Domain\Repositories\PaymentRepositoryInterface;
use Illuminate\Support\Facades\DB;

/**
 * Batch Sync Use Case
 * 
 * Handles batch synchronization of offline operations.
 * Delegates to specific entity use cases following Single Responsibility Principle.
 */
class BatchSyncUseCase
{
    public function __construct(
        private CreateSupplierUseCase $createSupplier,
        private UpdateSupplierUseCase $updateSupplier,
        private CreateProductUseCase $createProduct,
        private UpdateProductUseCase $updateProduct,
        private CreateProductRateUseCase $createProductRate,
        private UpdateProductRateUseCase $updateProductRate,
        private CreateCollectionUseCase $createCollection,
        private UpdateCollectionUseCase $updateCollection,
        private DeleteCollectionUseCase $deleteCollection,
        private CreatePaymentUseCase $createPayment,
        private UpdatePaymentUseCase $updatePayment,
        private DeletePaymentUseCase $deletePayment,
        private SupplierRepositoryInterface $supplierRepository,
        private ProductRepositoryInterface $productRepository,
        private ProductRateRepositoryInterface $productRateRepository,
        private CollectionRepositoryInterface $collectionRepository,
        private PaymentRepositoryInterface $paymentRepository
    ) {
    }

    /**
     * Execute batch sync
     * 
     * @param BatchSyncDTO $dto
     * @param int $userId
     * @return array Array of results for each operation
     */
    public function execute(BatchSyncDTO $dto, int $userId): array
    {
        $results = [];

        foreach ($dto->operations as $operation) {
            try {
                // Wrap each operation in a transaction
                $result = DB::transaction(function () use ($operation, $dto, $userId) {
                    return $this->processOperation($operation, $dto->deviceId, $userId);
                });

                $results[] = array_merge([
                    'local_id' => $operation->localId,
                ], $result);
            } catch (\Exception $e) {
                $results[] = [
                    'local_id' => $operation->localId,
                    'status' => 'error',
                    'message' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    /**
     * Process a single sync operation
     */
    private function processOperation(SyncOperationDTO $operation, string $deviceId, int $userId): array
    {
        // Add sync metadata
        $data = $operation->data;
        $data['device_id'] = $deviceId;
        $data['sync_metadata'] = [
            'synced_at' => now()->toISOString(),
            'original_timestamp' => $operation->timestamp,
            'local_id' => $operation->localId,
        ];

        return match ($operation->entity) {
            'supplier' => $this->handleSupplier($operation->operation, $data),
            'product' => $this->handleProduct($operation->operation, $data),
            'product_rate' => $this->handleProductRate($operation->operation, $data),
            'collection' => $this->handleCollection($operation->operation, $data, $userId),
            'payment' => $this->handlePayment($operation->operation, $data, $userId),
            default => throw new \InvalidArgumentException("Unknown entity: {$operation->entity}")
        };
    }

    /**
     * Handle supplier operations
     */
    private function handleSupplier(string $operation, array $data): array
    {
        return match ($operation) {
            'create' => $this->handleSupplierCreate($data),
            'update' => $this->handleSupplierUpdate($data),
            'delete' => $this->handleSupplierDelete($data),
            default => throw new \InvalidArgumentException("Unknown operation: $operation")
        };
    }

    private function handleSupplierCreate(array $data): array
    {
        // Check for duplicate
        $existing = $this->checkDuplicate('supplier', $data);
        if ($existing) {
            return [
                'status' => 'duplicate',
                'entity_id' => $existing,
                'message' => 'Supplier already exists',
            ];
        }

        $dto = CreateSupplierDTO::fromArray($data);
        $supplier = $this->createSupplier->execute($dto);

        return [
            'status' => 'success',
            'entity_id' => $supplier->getId(),
        ];
    }

    private function handleSupplierUpdate(array $data): array
    {
        if (!isset($data['id'])) {
            throw new \InvalidArgumentException('ID is required for update operation');
        }

        try {
            $dto = UpdateSupplierDTO::fromArray($data['id'], $data);
            $supplier = $this->updateSupplier->execute($dto);

            return [
                'status' => 'success',
                'entity_id' => $supplier->getId(),
            ];
        } catch (EntityNotFoundException $e) {
            return [
                'status' => 'not_found',
                'message' => $e->getMessage(),
            ];
        } catch (VersionConflictException $e) {
            return [
                'status' => 'conflict',
                'message' => $e->getMessage(),
                'conflict_data' => [
                    'client_version' => $data['version'] ?? null,
                ],
            ];
        }
    }

    private function handleSupplierDelete(array $data): array
    {
        if (!isset($data['id'])) {
            throw new \InvalidArgumentException('ID is required for delete operation');
        }

        $deleted = $this->supplierRepository->delete($data['id']);

        if (!$deleted) {
            return [
                'status' => 'not_found',
                'message' => 'Supplier not found',
            ];
        }

        return [
            'status' => 'success',
            'entity_id' => $data['id'],
        ];
    }

    /**
     * Handle product operations
     */
    private function handleProduct(string $operation, array $data): array
    {
        return match ($operation) {
            'create' => $this->handleProductCreate($data),
            'update' => $this->handleProductUpdate($data),
            'delete' => $this->handleProductDelete($data),
            default => throw new \InvalidArgumentException("Unknown operation: $operation")
        };
    }

    private function handleProductCreate(array $data): array
    {
        $existing = $this->checkDuplicate('product', $data);
        if ($existing) {
            return [
                'status' => 'duplicate',
                'entity_id' => $existing,
                'message' => 'Product already exists',
            ];
        }

        $dto = CreateProductDTO::fromArray($data);
        $product = $this->createProduct->execute($dto);

        return [
            'status' => 'success',
            'entity_id' => $product->getId(),
        ];
    }

    private function handleProductUpdate(array $data): array
    {
        if (!isset($data['id'])) {
            throw new \InvalidArgumentException('ID is required for update operation');
        }

        try {
            $dto = UpdateProductDTO::fromArray($data['id'], $data);
            $product = $this->updateProduct->execute($dto);

            return [
                'status' => 'success',
                'entity_id' => $product->getId(),
            ];
        } catch (EntityNotFoundException $e) {
            return ['status' => 'not_found', 'message' => $e->getMessage()];
        } catch (VersionConflictException $e) {
            return [
                'status' => 'conflict',
                'message' => $e->getMessage(),
                'conflict_data' => ['client_version' => $data['version'] ?? null],
            ];
        }
    }

    private function handleProductDelete(array $data): array
    {
        if (!isset($data['id'])) {
            throw new \InvalidArgumentException('ID is required for delete operation');
        }

        // Use DeleteProductUseCase if available, otherwise use repository
        $deleted = $this->productRepository->delete($data['id']);

        if (!$deleted) {
            return ['status' => 'not_found', 'message' => 'Product not found'];
        }

        return ['status' => 'success', 'entity_id' => $data['id']];
    }

    /**
     * Handle product rate operations
     */
    private function handleProductRate(string $operation, array $data): array
    {
        return match ($operation) {
            'create' => $this->handleProductRateCreate($data),
            'update' => $this->handleProductRateUpdate($data),
            'delete' => $this->handleProductRateDelete($data),
            default => throw new \InvalidArgumentException("Unknown operation: $operation")
        };
    }

    private function handleProductRateCreate(array $data): array
    {
        $existing = $this->checkDuplicate('product_rate', $data);
        if ($existing) {
            return [
                'status' => 'duplicate',
                'entity_id' => $existing,
                'message' => 'Product rate already exists',
            ];
        }

        $dto = CreateProductRateDTO::fromArray($data);
        $rate = $this->createProductRate->execute($dto);

        return [
            'status' => 'success',
            'entity_id' => $rate->getId(),
        ];
    }

    private function handleProductRateUpdate(array $data): array
    {
        if (!isset($data['id'])) {
            throw new \InvalidArgumentException('ID is required for update operation');
        }

        try {
            $dto = UpdateProductRateDTO::fromArray($data['id'], $data);
            $rate = $this->updateProductRate->execute($dto);

            return [
                'status' => 'success',
                'entity_id' => $rate->getId(),
            ];
        } catch (EntityNotFoundException $e) {
            return ['status' => 'not_found', 'message' => $e->getMessage()];
        } catch (VersionConflictException $e) {
            return [
                'status' => 'conflict',
                'message' => $e->getMessage(),
                'conflict_data' => ['client_version' => $data['version'] ?? null],
            ];
        }
    }

    private function handleProductRateDelete(array $data): array
    {
        if (!isset($data['id'])) {
            throw new \InvalidArgumentException('ID is required for delete operation');
        }

        $deleted = $this->productRateRepository->delete($data['id']);

        if (!$deleted) {
            return ['status' => 'not_found', 'message' => 'Product rate not found'];
        }

        return ['status' => 'success', 'entity_id' => $data['id']];
    }

    /**
     * Handle collection operations
     */
    private function handleCollection(string $operation, array $data, int $userId): array
    {
        return match ($operation) {
            'create' => $this->handleCollectionCreate($data, $userId),
            'update' => $this->handleCollectionUpdate($data),
            'delete' => $this->handleCollectionDelete($data),
            default => throw new \InvalidArgumentException("Unknown operation: $operation")
        };
    }

    private function handleCollectionCreate(array $data, int $userId): array
    {
        $existing = $this->checkDuplicate('collection', $data);
        if ($existing) {
            return [
                'status' => 'duplicate',
                'entity_id' => $existing,
                'message' => 'Collection already exists',
            ];
        }

        $data['user_id'] = $userId;
        $dto = CreateCollectionDTO::fromArray($data);
        $collection = $this->createCollection->execute($dto);

        return [
            'status' => 'success',
            'entity_id' => $collection->getId(),
        ];
    }

    private function handleCollectionUpdate(array $data): array
    {
        if (!isset($data['id'])) {
            throw new \InvalidArgumentException('ID is required for update operation');
        }

        try {
            $dto = UpdateCollectionDTO::fromArray($data['id'], $data);
            $collection = $this->updateCollection->execute($dto);

            return [
                'status' => 'success',
                'entity_id' => $collection->getId(),
            ];
        } catch (EntityNotFoundException $e) {
            return ['status' => 'not_found', 'message' => $e->getMessage()];
        } catch (VersionConflictException $e) {
            return [
                'status' => 'conflict',
                'message' => $e->getMessage(),
                'conflict_data' => ['client_version' => $data['version'] ?? null],
            ];
        }
    }

    private function handleCollectionDelete(array $data): array
    {
        if (!isset($data['id'])) {
            throw new \InvalidArgumentException('ID is required for delete operation');
        }

        $deleted = $this->deleteCollection->execute($data['id']);

        if (!$deleted) {
            return ['status' => 'not_found', 'message' => 'Collection not found'];
        }

        return ['status' => 'success', 'entity_id' => $data['id']];
    }

    /**
     * Handle payment operations
     */
    private function handlePayment(string $operation, array $data, int $userId): array
    {
        return match ($operation) {
            'create' => $this->handlePaymentCreate($data, $userId),
            'update' => $this->handlePaymentUpdate($data),
            'delete' => $this->handlePaymentDelete($data),
            default => throw new \InvalidArgumentException("Unknown operation: $operation")
        };
    }

    private function handlePaymentCreate(array $data, int $userId): array
    {
        $existing = $this->checkDuplicate('payment', $data);
        if ($existing) {
            return [
                'status' => 'duplicate',
                'entity_id' => $existing,
                'message' => 'Payment already exists',
            ];
        }

        $data['user_id'] = $userId;
        $dto = CreatePaymentDTO::fromArray($data);
        $payment = $this->createPayment->execute($dto);

        return [
            'status' => 'success',
            'entity_id' => $payment->getId(),
        ];
    }

    private function handlePaymentUpdate(array $data): array
    {
        if (!isset($data['id'])) {
            throw new \InvalidArgumentException('ID is required for update operation');
        }

        try {
            $dto = UpdatePaymentDTO::fromArray($data['id'], $data);
            $payment = $this->updatePayment->execute($dto);

            return [
                'status' => 'success',
                'entity_id' => $payment->getId(),
            ];
        } catch (EntityNotFoundException $e) {
            return ['status' => 'not_found', 'message' => $e->getMessage()];
        } catch (VersionConflictException $e) {
            return [
                'status' => 'conflict',
                'message' => $e->getMessage(),
                'conflict_data' => ['client_version' => $data['version'] ?? null],
            ];
        }
    }

    private function handlePaymentDelete(array $data): array
    {
        if (!isset($data['id'])) {
            throw new \InvalidArgumentException('ID is required for delete operation');
        }

        $deleted = $this->deletePayment->execute($data['id']);

        if (!$deleted) {
            return ['status' => 'not_found', 'message' => 'Payment not found'];
        }

        return ['status' => 'success', 'entity_id' => $data['id']];
    }

    /**
     * Check for duplicate based on device_id and local_id
     * 
     * NOTE: This is a simplified implementation. In production:
     * - Add a dedicated method to repository interfaces for duplicate checks
     * - Consider adding indexed columns for device_id and local_id
     * - Implement caching for recent sync operations
     * - Use JSON path queries efficiently with proper indexing
     * 
     * @param string $entity
     * @param array $data
     * @return int|null Entity ID if duplicate exists, null otherwise
     */
    private function checkDuplicate(string $entity, array $data): ?int
    {
        // Simplified implementation - always returns null for now
        // This allows operations to proceed without duplicate checking
        // TODO: Implement proper duplicate detection based on device_id and local_id
        return null;
    }
}
