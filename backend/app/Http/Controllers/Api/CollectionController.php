<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCollectionRequest;
use App\Http\Requests\UpdateCollectionRequest;
use App\Models\Collection;
use App\Services\CollectionService;
use App\Services\AuditService;
use Illuminate\Http\Request;

class CollectionController extends Controller
{
    private CollectionService $collectionService;
    private AuditService $auditService;

    public function __construct(
        CollectionService $collectionService,
        AuditService $auditService
    ) {
        $this->collectionService = $collectionService;
        $this->auditService = $auditService;
    }

    public function index(Request $request)
    {
        $query = Collection::with(['supplier', 'product', 'rate', 'collector']);

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('from_date')) {
            $query->where('collection_date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->where('collection_date', '<=', $request->to_date);
        }

        if ($request->has('collected_by')) {
            $query->where('collected_by', $request->collected_by);
        }

        $collections = $query->orderBy('collection_date', 'desc')->paginate(50);

        return response()->json($collections);
    }

    public function store(StoreCollectionRequest $request)
    {
        $collection = $this->collectionService->createCollection($request->validated());
        
        $this->auditService->log(
            'collection',
            $collection->id,
            'created',
            null,
            $collection->toArray(),
            $request
        );

        return response()->json($collection, 201);
    }

    public function show(Collection $collection)
    {
        $collection->load(['supplier', 'product', 'rate', 'collector']);

        return response()->json($collection);
    }

    public function update(UpdateCollectionRequest $request, Collection $collection)
    {
        $oldValues = $collection->toArray();
        
        $updated = $this->collectionService->updateCollection($collection, $request->validated());
        
        $this->auditService->log(
            'collection',
            $collection->id,
            'updated',
            $oldValues,
            $updated->toArray(),
            $request
        );

        return response()->json($updated);
    }

    public function destroy(Request $request, Collection $collection)
    {
        $oldValues = $collection->toArray();
        
        $collection->delete();
        
        $this->auditService->log(
            'collection',
            $collection->id,
            'deleted',
            $oldValues,
            null,
            $request
        );

        return response()->json(['message' => 'Collection deleted successfully']);
    }

    /**
     * Get collections summary for a supplier
     */
    public function summary(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date',
        ]);

        $summary = $this->collectionService->getSupplierCollectionsSummary(
            $request->supplier_id,
            $request->from_date,
            $request->to_date
        );

        return response()->json($summary);
    }
}
