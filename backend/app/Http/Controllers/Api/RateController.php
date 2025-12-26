<?php

namespace App\Http\Controllers\Api;

use App\Models\Rate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RateController extends ApiController
{
    /**
     * Get all rates
     */
    public function index(Request $request)
    {
        $query = Rate::query()->with(['supplier', 'product', 'creator']);

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Get current rates only
        if ($request->boolean('current_only')) {
            $date = $request->get('date', now()->toDateString());
            $query->current($date);
        }

        $perPage = $request->get('per_page', 50);
        $rates = $query->orderBy('effective_from', 'desc')->paginate($perPage);

        return $this->success($rates);
    }

    /**
     * Get single rate
     */
    public function show($id)
    {
        $rate = Rate::with(['supplier', 'product', 'creator'])->find($id);

        if (!$rate) {
            return $this->notFound('Rate not found');
        }

        return $this->success($rate);
    }

    /**
     * Create new rate
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'uuid' => 'sometimes|uuid|unique:rates,uuid',
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
            'rate' => 'required|numeric|min:0',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after_or_equal:effective_from',
            'is_active' => 'sometimes|boolean',
            'notes' => 'nullable|string',
            'version' => 'sometimes|integer',
        ]);

        if (isset($validated['uuid'])) {
            $existing = Rate::where('uuid', $validated['uuid'])->first();
            if ($existing) {
                if (isset($validated['version']) && $existing->version != $validated['version']) {
                    return $this->conflict([
                        'server_version' => $existing->version,
                        'server_data' => $existing,
                    ], 'Version conflict detected');
                }
                return $this->update($request, $existing->id);
            }
        }

        DB::beginTransaction();
        try {
            // Check for overlapping rates
            $overlap = Rate::where('supplier_id', $validated['supplier_id'])
                ->where('product_id', $validated['product_id'])
                ->where('is_active', true)
                ->where(function ($query) use ($validated) {
                    $query->where(function ($q) use ($validated) {
                        $q->where('effective_from', '<=', $validated['effective_from'])
                          ->where(function ($q2) use ($validated) {
                              $q2->whereNull('effective_to')
                                 ->orWhere('effective_to', '>=', $validated['effective_from']);
                          });
                    })
                    ->orWhere(function ($q) use ($validated) {
                        if (isset($validated['effective_to'])) {
                            $q->where('effective_from', '<=', $validated['effective_to'])
                              ->where(function ($q2) use ($validated) {
                                  $q2->whereNull('effective_to')
                                     ->orWhere('effective_to', '>=', $validated['effective_to']);
                              });
                        }
                    });
                })
                ->exists();

            if ($overlap) {
                DB::rollBack();
                return $this->error('Rate period overlaps with existing rate', 422);
            }

            $validated['created_by'] = $request->user()->id;
            $rate = Rate::create($validated);

            DB::commit();
            return $this->success($rate->load(['supplier', 'product']), 'Rate created successfully', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to create rate: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update rate
     */
    public function update(Request $request, $id)
    {
        $rate = Rate::find($id);

        if (!$rate) {
            return $this->notFound('Rate not found');
        }

        $validated = $request->validate([
            'rate' => 'sometimes|numeric|min:0',
            'effective_from' => 'sometimes|date',
            'effective_to' => 'nullable|date|after_or_equal:effective_from',
            'is_active' => 'sometimes|boolean',
            'notes' => 'nullable|string',
            'version' => 'sometimes|integer',
        ]);

        if (isset($validated['version']) && $rate->version != $validated['version']) {
            return $this->conflict([
                'server_version' => $rate->version,
                'server_data' => $rate,
            ], 'Version conflict detected');
        }

        DB::beginTransaction();
        try {
            $validated['updated_by'] = $request->user()->id;
            $rate->update($validated);

            DB::commit();
            return $this->success($rate->load(['supplier', 'product']), 'Rate updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to update rate: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete rate
     */
    public function destroy($id)
    {
        $rate = Rate::find($id);

        if (!$rate) {
            return $this->notFound('Rate not found');
        }

        // Check if rate is used in collections
        if ($rate->collections()->count() > 0) {
            return $this->error('Cannot delete rate that is used in collections', 422);
        }

        try {
            $rate->delete();
            return $this->success(null, 'Rate deleted successfully');
        } catch (\Exception $e) {
            return $this->error('Failed to delete rate: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get rate history for a supplier-product combination
     */
    public function history(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
        ]);

        $rates = Rate::where('supplier_id', $request->supplier_id)
            ->where('product_id', $request->product_id)
            ->orderBy('effective_from', 'desc')
            ->get();

        return $this->success($rates);
    }
}
