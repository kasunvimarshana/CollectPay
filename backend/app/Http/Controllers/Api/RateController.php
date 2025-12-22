<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rate;
use Illuminate\Http\Request;

class RateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Rate::query()
            ->with(['product'])
            ->orderByDesc('effective_from')
            ->paginate(50);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'uuid', 'exists:products,id'],
            'rate_per_base' => ['required', 'numeric'],
            'effective_from' => ['required', 'date'],
            'effective_to' => ['nullable', 'date'],
        ]);

        $rate = Rate::query()->create([
            ...$validated,
            'set_by_user_id' => $request->user()?->id,
            'version' => 1,
        ]);

        return response()->json($rate->load(['product']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Rate::query()->with(['product'])->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $rate = Rate::query()->findOrFail($id);

        $validated = $request->validate([
            'product_id' => ['sometimes', 'uuid', 'exists:products,id'],
            'rate_per_base' => ['sometimes', 'numeric'],
            'effective_from' => ['sometimes', 'date'],
            'effective_to' => ['sometimes', 'nullable', 'date'],
            'base_version' => ['sometimes', 'integer'],
        ]);

        if (array_key_exists('base_version', $validated) && (int) $validated['base_version'] !== (int) $rate->version) {
            return response()->json(['message' => 'Version conflict.', 'server' => $rate], 409);
        }

        unset($validated['base_version']);

        $rate->fill($validated);
        $rate->version = ((int) $rate->version) + 1;
        $rate->save();

        return $rate->load(['product']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $rate = Rate::query()->findOrFail($id);
        $rate->version = ((int) $rate->version) + 1;
        $rate->save();
        $rate->delete();

        return response()->json(['ok' => true]);
    }
}
