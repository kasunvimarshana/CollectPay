<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\CollectionService;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class SyncController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
            $payload = $request->validate([
                'collections' => 'array',
                'collections.*.supplier_id' => 'required_with:collections|exists:suppliers,id',
                'collections.*.product_id' => 'required_with:collections|exists:products,id',
                'collections.*.quantity' => 'required_with:collections|numeric|min:0',
                'collections.*.unit' => 'required_with:collections|in:g,kg,ml,l',
                'collections.*.collected_at' => 'nullable|date',
                'collections.*.notes' => 'nullable|string',
                'payments' => 'array',
                'payments.*.supplier_id' => 'required_with:payments|exists:suppliers,id',
                'payments.*.amount' => 'required_with:payments|numeric|min:0',
                'payments.*.currency' => 'required_with:payments|string|size:3',
                'payments.*.type' => 'required_with:payments|in:advance,partial,final',
                'payments.*.reference' => 'nullable|string|max:255',
                'payments.*.paid_at' => 'nullable|date',
            ]);

            $results = [
                'collections' => [],
                'payments' => [],
            ];

            DB::transaction(function () use ($payload, &$results) {
                $collectionService = app(CollectionService::class);
                $paymentService = app(PaymentService::class);
                foreach (Arr::get($payload, 'collections', []) as $item) {
                    $created = $collectionService->create($item);
                    $results['collections'][] = $created;
                }
                foreach (Arr::get($payload, 'payments', []) as $item) {
                    $created = $paymentService->record($item);
                    $results['payments'][] = $created;
                }
            });

            return response()->json([
                'ok' => true,
                'applied' => $results,
            ]);
    }
}
