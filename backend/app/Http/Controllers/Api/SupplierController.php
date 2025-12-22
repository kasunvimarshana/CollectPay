<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Supplier::query()
            ->orderBy('name')
            ->paginate(50);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:64'],
            'address' => ['nullable', 'string'],
            'external_code' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $supplier = Supplier::query()->create([
            ...$validated,
            'created_by_user_id' => $request->user()?->id,
            'version' => 1,
        ]);

        return response()->json($supplier, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Supplier::query()->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $supplier = Supplier::query()->findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:64'],
            'address' => ['sometimes', 'nullable', 'string'],
            'external_code' => ['sometimes', 'nullable', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
            'base_version' => ['sometimes', 'integer'],
        ]);

        if (array_key_exists('base_version', $validated) && (int) $validated['base_version'] !== (int) $supplier->version) {
            return response()->json([
                'message' => 'Version conflict.',
                'server' => $supplier,
            ], 409);
        }

        unset($validated['base_version']);

        $supplier->fill($validated);
        $supplier->version = ((int) $supplier->version) + 1;
        $supplier->save();

        return $supplier;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $supplier = Supplier::query()->findOrFail($id);
        $supplier->version = ((int) $supplier->version) + 1;
        $supplier->save();
        $supplier->delete();

        return response()->json(['ok' => true]);
    }
}
