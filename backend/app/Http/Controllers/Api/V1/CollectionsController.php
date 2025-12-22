<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCollectionRequest;
use App\Models\Collection;
use App\Services\CollectionService;
use Illuminate\Http\Request;

class CollectionsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->authorizeResource(Collection::class, 'collection');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Collection::query();
        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->string('supplier_id'));
        }
        if ($request->filled('product_id')) {
            $query->where('product_id', $request->string('product_id'));
        }
        $user = $request->user();
        if (!$request->filled('supplier_id') && !$user->hasAnyRole(['admin','manager']) && !$user->attr('allow_all_suppliers', false)) {
            $ids = (array) $user->attr('allowed_supplier_ids', []);
            if (!empty($ids)) {
                $query->whereIn('supplier_id', $ids);
            } else {
                $query->whereRaw('1=0');
            }
        }
        return $query->orderByDesc('collected_at')->paginate(50);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCollectionRequest $request, CollectionService $service)
    {
        $collection = $service->create($request->validated());
        return response()->json($collection, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Collection $collection)
    {
        return $collection;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
