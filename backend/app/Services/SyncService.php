<?php

namespace App\Services;

use App\Models\Device;
use App\Models\Payment;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncService
{
    public function syncTransactions(array $transactions, int $deviceId): array
    {
        $results = [
            'synced' => [],
            'conflicts' => [],
            'errors' => [],
        ];

        foreach ($transactions as $transactionData) {
            try {
                DB::beginTransaction();

                $result = $this->syncTransaction($transactionData, $deviceId);

                if ($result['status'] === 'conflict') {
                    $results['conflicts'][] = $result;
                } else {
                    $results['synced'][] = $result;
                }

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Transaction sync error: '.$e->getMessage(), [
                    'transaction' => $transactionData,
                    'device_id' => $deviceId,
                ]);

                $results['errors'][] = [
                    'uuid' => $transactionData['uuid'] ?? null,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    public function syncPayments(array $payments, int $deviceId): array
    {
        $results = [
            'synced' => [],
            'conflicts' => [],
            'errors' => [],
        ];

        foreach ($payments as $paymentData) {
            try {
                DB::beginTransaction();

                $result = $this->syncPayment($paymentData, $deviceId);

                if ($result['status'] === 'conflict') {
                    $results['conflicts'][] = $result;
                } else {
                    $results['synced'][] = $result;
                }

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Payment sync error: '.$e->getMessage(), [
                    'payment' => $paymentData,
                    'device_id' => $deviceId,
                ]);

                $results['errors'][] = [
                    'uuid' => $paymentData['uuid'] ?? null,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    private function syncTransaction(array $data, int $deviceId): array
    {
        $uuid = $data['uuid'];
        $existing = Transaction::where('uuid', $uuid)->first();

        if ($existing) {
            // Check for conflicts
            if ($this->hasConflict($existing, $data)) {
                return [
                    'status' => 'conflict',
                    'uuid' => $uuid,
                    'server_data' => $existing,
                    'client_data' => $data,
                    'resolution' => 'server_wins', // Default resolution strategy
                ];
            }

            // Update if client version is newer
            if (isset($data['updated_at']) && $data['updated_at'] > $existing->updated_at) {
                $existing->update($data);
                $existing->synced_at = now();
                $existing->save();

                return [
                    'status' => 'updated',
                    'uuid' => $uuid,
                    'id' => $existing->id,
                ];
            }

            return [
                'status' => 'unchanged',
                'uuid' => $uuid,
                'id' => $existing->id,
            ];
        }

        // Create new transaction
        $transaction = Transaction::create(array_merge($data, [
            'device_id' => $deviceId,
            'synced_at' => now(),
        ]));

        return [
            'status' => 'created',
            'uuid' => $uuid,
            'id' => $transaction->id,
        ];
    }

    private function syncPayment(array $data, int $deviceId): array
    {
        $uuid = $data['uuid'];
        $existing = Payment::where('uuid', $uuid)->first();

        if ($existing) {
            // Check for conflicts
            if ($this->hasConflict($existing, $data)) {
                return [
                    'status' => 'conflict',
                    'uuid' => $uuid,
                    'server_data' => $existing,
                    'client_data' => $data,
                    'resolution' => 'server_wins',
                ];
            }

            // Update if client version is newer
            if (isset($data['updated_at']) && $data['updated_at'] > $existing->updated_at) {
                $existing->update($data);
                $existing->synced_at = now();
                $existing->save();

                return [
                    'status' => 'updated',
                    'uuid' => $uuid,
                    'id' => $existing->id,
                ];
            }

            return [
                'status' => 'unchanged',
                'uuid' => $uuid,
                'id' => $existing->id,
            ];
        }

        // Create new payment
        $payment = Payment::create(array_merge($data, [
            'device_id' => $deviceId,
            'synced_at' => now(),
        ]));

        return [
            'status' => 'created',
            'uuid' => $uuid,
            'id' => $payment->id,
        ];
    }

    private function hasConflict($existing, array $data): bool
    {
        // Conflict if both server and client have been updated since last sync
        if (isset($data['updated_at']) && isset($data['synced_at'])) {
            $clientUpdated = strtotime($data['updated_at']);
            $clientSynced = strtotime($data['synced_at']);
            $serverUpdated = $existing->updated_at->timestamp;

            // If server was updated after client last synced, and client also updated, it's a conflict
            if ($serverUpdated > $clientSynced && $clientUpdated > $clientSynced) {
                return true;
            }
        }

        return false;
    }

    public function updateDeviceSync(int $deviceId): void
    {
        $device = Device::findOrFail($deviceId);
        $device->last_sync_at = now();
        $device->save();
    }
}
