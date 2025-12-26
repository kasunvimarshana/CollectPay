<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\Collection;
use App\Models\RateVersion;

class CollectionController extends Controller
{
    public function index(Request $request)
    {
        $query = Collection::with(['supplier', 'product', 'rateVersion'])
            ->whereNull('deleted_at')
            ->orderBy('collection_date', 'desc');

        // Optional filters
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

        $collections = $query->paginate(50);

        return $this->successResponse($collections);
    }

    public function show($id)
    {
        $collection = Collection::with(['supplier', 'product', 'rateVersion'])
            ->whereNull('deleted_at')
            ->find($id);

        if (!$collection) {
            return $this->errorResponse('Collection not found', null, 404);
        }

        return $this->successResponse($collection);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'required|uuid|exists:suppliers,id',
            'product_id' => 'required|uuid|exists:products,id',
            'quantity' => 'required|numeric|min:0.01',
            'collection_date' => 'required|date',
            'notes' => 'nullable|string',
            'idempotency_key' => 'nullable|string|unique:collections,idempotency_key',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        // Check for duplicate idempotency key
        if ($request->idempotency_key) {
            $existing = Collection::where('idempotency_key', $request->idempotency_key)->first();
            if ($existing) {
                return $this->successResponse($existing, 'Collection already exists (idempotent)', 200);
            }
        }

        // Get the applicable rate for the collection date
        $rateVersion = RateVersion::where('product_id', $request->product_id)
            ->where('effective_from', '<=', $request->collection_date)
            ->where(function ($query) use ($request) {
                $query->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', $request->collection_date);
            })
            ->orderBy('effective_from', 'desc')
            ->first();

        if (!$rateVersion) {
            return $this->errorResponse(
                'No active rate found for this product on the collection date',
                null,
                422
            );
        }

        $collection = Collection::create([
            'id' => (string) Str::uuid(),
            'supplier_id' => $request->supplier_id,
            'product_id' => $request->product_id,
            'quantity' => $request->quantity,
            'rate_version_id' => $rateVersion->id,
            'applied_rate' => $rateVersion->rate,
            'collection_date' => $request->collection_date,
            'notes' => $request->notes,
            'user_id' => $request->user()->id,
            'idempotency_key' => $request->idempotency_key ?? (string) Str::uuid(),
            'version' => 1,
        ]);

        return $this->successResponse(
            $collection->load(['supplier', 'product', 'rateVersion']),
            'Collection created successfully',
            201
        );
    }

    public function update(Request $request, $id)
    {
        $collection = Collection::whereNull('deleted_at')->find($id);

        if (!$collection) {
            return $this->errorResponse('Collection not found', null, 404);
        }

        $validator = Validator::make($request->all(), [
            'quantity' => 'sometimes|required|numeric|min:0.01',
            'collection_date' => 'sometimes|required|date',
            'notes' => 'nullable|string',
            'version' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        // Version check for optimistic locking
        if ($request->version !== $collection->version) {
            return $this->errorResponse(
                'Version conflict detected',
                ['version' => ['Server version is ' . $collection->version]],
                409
            );
        }

        // If collection date changed, recalculate the rate
        if ($request->has('collection_date') && $request->collection_date !== $collection->collection_date) {
            $rateVersion = RateVersion::where('product_id', $collection->product_id)
                ->where('effective_from', '<=', $request->collection_date)
                ->where(function ($query) use ($request) {
                    $query->whereNull('effective_to')
                        ->orWhere('effective_to', '>=', $request->collection_date);
                })
                ->orderBy('effective_from', 'desc')
                ->first();

            if (!$rateVersion) {
                return $this->errorResponse(
                    'No active rate found for this product on the new collection date',
                    null,
                    422
                );
            }

            $collection->rate_version_id = $rateVersion->id;
            $collection->applied_rate = $rateVersion->rate;
            $collection->collection_date = $request->collection_date;
        }

        $collection->update([
            'quantity' => $request->quantity ?? $collection->quantity,
            'notes' => $request->notes ?? $collection->notes,
            'version' => $collection->version + 1,
        ]);

        return $this->successResponse(
            $collection->load(['supplier', 'product', 'rateVersion']),
            'Collection updated successfully'
        );
    }

    public function destroy($id)
    {
        $collection = Collection::whereNull('deleted_at')->find($id);

        if (!$collection) {
            return $this->errorResponse('Collection not found', null, 404);
        }

        $collection->update([
            'deleted_at' => now(),
            'version' => $collection->version + 1,
        ]);

        return $this->successResponse(null, 'Collection deleted successfully');
    }
}
