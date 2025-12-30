<?php

namespace App\Http\Controllers\Api;

use App\Application\DTOs\CollectionDTO;
use App\Application\UseCases\Collection\CreateCollectionUseCase;
use App\Application\UseCases\Collection\DeleteCollectionUseCase;
use App\Application\UseCases\Collection\GetCollectionUseCase;
use App\Application\UseCases\Collection\ListCollectionsUseCase;
use App\Application\UseCases\Collection\UpdateCollectionUseCase;
use App\Application\UseCases\ProductRate\GetCurrentRateUseCase;
use App\Domain\Repositories\CollectionRepositoryInterface;
use App\Domain\Repositories\ProductRateRepositoryInterface;
use App\Domain\Repositories\ProductRepositoryInterface;
use App\Domain\Repositories\SupplierRepositoryInterface;
use App\Domain\Services\AuditServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CollectionController extends Controller
{
    private CollectionRepositoryInterface $collectionRepository;

    private SupplierRepositoryInterface $supplierRepository;

    private ProductRepositoryInterface $productRepository;

    private ProductRateRepositoryInterface $rateRepository;

    private AuditServiceInterface $auditService;

    public function __construct(
        CollectionRepositoryInterface $collectionRepository,
        SupplierRepositoryInterface $supplierRepository,
        ProductRepositoryInterface $productRepository,
        ProductRateRepositoryInterface $rateRepository,
        AuditServiceInterface $auditService
    ) {
        $this->collectionRepository = $collectionRepository;
        $this->supplierRepository = $supplierRepository;
        $this->productRepository = $productRepository;
        $this->rateRepository = $rateRepository;
        $this->auditService = $auditService;
    }

    public function index(Request $request)
    {
        try {
            $useCase = new ListCollectionsUseCase($this->collectionRepository);

            $filters = [
                'supplier_id' => $request->get('supplier_id'),
                'product_id' => $request->get('product_id'),
                'from_date' => $request->get('from_date'),
                'to_date' => $request->get('to_date'),
            ];

            $filters = array_filter($filters, fn ($value) => $value !== null);

            $result = $useCase->execute($filters, $request->get('page', 1), $request->get('per_page', 15));

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
            return response()->json(['success' => false, 'message' => 'Failed to retrieve collections', 'error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|string|max:20',
            'collection_date' => 'required|date',
            'rate' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            // Get rate if not provided
            $rate = $request->rate;
            if (! $rate) {
                $getCurrentRateUseCase = new GetCurrentRateUseCase($this->rateRepository, $this->productRepository);
                try {
                    $product = $this->productRepository->findById($request->product_id);
                    $rateEntity = $getCurrentRateUseCase->execute($request->product_id, $request->unit);
                    $rate = $rateEntity->getRate();
                } catch (\Exception $e) {
                    $rate = 0;
                }
            }

            $dto = CollectionDTO::fromArray([
                'supplier_id' => $request->supplier_id,
                'product_id' => $request->product_id,
                'collected_by' => auth()->id(),
                'quantity' => $request->quantity,
                'unit' => $request->unit,
                'rate' => $rate,
                'collection_date' => $request->collection_date,
                'collection_time' => $request->collection_time,
                'notes' => $request->notes,
                'metadata' => $request->metadata ?? [],
            ]);

            $useCase = new CreateCollectionUseCase($this->collectionRepository, $this->supplierRepository, $this->productRepository);
            $collection = $useCase->execute($dto);

            $this->auditService->log('create', 'Collection', $collection->getId(), null, $collection->toArray(), 'Collection created', auth()->id());

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Collection created successfully', 'data' => $collection->toArray()], 201);
        } catch (\InvalidArgumentException $e) {
            DB::rollBack();

            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['success' => false, 'message' => 'Failed to create collection', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $useCase = new GetCollectionUseCase($this->collectionRepository);
            $collection = $useCase->execute($id);

            return response()->json(['success' => true, 'data' => $collection->toArray()]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to retrieve collection', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'sometimes|required|exists:suppliers,id',
            'product_id' => 'sometimes|required|exists:products,id',
            'quantity' => 'sometimes|required|numeric|min:0',
            'unit' => 'sometimes|required|string|max:20',
            'collection_date' => 'sometimes|required|date',
            'rate' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'version' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $existing = $this->collectionRepository->findById($id);
            if (! $existing) {
                return response()->json(['success' => false, 'message' => 'Collection not found'], 404);
            }

            $dto = CollectionDTO::fromArray([
                'supplier_id' => $request->get('supplier_id', $existing->getSupplierId()),
                'product_id' => $request->get('product_id', $existing->getProductId()),
                'collected_by' => $existing->getCollectedBy(),
                'quantity' => $request->get('quantity', $existing->getQuantity()),
                'unit' => $request->get('unit', $existing->getUnit()),
                'rate' => $request->get('rate', $existing->getRate()),
                'collection_date' => $request->get('collection_date', $existing->getCollectionDate()->format('Y-m-d')),
                'collection_time' => $request->get('collection_time', $existing->getCollectionTime()),
                'notes' => $request->get('notes', $existing->getNotes()),
                'metadata' => $request->get('metadata', $existing->getMetadata()),
                'id' => $id,
                'version' => $request->version,
            ]);

            $useCase = new UpdateCollectionUseCase($this->collectionRepository);
            $collection = $useCase->execute($id, $dto);

            $this->auditService->log('update', 'Collection', $collection->getId(), $existing->toArray(), $collection->toArray(), 'Collection updated', auth()->id());

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Collection updated successfully', 'data' => $collection->toArray()]);
        } catch (\InvalidArgumentException $e) {
            DB::rollBack();

            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        } catch (\RuntimeException $e) {
            DB::rollBack();

            return response()->json(['success' => false, 'message' => $e->getMessage()], 409);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['success' => false, 'message' => 'Failed to update collection', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $useCase = new GetCollectionUseCase($this->collectionRepository);
            $collection = $useCase->execute($id);
            $oldData = $collection->toArray();

            $deleteUseCase = new DeleteCollectionUseCase($this->collectionRepository);
            $deleteUseCase->execute($id);

            $this->auditService->log('delete', 'Collection', $id, $oldData, null, 'Collection deleted', auth()->id());

            return response()->json(['success' => true, 'message' => 'Collection deleted successfully']);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to delete collection', 'error' => $e->getMessage()], 500);
        }
    }

    public function bySupplier($supplierId)
    {
        try {
            $collections = $this->collectionRepository->findBySupplier($supplierId);

            return response()->json(['success' => true, 'data' => array_map(fn ($c) => $c->toArray(), $collections)]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to retrieve collections', 'error' => $e->getMessage()], 500);
        }
    }

    public function byDate($date)
    {
        try {
            $dateTime = new \DateTime($date);
            $collections = $this->collectionRepository->findByDate($dateTime);

            return response()->json(['success' => true, 'data' => array_map(fn ($c) => $c->toArray(), $collections)]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to retrieve collections', 'error' => $e->getMessage()], 500);
        }
    }
}
