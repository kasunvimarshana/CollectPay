<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected PaymentService $service;

    public function __construct()
    {
        $this->service = new PaymentService();
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [];
        if ($request->has('collection_id')) {
            $filters['collection_id'] = $request->get('collection_id');
        }
        if ($request->has('status')) {
            $filters['status'] = $request->get('status');
        }

        $payments = $this->service->getAll(
            $request->get('page', 1),
            $request->get('limit', 20),
            $filters
        );

        return response()->json([
            'success' => true,
            'data' => $payments->items(),
            'pagination' => [
                'total' => $payments->total(),
                'per_page' => $payments->perPage(),
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'collection_id' => 'required|exists:collections,id',
                'rate_id' => 'nullable|exists:rates,id',
                'payer_id' => 'required|exists:users,id',
                'amount' => 'required|numeric|min:0.01',
                'currency' => 'required|string|size:3',
                'status' => 'sometimes|in:pending,completed,failed',
                'payment_method' => 'required|in:cash,card,transfer,check',
                'payment_date' => 'required|date',
                'notes' => 'nullable|string',
                'metadata' => 'nullable|json',
            ]);

            $payment = $this->service->create(
                $validated,
                $request->user()->id,
                $request->header('X-Device-ID')
            );

            return response()->json([
                'success' => true,
                'message' => 'Payment created successfully',
                'data' => $payment,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function batch(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'payments' => 'required|array|min:1',
                'payments.*.collection_id' => 'required|exists:collections,id',
                'payments.*.payer_id' => 'required|exists:users,id',
                'payments.*.amount' => 'required|numeric|min:0.01',
                'payments.*.currency' => 'required|string|size:3',
                'payments.*.payment_method' => 'required|in:cash,card,transfer,check',
                'payments.*.payment_date' => 'required|date',
            ]);

            $results = $this->service->batchCreate(
                $validated['payments'],
                $request->user()->id,
                $request->header('X-Device-ID')
            );

            return response()->json([
                'success' => true,
                'message' => 'Batch processing completed',
                'results' => $results,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function show(string $uuid): JsonResponse
    {
        try {
            $payment = $this->service->getById($uuid);

            return response()->json([
                'success' => true,
                'data' => $payment,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    public function update(Request $request, string $uuid): JsonResponse
    {
        try {
            $validated = $request->validate([
                'amount' => 'sometimes|numeric|min:0.01',
                'status' => 'sometimes|in:pending,completed,failed',
                'payment_method' => 'sometimes|in:cash,card,transfer,check',
                'notes' => 'nullable|string',
                'metadata' => 'nullable|json',
            ]);

            $payment = $this->service->update(
                $uuid,
                $validated,
                $request->user()->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Payment updated successfully',
                'data' => $payment,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function destroy(Request $request, string $uuid): JsonResponse
    {
        try {
            $this->service->delete($uuid, $request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Payment deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
