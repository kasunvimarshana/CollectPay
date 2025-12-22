<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Role;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SyncEndpointTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(User $user): string
    {
        return $user->createToken('t')->plainTextToken;
    }

    public function test_sync_applies_collections_and_payments(): void
    {
        $supplier = Supplier::factory()->create();
        $product = Product::factory()->create(['unit' => 'kg']);

        $role = Role::create(['name' => 'manager']);
        $user = User::create([
            'name' => 'Manager',
            'email' => 'mgr@example.com',
            'password' => Hash::make('password123'),
            'attributes' => [
                'allowed_supplier_ids' => [(string)$supplier->id],
            ],
        ]);
        $user->roles()->attach($role->id);
        $token = $this->tokenFor($user);

        $payload = [
            'collections' => [[
                'supplier_id' => (string)$supplier->id,
                'product_id' => (string)$product->id,
                'quantity' => 3,
                'unit' => 'kg',
            ]],
            'payments' => [[
                'supplier_id' => (string)$supplier->id,
                'amount' => 5.0,
                'currency' => 'USD',
                'type' => 'partial',
            ]],
        ];

        $res = $this->withHeader('Authorization','Bearer '.$token)
            ->postJson('/api/v1/sync', $payload);
        $res->assertOk()->assertJson(['ok' => true]);

        $this->assertDatabaseCount('collections', 1);
        $this->assertDatabaseCount('payments', 1);
    }
}
