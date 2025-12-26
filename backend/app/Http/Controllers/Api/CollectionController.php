<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CollectionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CollectionController extends Controller
{
    protected CollectionService $service;

    public function __construct()
    {
        $this->service = new CollectionService();
    }

    public function index(Request $request): JsonResponse
    {
        $collections = $this->service->getAll(
            $request->get('page', 1),
            $request->get('limit', 20)
        );

        return response()->json([
            'success' => true,
            'data' => $collections->items(),
            'pagination' => [
                'total' => $collections->total(),
                'per_page' => $collections->perPage(),
                'current_page' => $collections->currentPage(),
                'last_page' => $collections->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'metadata' => 'nullable|json',
            ]);

            $collection = $this->service->create(
                $validated,
                $request->user()->id,
                $request->header('X-Device-ID')
            );

            return response()->json([
                'success' => true,
                'message' => 'Collection created successfully',
                'data' => $collection,
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
            $collection = $this->service->getById($uuid);

            return response()->json([
                'success' => true,
                'data' => $collection,
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
                'name' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'status' => 'sometimes|in:active,inactive,archived',
                'metadata' => 'nullable|json',
            ]);

            $collection = $this->service->update(
                $uuid,
                $validated,
                $request->user()->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Collection updated successfully',
                'data' => $collection,
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
                'message' => 'Collection deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function withPaymentSummary(string $uuid): JsonResponse
    {
        try {
            $data = $this->service->getWithPaymentSummary($uuid);

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }
}
