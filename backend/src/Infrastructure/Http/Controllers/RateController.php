<?php

namespace Src\Infrastructure\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Src\Infrastructure\Persistence\Eloquent\Models\RateModel;

class RateController
{
    public function index(Request $request)
    {
        $query = RateModel::query();

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('collection_id')) {
            $query->where('collection_id', $request->collection_id);
        }

        $rates = $query->with(['collection', 'creator'])
            ->orderBy('effective_from', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($rates);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'rate_type' => 'required|string',
            'collection_id' => 'nullable|exists:collections,id',
            'effective_from' => 'required|date',
            'effective_until' => 'nullable|date|after:effective_from',
            'is_active' => 'nullable|boolean',
            'metadata' => 'nullable|array',
            'device_id' => 'nullable|string',
        ]);

        $validated['uuid'] = (string) Str::uuid();
        $validated['created_by'] = $request->user()->id;
        $validated['version'] = 1;

        $rate = RateModel::create($validated);

        return response()->json($rate->load(['collection', 'creator']), 201);
    }

    public function show(string $uuid)
    {
        $rate = RateModel::where('uuid', $uuid)
            ->with(['collection', 'creator', 'updater'])
            ->firstOrFail();

        return response()->json($rate);
    }

    public function update(Request $request, string $uuid)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'sometimes|required|numeric|min:0',
            'effective_until' => 'nullable|date',
            'is_active' => 'nullable|boolean',
            'metadata' => 'nullable|array',
        ]);

        $rate = RateModel::where('uuid', $uuid)->firstOrFail();
        
        // Create new version instead of updating
        $newVersion = $rate->replicate();
        $newVersion->version = $rate->version + 1;
        $newVersion->updated_by = $request->user()->id;
        
        foreach ($validated as $key => $value) {
            $newVersion->{$key} = $value;
        }
        
        $newVersion->save();

        // Optionally deactivate old version
        $rate->update(['is_active' => false]);

        return response()->json($newVersion->load(['collection', 'creator']));
    }

    public function destroy(string $uuid)
    {
        $rate = RateModel::where('uuid', $uuid)->firstOrFail();
        $rate->delete();

        return response()->json(['message' => 'Rate deleted successfully']);
    }

    public function versions(string $uuid)
    {
        $rates = RateModel::where('uuid', $uuid)
            ->orderBy('version', 'desc')
            ->get();

        return response()->json($rates);
    }

    public function active(Request $request)
    {
        $now = now();
        
        $rates = RateModel::where('is_active', true)
            ->where('effective_from', '<=', $now)
            ->where(function ($query) use ($now) {
                $query->whereNull('effective_until')
                    ->orWhere('effective_until', '>=', $now);
            })
            ->with(['collection'])
            ->get();

        return response()->json($rates);
    }
}
