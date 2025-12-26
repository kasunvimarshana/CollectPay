<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\RateVersion;
use App\Models\Collection;
use App\Models\Payment;
use App\Models\SyncLog;

class SyncController extends Controller
{
    /**
     * Pull data from server (changes since last sync)
     */
    public function pull(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'since' => 'required|date',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        $since = $request->input('since');

        $data = [
            'suppliers' => Supplier::where('updated_at', '>', $since)->get(),
            'products' => Product::where('updated_at', '>', $since)->get(),
            'rateVersions' => RateVersion::where('updated_at', '>', $since)->get(),
            'collections' => Collection::where('updated_at', '>', $since)->get(),
            'payments' => Payment::where('updated_at', '>', $since)->get(),
            'timestamp' => now()->toISOString(),
        ];

        return $this->successResponse($data);
    }

    /**
     * Push local changes to server (batch sync)
     */
    public function push(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'changes' => 'required|array',
            'changes.*.entityType' => 'required|in:supplier,product,rate_version,collection,payment',
            'changes.*.operation' => 'required|in:create,update,delete',
            'changes.*.entityId' => 'required|string',
            'changes.*.data' => 'required|array',
            'changes.*.clientTimestamp' => 'required|date',
            'changes.*.idempotencyKey' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        $changes = $request->input('changes');
        $conflicts = [];
        $errors = [];
        $syncedCount = 0;

        DB::beginTransaction();

        try {
            foreach ($changes as $change) {
                $result = $this->processChange($change, $request->user());

                if ($result['status'] === 'conflict') {
                    $conflicts[] = $result['conflict'];
                } elseif ($result['status'] === 'error') {
                    $errors[] = $result['error'];
                } else {
                    $syncedCount++;
                }
            }

            DB::commit();

            return $this->successResponse([
                'success' => true,
                'syncedCount' => $syncedCount,
                'conflicts' => $conflicts,
                'errors' => $errors,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Sync failed: ' . $e->getMessage(), null, 500);
        }
    }

    private function processChange(array $change, $user)
    {
        $entityType = $change['entityType'];
        $operation = $change['operation'];
        $entityId = $change['entityId'];
        $data = $change['data'];
        $idempotencyKey = $change['idempotencyKey'] ?? null;

        // Log the sync operation
        SyncLog::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'device_id' => $data['device_id'] ?? 'unknown',
            'entity_type' => $entityType,
            'operation' => $operation,
            'entity_id' => $entityId,
            'client_timestamp' => $change['clientTimestamp'],
            'payload' => json_encode($data),
            'status' => 'pending',
        ]);

        try {
            switch ($entityType) {
                case 'supplier':
                    return $this->syncSupplier($operation, $entityId, $data, $user);
                case 'product':
                    return $this->syncProduct($operation, $entityId, $data, $user);
                case 'rate_version':
                    return $this->syncRateVersion($operation, $entityId, $data, $user);
                case 'collection':
                    return $this->syncCollection($operation, $entityId, $data, $idempotencyKey, $user);
                case 'payment':
                    return $this->syncPayment($operation, $entityId, $data, $idempotencyKey, $user);
                default:
                    return [
                        'status' => 'error',
                        'error' => [
                            'entityType' => $entityType,
                            'entityId' => $entityId,
                            'message' => 'Unknown entity type',
                        ],
                    ];
            }
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'error' => [
                    'entityType' => $entityType,
                    'entityId' => $entityId,
                    'message' => $e->getMessage(),
                ],
            ];
        }
    }

    private function syncSupplier($operation, $entityId, $data, $user)
    {
        $existing = Supplier::find($entityId);

        if ($operation === 'delete') {
            if ($existing) {
                $existing->update([
                    'deleted_at' => now(),
                    'version' => $existing->version + 1,
                ]);
            }
            return ['status' => 'success'];
        }

        if ($existing) {
            // Check for version conflict
            if (isset($data['version']) && $data['version'] < $existing->version) {
                return [
                    'status' => 'conflict',
                    'conflict' => [
                        'entityType' => 'supplier',
                        'entityId' => $entityId,
                        'serverVersion' => $existing->version,
                        'clientVersion' => $data['version'],
                        'resolution' => 'server_wins',
                    ],
                ];
            }

            $existing->update([
                'name' => $data['name'] ?? $existing->name,
                'code' => $data['code'] ?? $existing->code,
                'address' => $data['address'] ?? $existing->address,
                'phone' => $data['phone'] ?? $existing->phone,
                'email' => $data['email'] ?? $existing->email,
                'notes' => $data['notes'] ?? $existing->notes,
                'version' => $existing->version + 1,
            ]);
        } else {
            Supplier::create([
                'id' => $entityId,
                'name' => $data['name'],
                'code' => $data['code'],
                'address' => $data['address'] ?? null,
                'phone' => $data['phone'] ?? null,
                'email' => $data['email'] ?? null,
                'notes' => $data['notes'] ?? null,
                'user_id' => $user->id,
                'version' => 1,
            ]);
        }

        return ['status' => 'success'];
    }

    private function syncProduct($operation, $entityId, $data, $user)
    {
        $existing = Product::find($entityId);

        if ($operation === 'delete') {
            if ($existing) {
                $existing->update([
                    'deleted_at' => now(),
                    'version' => $existing->version + 1,
                ]);
            }
            return ['status' => 'success'];
        }

        if ($existing) {
            if (isset($data['version']) && $data['version'] < $existing->version) {
                return [
                    'status' => 'conflict',
                    'conflict' => [
                        'entityType' => 'product',
                        'entityId' => $entityId,
                        'serverVersion' => $existing->version,
                        'clientVersion' => $data['version'],
                        'resolution' => 'server_wins',
                    ],
                ];
            }

            $existing->update([
                'name' => $data['name'] ?? $existing->name,
                'code' => $data['code'] ?? $existing->code,
                'unit' => $data['unit'] ?? $existing->unit,
                'description' => $data['description'] ?? $existing->description,
                'version' => $existing->version + 1,
            ]);
        } else {
            Product::create([
                'id' => $entityId,
                'name' => $data['name'],
                'code' => $data['code'],
                'unit' => $data['unit'],
                'description' => $data['description'] ?? null,
                'user_id' => $user->id,
                'version' => 1,
            ]);
        }

        return ['status' => 'success'];
    }

    private function syncRateVersion($operation, $entityId, $data, $user)
    {
        $existing = RateVersion::find($entityId);

        if ($operation === 'delete') {
            if ($existing) {
                $existing->update([
                    'deleted_at' => now(),
                    'version' => $existing->version + 1,
                ]);
            }
            return ['status' => 'success'];
        }

        if ($existing) {
            if (isset($data['version']) && $data['version'] < $existing->version) {
                return [
                    'status' => 'conflict',
                    'conflict' => [
                        'entityType' => 'rate_version',
                        'entityId' => $entityId,
                        'serverVersion' => $existing->version,
                        'clientVersion' => $data['version'],
                        'resolution' => 'server_wins',
                    ],
                ];
            }

            $existing->update([
                'rate' => $data['rate'] ?? $existing->rate,
                'effective_from' => $data['effective_from'] ?? $existing->effective_from,
                'effective_to' => $data['effective_to'] ?? $existing->effective_to,
                'version' => $existing->version + 1,
            ]);
        } else {
            RateVersion::create([
                'id' => $entityId,
                'product_id' => $data['product_id'],
                'rate' => $data['rate'],
                'effective_from' => $data['effective_from'],
                'effective_to' => $data['effective_to'] ?? null,
                'user_id' => $user->id,
                'version' => 1,
            ]);
        }

        return ['status' => 'success'];
    }

    private function syncCollection($operation, $entityId, $data, $idempotencyKey, $user)
    {
        // Check idempotency key to prevent duplicates
        if ($idempotencyKey) {
            $existingByKey = Collection::where('idempotency_key', $idempotencyKey)->first();
            if ($existingByKey) {
                return ['status' => 'success']; // Already synced
            }
        }

        $existing = Collection::find($entityId);

        if ($operation === 'delete') {
            if ($existing) {
                $existing->update([
                    'deleted_at' => now(),
                    'version' => $existing->version + 1,
                ]);
            }
            return ['status' => 'success'];
        }

        if ($existing) {
            if (isset($data['version']) && $data['version'] < $existing->version) {
                return [
                    'status' => 'conflict',
                    'conflict' => [
                        'entityType' => 'collection',
                        'entityId' => $entityId,
                        'serverVersion' => $existing->version,
                        'clientVersion' => $data['version'],
                        'resolution' => 'server_wins',
                    ],
                ];
            }

            $existing->update([
                'quantity' => $data['quantity'] ?? $existing->quantity,
                'notes' => $data['notes'] ?? $existing->notes,
                'version' => $existing->version + 1,
            ]);
        } else {
            Collection::create([
                'id' => $entityId,
                'supplier_id' => $data['supplier_id'],
                'product_id' => $data['product_id'],
                'quantity' => $data['quantity'],
                'rate_version_id' => $data['rate_version_id'],
                'applied_rate' => $data['applied_rate'],
                'collection_date' => $data['collection_date'],
                'notes' => $data['notes'] ?? null,
                'user_id' => $user->id,
                'idempotency_key' => $idempotencyKey ?? Str::uuid(),
                'version' => 1,
            ]);
        }

        return ['status' => 'success'];
    }

    private function syncPayment($operation, $entityId, $data, $idempotencyKey, $user)
    {
        // Check idempotency key to prevent duplicates
        if ($idempotencyKey) {
            $existingByKey = Payment::where('idempotency_key', $idempotencyKey)->first();
            if ($existingByKey) {
                return ['status' => 'success']; // Already synced
            }
        }

        $existing = Payment::find($entityId);

        if ($operation === 'delete') {
            if ($existing) {
                $existing->update([
                    'deleted_at' => now(),
                    'version' => $existing->version + 1,
                ]);
            }
            return ['status' => 'success'];
        }

        if ($existing) {
            if (isset($data['version']) && $data['version'] < $existing->version) {
                return [
                    'status' => 'conflict',
                    'conflict' => [
                        'entityType' => 'payment',
                        'entityId' => $entityId,
                        'serverVersion' => $existing->version,
                        'clientVersion' => $data['version'],
                        'resolution' => 'server_wins',
                    ],
                ];
            }

            $existing->update([
                'amount' => $data['amount'] ?? $existing->amount,
                'notes' => $data['notes'] ?? $existing->notes,
                'version' => $existing->version + 1,
            ]);
        } else {
            Payment::create([
                'id' => $entityId,
                'supplier_id' => $data['supplier_id'],
                'amount' => $data['amount'],
                'type' => $data['type'],
                'payment_date' => $data['payment_date'],
                'notes' => $data['notes'] ?? null,
                'reference_number' => $data['reference_number'] ?? null,
                'user_id' => $user->id,
                'idempotency_key' => $idempotencyKey ?? Str::uuid(),
                'version' => 1,
            ]);
        }

        return ['status' => 'success'];
    }
}
