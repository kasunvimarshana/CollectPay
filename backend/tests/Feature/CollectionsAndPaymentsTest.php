<?php

namespace Tests\Feature;

use App\Models\Collection;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Rate;
use App\Models\Role;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class CollectionsAndPaymentsTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(User $user): string
    {
        return $user->createToken('t')->plainTextToken;
    }

    public function test_collector_can_create_collection(): void
    {
        $supplier = Supplier::factory()->create();
        $product = Product::factory()->create(['unit' => 'kg']);
        Rate::factory()->create([
            'supplier_id' => $supplier->id,
            'product_id' => $product->id,
            'price_per_unit' => 10.0,
            'currency' => 'USD',
            'effective_from' => now()->subDay(),
        ]);

        $role = Role::create(['name' => 'collector']);
        $user = User::create([
            'name' => 'Collector',
            'email' => 'c@example.com',
            'password' => Hash::make('password123'),
            'attributes' => [
                'allowed_supplier_ids' => [(string)$supplier->id],
            ],
        ]);
        $user->roles()->attach($role->id);
        $token = $this->tokenFor($user);

        $res = $this->withHeader('Authorization','Bearer '.$token)
            ->postJson('/api/v1/collections', [
                'supplier_id' => (string)$supplier->id,
                'product_id' => (string)$product->id,
                'quantity' => 5,
                'unit' => 'kg',
                'notes' => null,
            ]);
        $res->assertCreated();
        $this->assertDatabaseHas('collections', ['supplier_id' => $supplier->id, 'product_id' => $product->id]);
    }

    public function test_cashier_can_record_payment_and_compute_payable(): void
    {
        $supplier = Supplier::factory()->create();
        $product = Product::factory()->create(['unit' => 'kg']);
        Rate::factory()->create([
            'supplier_id' => $supplier->id,
            'product_id' => $product->id,
            'price_per_unit' => 2.5,
            'currency' => 'USD',
            'effective_from' => now()->subDay(),
        ]);
        Collection::factory()->create([
            'supplier_id' => $supplier->id,
            'product_id' => $product->id,
            'quantity' => 10,
            'unit' => 'kg',
        ]);

        $role = Role::create(['name' => 'cashier']);
        $user = User::create([
            'name' => 'Cashier',
            'email' => 'pay@example.com',
            'password' => Hash::make('password123'),
            'attributes' => [
                'allowed_supplier_ids' => [(string)$supplier->id],
            ],
        ]);
        $user->roles()->attach($role->id);
        $token = $this->tokenFor($user);

        $res = $this->withHeader('Authorization','Bearer '.$token)
            ->postJson('/api/v1/payments', [
                'supplier_id' => (string)$supplier->id,
                'amount' => 10.0,
                'currency' => 'USD',
                'type' => 'partial',
                'reference' => 'R1',
            ]);
        $res->assertCreated();

        $payable = $this->withHeader('Authorization','Bearer '.$token)
            ->getJson('/api/v1/suppliers/'.$supplier->id.'/payable');
        $payable->assertOk();
        $data = $payable->json();
        $this->assertEquals(25.0, (float)$data['total']);
        $this->assertEquals(10.0, (float)$data['paid']);
        $this->assertEquals(15.0, (float)$data['balance']);
    }
}
