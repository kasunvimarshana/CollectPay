<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CollectionEntry;
use App\Models\Product;
use App\Models\Unit;
use Illuminate\Http\Request;

class CollectionEntryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return CollectionEntry::query()
            ->with(['supplier', 'product', 'unit'])
            ->orderByDesc('collected_at')
            ->paginate(50);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => ['required', 'uuid', 'exists:suppliers,id'],
            'product_id' => ['required', 'uuid', 'exists:products,id'],
            'unit_id' => ['required', 'uuid', 'exists:units,id'],
            'quantity' => ['required', 'numeric'],
            'collected_at' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $unit = Unit::query()->findOrFail($validated['unit_id']);
        $product = Product::query()->findOrFail($validated['product_id']);
        if ($unit->unit_type !== $product->unit_type) {
            return response()->json(['message' => 'Unit type does not match product unit type.'], 422);
        }

        $entry = CollectionEntry::query()->create([
            ...$validated,
            'quantity_in_base' => ((float) $validated['quantity']) * (float) $unit->to_base_multiplier,
            'entered_by_user_id' => $request->user()?->id,
            'version' => 1,
        ]);

        return response()->json($entry->load(['supplier', 'product', 'unit']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return CollectionEntry::query()->with(['supplier', 'product', 'unit'])->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $entry = CollectionEntry::query()->findOrFail($id);

        $validated = $request->validate([
            'supplier_id' => ['sometimes', 'uuid', 'exists:suppliers,id'],
            'product_id' => ['sometimes', 'uuid', 'exists:products,id'],
            'unit_id' => ['sometimes', 'uuid', 'exists:units,id'],
            'quantity' => ['sometimes', 'numeric'],
            'collected_at' => ['sometimes', 'date'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'base_version' => ['sometimes', 'integer'],
        ]);

        if (array_key_exists('base_version', $validated) && (int) $validated['base_version'] !== (int) $entry->version) {
            return response()->json(['message' => 'Version conflict.', 'server' => $entry], 409);
        }
        unset($validated['base_version']);

        $entry->fill($validated);

        if (array_key_exists('unit_id', $validated) || array_key_exists('quantity', $validated) || array_key_exists('product_id', $validated)) {
            $unit = Unit::query()->findOrFail($entry->unit_id);
            $product = Product::query()->findOrFail($entry->product_id);
            if ($unit->unit_type !== $product->unit_type) {
                return response()->json(['message' => 'Unit type does not match product unit type.'], 422);
            }
            $entry->quantity_in_base = ((float) $entry->quantity) * (float) $unit->to_base_multiplier;
        }

        $entry->version = ((int) $entry->version) + 1;
        $entry->save();

        return $entry->load(['supplier', 'product', 'unit']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $entry = CollectionEntry::query()->findOrFail($id);
        $entry->version = ((int) $entry->version) + 1;
        $entry->save();
        $entry->delete();

        return response()->json(['ok' => true]);
    }
}
