<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Application\UseCases\BatchSyncUseCase;
use App\Application\DTOs\BatchSyncDTO;
use App\Models\SyncOperation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SyncController extends Controller
{
    public function __construct(
        private BatchSyncUseCase $batchSyncUseCase
    ) {
    }
    /**
     * Sync batch operations from offline device
     * 
     * @OA\Post(
     *     path="/api/sync",
     *     tags={"Sync"},
     *     summary="Sync offline operations",
     *     description="Batch sync operations with conflict detection and resolution",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"device_id","operations"},
     *             @OA\Property(property="device_id", type="string"),
     *             @OA\Property(property="operations", type="array", @OA\Items(
     *                 @OA\Property(property="local_id", type="string"),
     *                 @OA\Property(property="entity", type="string"),
     *                 @OA\Property(property="operation", type="string"),
     *                 @OA\Property(property="data", type="object"),
     *                 @OA\Property(property="timestamp", type="string")
     *             ))
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Sync completed",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="results", type="array", @OA\Items())
     *         )
     *     )
     * )
     */
    public function sync(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'device_id' => 'required|string',
            'operations' => 'required|array',
            'operations.*.local_id' => 'required|string',
            'operations.*.entity' => 'required|in:supplier,product,product_rate,collection,payment',
            'operations.*.operation' => 'required|in:create,update,delete',
            'operations.*.data' => 'required|array',
            'operations.*.timestamp' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Create DTO from request
            $dto = BatchSyncDTO::fromArray($request->all());
            
            // Execute batch sync through use case
            $results = $this->batchSyncUseCase->execute($dto, $request->user()->id);

            return response()->json([
                'success' => true,
                'results' => $results,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Sync failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'error' => 'Sync operation failed',
            ], 500);
        }
    }

    /**
     * Get pending operations for a device
     */
    public function getPendingOperations(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'device_id' => 'required|string',
            'since' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $query = SyncOperation::where('device_id', $request->device_id)
            ->where('status', 'pending');

        if ($request->has('since')) {
            $query->where('created_at', '>', $request->since);
        }

        $operations = $query->orderBy('created_at')->get();

        return response()->json([
            'success' => true,
            'operations' => $operations,
        ]);
    }
}
