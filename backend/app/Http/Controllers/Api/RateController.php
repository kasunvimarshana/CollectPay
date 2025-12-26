<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RateController extends Controller
{
    protected RateService $service;

    public function __construct()
    {
        $this->service = new RateService();
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [];
        if ($request->has('is_active')) {
            $filters['is_active'] = $request->boolean('is_active');
        }
        if ($request->has('collection_id')) {
            $filters['collection_id'] = $request->get('collection_id');
        }

        $rates = $this->service->getAll(
            $request->get('page', 1),
            $request->get('limit', 20),
            $filters
        );

        return response()->json([
            'success' => true,
            'data' => $rates->items(),
            'pagination' => [
                'total' => $rates->total(),
                'per_page' => $rates->perPage(),
                'current_page' => $rates->currentPage(),
                'last_page' => $rates->lastPage(),
            ],
        ]);
    }

    public function active(Request $request): JsonResponse
    {
        $rates = $this->service->getActive(
            $request->get('page', 1),
            $request->get('limit', 20)
        );

        return response()->json([
            'success' => true,
            'data' => $rates->items(),
            'pagination' => [
                'total' => $rates->total(),
                'per_page' => $rates->perPage(),
                'current_page' => $rates->currentPage(),
                'last_page' => $rates->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'amount' => 'required|numeric|min:0.01',
                'currency' => 'required|string|size:3',
                'rate_type' => 'required|in:daily,weekly,monthly,annual,one-time',
                'collection_id' => 'nullable|exists:collections,id',
                'effective_from' => 'required|date',
                'effective_until' => 'nullable|date|after:effective_from',
                'is_active' => 'sometimes|boolean',
                'metadata' => 'nullable|json',
            ]);

            $rate = $this->service->create(
                $validated,
                $request->user()->id,
                $request->header('X-Device-ID')
            );

            return response()->json([
                'success' => true,
                'message' => 'Rate created successfully',
                'data' => $rate,
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
            $rate = $this->service->getById($uuid);

            return response()->json([
                'success' => true,
                'data' => $rate,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    public function versions(string $name): JsonResponse
    {
        try {
            $versions = $this->service->getVersionsByName($name);

            return response()->json([
                'success' => true,
                'data' => $versions,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    public function createVersion(Request $request, string $uuid): JsonResponse
    {
        try {
            $validated = $request->validate([
                'amount' => 'required|numeric|min:0.01',
                'effective_from' => 'required|date',
                'effective_until' => 'nullable|date|after:effective_from',
                'currency' => 'sometimes|string|size:3',
                'metadata' => 'nullable|json',
            ]);

            $rate = $this->service->createVersion(
                $uuid,
                $validated,
                $request->user()->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Rate version created successfully',
                'data' => $rate,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function deactivate(Request $request, string $uuid): JsonResponse
    {
        try {
            $rate = $this->service->deactivate($uuid, $request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Rate deactivated successfully',
                'data' => $rate,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
