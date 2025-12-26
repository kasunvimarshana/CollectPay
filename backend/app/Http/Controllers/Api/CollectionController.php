<?php

namespace App\Http\Controllers\Api;

use App\Domain\Collection\Models\Collection;
use App\Domain\Product\Models\Product;
use Illuminate\Http\Request;

class CollectionController extends ApiController
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Collection::query();

        // Role-based filtering
        if ($user->isCollector()) {
            $query->collectedBy($user->id);
        }

        // Apply filters
        if ($request->has('supplier_id')) {
            $query->forSupplier($request->supplier_id);
        }

        if ($request->has('product_id')) {
            $query->forProduct($request->product_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->betweenDates($request->start_date, $request->end_date);
        } elseif ($request->has('date')) {
            $query->whereDate('collection_date', $request->date);
        }

        if ($request->has('collected_by')) {
            $query->collectedBy($request->collected_by);
        }

        // Include relationships
        $query->with(['supplier:id,name,code', 'product:id,name,code,primary_unit', 'collector:id,name']);

        // Sorting
        $sortBy = $request->get('sort_by', 'collection_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = min($request->get('per_page', 20), 100);
        $collections = $query->paginate($perPage);

        return $this->paginated($collections);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => ['required', 'uuid', 'exists:suppliers,id'],
            'product_id' => ['required', 'uuid', 'exists:products,id'],
            'quantity' => ['required', 'numeric', 'gt:0'],
            'unit' => ['nullable', 'string', 'max:20'],
            'collection_date' => ['required', 'date'],
            'collection_time' => ['nullable', 'date_format:H:i'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'quality_grade' => ['nullable', 'string', 'in:A,B,C,D'],
            'quality_deduction_percent' => ['nullable', 'numeric', 'between:0,100'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'client_id' => ['nullable', 'uuid'],
        ]);

        // Get product for unit validation
        $product = Product::findOrFail($validated['product_id']);
        $validated['unit'] = $validated['unit'] ?? $product->primary_unit;
        $validated['collected_by'] = $request->user()->id;

        // Get current rate for the collection date
        $rate = $product->getRateAtDate($validated['collection_date']);
        if ($rate) {
            $validated['rate_id'] = $rate->id;
            $validated['rate_at_collection'] = $rate->rate;
            $validated['rate_currency'] = $rate->currency;
        }

        $collection = Collection::create($validated);

        return $this->created(
            $collection->load(['supplier:id,name', 'product:id,name', 'collector:id,name']),
            'Collection recorded successfully'
        );
    }

    public function show(Collection $collection)
    {
        // Check access
        $user = request()->user();
        if ($user->isCollector() && $collection->collected_by !== $user->id) {
            return $this->forbidden('Access denied to this collection');
        }

        $collection->load([
            'supplier',
            'product',
            'rate',
            'collector:id,name',
            'payments'
        ]);

        // Add computed fields
        $collection->paid_amount = $collection->getPaidAmount();
        $collection->remaining_amount = $collection->getRemainingAmount();
        $collection->is_paid = $collection->isPaid();

        return $this->success($collection);
    }

    public function update(Request $request, Collection $collection)
    {
        // Check access
        $user = $request->user();
        if ($user->isCollector() && $collection->collected_by !== $user->id) {
            return $this->forbidden('Access denied to this collection');
        }

        // Cannot update confirmed collections (unless manager/admin)
        if ($collection->status === 'confirmed' && $user->isCollector()) {
            return $this->error('Cannot modify confirmed collections', 422);
        }

        $validated = $request->validate([
            'quantity' => ['sometimes', 'numeric', 'gt:0'],
            'unit' => ['sometimes', 'string', 'max:20'],
            'collection_date' => ['sometimes', 'date'],
            'collection_time' => ['nullable', 'date_format:H:i'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'quality_grade' => ['nullable', 'string', 'in:A,B,C,D'],
            'quality_deduction_percent' => ['nullable', 'numeric', 'between:0,100'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $collection->update($validated);

        return $this->success(
            $collection->fresh(['supplier:id,name', 'product:id,name', 'collector:id,name']),
            'Collection updated successfully'
        );
    }

    public function destroy(Collection $collection)
    {
        $user = request()->user();
        
        if ($user->isCollector() && $collection->collected_by !== $user->id) {
            return $this->forbidden('Access denied to this collection');
        }

        if ($collection->status === 'confirmed' && !$user->isAdmin()) {
            return $this->error('Cannot delete confirmed collections', 422);
        }

        if ($collection->payments()->exists()) {
            return $this->error('Cannot delete collection with associated payments', 422);
        }

        $collection->delete();

        return $this->success(null, 'Collection deleted successfully');
    }

    public function confirm(Collection $collection)
    {
        $user = request()->user();
        
        if (!$user->isAdmin() && !$user->isManager()) {
            return $this->forbidden('Only managers can confirm collections');
        }

        if ($collection->status !== 'pending') {
            return $this->error('Only pending collections can be confirmed', 422);
        }

        $collection->confirm();

        return $this->success($collection->fresh(), 'Collection confirmed');
    }

    public function dispute(Request $request, Collection $collection)
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        if ($collection->status !== 'pending' && $collection->status !== 'confirmed') {
            return $this->error('Cannot dispute this collection', 422);
        }

        $collection->notes = ($collection->notes ? $collection->notes . "\n" : '') 
            . "DISPUTE: " . $validated['reason'];
        $collection->dispute();

        return $this->success($collection->fresh(), 'Collection marked as disputed');
    }

    public function summary(Request $request)
    {
        $validated = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'supplier_id' => ['nullable', 'uuid'],
            'product_id' => ['nullable', 'uuid'],
        ]);

        $query = Collection::confirmed()
            ->betweenDates($validated['start_date'], $validated['end_date']);

        if (isset($validated['supplier_id'])) {
            $query->forSupplier($validated['supplier_id']);
        }

        if (isset($validated['product_id'])) {
            $query->forProduct($validated['product_id']);
        }

        $summary = $query->selectRaw('
            COUNT(*) as total_collections,
            SUM(quantity_in_primary_unit) as total_quantity,
            SUM(gross_amount) as total_gross_amount,
            SUM(net_amount) as total_net_amount,
            AVG(rate_at_collection) as average_rate,
            MIN(collection_date) as first_collection,
            MAX(collection_date) as last_collection
        ')->first();

        // Group by product
        $byProduct = Collection::confirmed()
            ->betweenDates($validated['start_date'], $validated['end_date'])
            ->when(isset($validated['supplier_id']), fn($q) => $q->forSupplier($validated['supplier_id']))
            ->join('products', 'collections.product_id', '=', 'products.id')
            ->selectRaw('
                products.id,
                products.name,
                products.primary_unit,
                COUNT(*) as collection_count,
                SUM(quantity_in_primary_unit) as total_quantity,
                SUM(net_amount) as total_amount
            ')
            ->groupBy('products.id', 'products.name', 'products.primary_unit')
            ->get();

        return $this->success([
            'period' => [
                'start' => $validated['start_date'],
                'end' => $validated['end_date'],
            ],
            'summary' => $summary,
            'by_product' => $byProduct,
        ]);
    }
}
