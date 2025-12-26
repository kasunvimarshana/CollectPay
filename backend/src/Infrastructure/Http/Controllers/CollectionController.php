<?php

namespace Src\Infrastructure\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Src\Infrastructure\Persistence\Eloquent\Models\CollectionModel;

class CollectionController
{
    public function index(Request $request)
    {
        $query = CollectionModel::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('user_id')) {
            $query->where('created_by', $request->user_id);
        }

        $collections = $query->with(['creator', 'updater'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($collections);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,archived',
            'metadata' => 'nullable|array',
            'device_id' => 'nullable|string',
        ]);

        $validated['uuid'] = (string) Str::uuid();
        $validated['created_by'] = $request->user()->id;
        $validated['version'] = 1;

        $collection = CollectionModel::create($validated);

        return response()->json($collection->load(['creator']), 201);
    }

    public function show(string $uuid)
    {
        $collection = CollectionModel::where('uuid', $uuid)
            ->with(['creator', 'updater', 'payments', 'rates'])
            ->firstOrFail();

        return response()->json($collection);
    }

    public function update(Request $request, string $uuid)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive,archived',
            'metadata' => 'nullable|array',
        ]);

        $collection = CollectionModel::where('uuid', $uuid)->firstOrFail();
        
        $validated['updated_by'] = $request->user()->id;
        $validated['version'] = $collection->version + 1;

        $collection->update($validated);

        return response()->json($collection->load(['creator', 'updater']));
    }

    public function destroy(string $uuid)
    {
        $collection = CollectionModel::where('uuid', $uuid)->firstOrFail();
        $collection->delete();

        return response()->json(['message' => 'Collection deleted successfully']);
    }

    public function payments(string $uuid)
    {
        $collection = CollectionModel::where('uuid', $uuid)->firstOrFail();
        
        $payments = $collection->payments()
            ->with(['payer', 'rate'])
            ->orderBy('payment_date', 'desc')
            ->paginate(15);

        return response()->json($payments);
    }
}
