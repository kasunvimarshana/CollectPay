<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Payment::query()
            ->with(['supplier'])
            ->orderByDesc('paid_at')
            ->paginate(50);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => ['required', 'uuid', 'exists:suppliers,id'],
            'type' => ['required', 'in:advance,partial,final,adjustment'],
            'amount' => ['required', 'numeric'],
            'paid_at' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $payment = Payment::query()->create([
            ...$validated,
            'entered_by_user_id' => $request->user()?->id,
            'version' => 1,
        ]);

        return response()->json($payment->load(['supplier']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Payment::query()->with(['supplier'])->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $payment = Payment::query()->findOrFail($id);

        $validated = $request->validate([
            'supplier_id' => ['sometimes', 'uuid', 'exists:suppliers,id'],
            'type' => ['sometimes', 'in:advance,partial,final,adjustment'],
            'amount' => ['sometimes', 'numeric'],
            'paid_at' => ['sometimes', 'date'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'base_version' => ['sometimes', 'integer'],
        ]);

        if (array_key_exists('base_version', $validated) && (int) $validated['base_version'] !== (int) $payment->version) {
            return response()->json(['message' => 'Version conflict.', 'server' => $payment], 409);
        }

        unset($validated['base_version']);

        $payment->fill($validated);
        $payment->version = ((int) $payment->version) + 1;
        $payment->save();

        return $payment->load(['supplier']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $payment = Payment::query()->findOrFail($id);
        $payment->version = ((int) $payment->version) + 1;
        $payment->save();
        $payment->delete();

        return response()->json(['ok' => true]);
    }
}
