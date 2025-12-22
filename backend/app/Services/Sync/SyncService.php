<?php

namespace App\Services\Sync;

use App\Models\ChangeLog;
use App\Models\CollectionEntry;
use App\Models\Device;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Rate;
use App\Models\Supplier;
use App\Models\Unit;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SyncService
{
    /**
     * @return array{status: 'applied'|'skipped'|'conflict', entity?: string, id?: string, version?: int, conflict?: array}
     */
    public function applyOperation(int $userId, string $deviceId, array $op, string $conflictStrategy = 'server_wins'): array
    {
        $entity = (string) ($op['entity'] ?? '');
        $type = (string) ($op['type'] ?? '');
        $id = (string) ($op['id'] ?? '');
        $baseVersion = $op['base_version'] ?? null;
        $payload = is_array($op['payload'] ?? null) ? $op['payload'] : [];

        if ($entity === '' || $type === '' || $id === '') {
            throw ValidationException::withMessages(['ops' => 'Each op requires entity, type, and id.']);
        }

        $modelClass = $this->entityToModelClass($entity);
        if ($modelClass === null) {
            throw ValidationException::withMessages(['ops' => "Unknown entity: {$entity}"]);
        }

        $now = CarbonImmutable::now();

        return DB::transaction(function () use ($userId, $deviceId, $entity, $type, $id, $baseVersion, $payload, $modelClass, $conflictStrategy, $now) {
            $existing = $modelClass::query()->withTrashed()->find($id);

            if ($type === 'delete') {
                if ($existing === null) {
                    // Nothing to delete; still idempotent.
                    return ['status' => 'skipped', 'entity' => $entity, 'id' => $id];
                }

                if ($baseVersion !== null && (int) $baseVersion !== (int) $existing->version) {
                    return [
                        'status' => 'conflict',
                        'entity' => $entity,
                        'id' => $id,
                        'conflict' => [
                            'reason' => 'version_mismatch',
                            'server' => $this->modelToPayload($existing),
                        ],
                    ];
                }

                $newVersion = ((int) $existing->version) + 1;

                $existing->forceFill(['version' => $newVersion]);
                $existing->save();
                $existing->delete();

                $this->logChange($userId, $deviceId, $entity, $id, 'delete', $newVersion, null, $now);

                return ['status' => 'applied', 'entity' => $entity, 'id' => $id, 'version' => $newVersion];
            }

            if ($type !== 'upsert') {
                throw ValidationException::withMessages(['ops' => "Unknown op type: {$type}"]);
            }

            $incoming = $this->normalizePayloadForEntity($entity, $payload);

            if ($existing !== null) {
                $existingVersion = (int) $existing->version;
                if ($baseVersion !== null && (int) $baseVersion !== $existingVersion) {
                    if ($conflictStrategy === 'client_wins') {
                        // proceed
                    } else {
                        return [
                            'status' => 'conflict',
                            'entity' => $entity,
                            'id' => $id,
                            'conflict' => [
                                'reason' => 'version_mismatch',
                                'server' => $this->modelToPayload($existing),
                                'client' => $incoming,
                            ],
                        ];
                    }
                }

                $newVersion = $existingVersion + 1;

                $existing->restore();
                $existing->forceFill(array_merge($incoming, ['version' => $newVersion]));
                $existing->save();

                $this->logChange($userId, $deviceId, $entity, $id, 'upsert', $newVersion, $this->modelToPayload($existing), $now);

                return ['status' => 'applied', 'entity' => $entity, 'id' => $id, 'version' => $newVersion];
            }

            $model = new $modelClass();
            $model->forceFill(array_merge($incoming, ['id' => $id, 'version' => 1]));
            $model->save();

            $this->logChange($userId, $deviceId, $entity, $id, 'upsert', 1, $this->modelToPayload($model), $now);

            return ['status' => 'applied', 'entity' => $entity, 'id' => $id, 'version' => 1];
        });
    }

    /** @return class-string<Model>|null */
    private function entityToModelClass(string $entity): ?string
    {
        return match ($entity) {
            'suppliers' => Supplier::class,
            'products' => Product::class,
            'units' => Unit::class,
            'collection_entries' => CollectionEntry::class,
            'rates' => Rate::class,
            'payments' => Payment::class,
            default => null,
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function normalizePayloadForEntity(string $entity, array $payload): array
    {
        // Prevent clients from injecting server-managed fields.
        $payload = Arr::except($payload, ['version', 'created_at', 'updated_at', 'deleted_at']);

        return match ($entity) {
            'suppliers' => Arr::only($payload, ['name', 'phone', 'address', 'external_code', 'is_active', 'created_by_user_id']),
            'products' => Arr::only($payload, ['name', 'unit_type', 'is_active']),
            'units' => Arr::only($payload, ['code', 'name', 'unit_type', 'to_base_multiplier']),
            'collection_entries' => $this->normalizeCollectionEntryPayload($payload),
            'rates' => Arr::only($payload, ['product_id', 'rate_per_base', 'effective_from', 'effective_to', 'set_by_user_id']),
            'payments' => Arr::only($payload, ['supplier_id', 'type', 'amount', 'paid_at', 'entered_by_user_id', 'notes']),
            default => $payload,
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function normalizeCollectionEntryPayload(array $payload): array
    {
        $clean = Arr::only($payload, [
            'supplier_id',
            'product_id',
            'unit_id',
            'quantity',
            'collected_at',
            'entered_by_user_id',
            'notes',
        ]);

        $unitId = (string) ($clean['unit_id'] ?? '');
        $quantity = $clean['quantity'] ?? null;

        if ($unitId !== '' && $quantity !== null) {
            $unit = Unit::query()->find($unitId);
            if ($unit !== null) {
                $clean['quantity_in_base'] = (string) (((float) $quantity) * (float) $unit->to_base_multiplier);
            }
        }

        return $clean;
    }

    /**
     * @return array<string, mixed>
     */
    private function modelToPayload(Model $model): array
    {
        $data = $model->toArray();
        // Keep payload stable for sync; strip relationships.
        return Arr::except($data, ['relations']);
    }

    private function logChange(int $userId, string $deviceId, string $entity, string $entityId, string $operation, int $version, ?array $payload, CarbonImmutable $changedAt): void
    {
        ChangeLog::query()->create([
            'model' => $entity,
            'model_id' => $entityId,
            'operation' => $operation,
            'version' => $version,
            'payload' => $payload,
            'user_id' => $userId,
            'device_id' => $deviceId,
            'changed_at' => $changedAt,
        ]);

        Device::query()->whereKey($deviceId)->update([
            'last_seen_at' => $changedAt,
        ]);
    }
}
