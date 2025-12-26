<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Supplier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupplierTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_can_list_suppliers()
    {
        $user = User::factory()->create(['role' => 'admin']);
        Supplier::factory()->count(3)->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/suppliers');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'code', 'is_active']
                ]
            ]);
    }

    public function test_can_create_supplier()
    {
        $user = User::factory()->create(['role' => 'admin']);

        $supplierData = [
            'name' => 'Test Supplier',
            'code' => 'SUP-TEST',
            'address' => '123 Test St',
            'phone' => '+94771234567',
            'email' => 'test@supplier.com',
            'is_active' => true,
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/suppliers', $supplierData);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Test Supplier']);

        $this->assertDatabaseHas('suppliers', ['code' => 'SUP-TEST']);
    }

    public function test_can_get_supplier_with_balance()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $supplier = Supplier::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/suppliers/{$supplier->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'name',
                'code',
                'total_collections',
                'total_payments',
                'balance',
            ]);
    }

    public function test_can_update_supplier_with_version_control()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $supplier = Supplier::factory()->create(['version' => 1]);

        $updateData = [
            'name' => 'Updated Supplier',
            'code' => $supplier->code,
            'version' => 1,
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/suppliers/{$supplier->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Updated Supplier']);

        $this->assertDatabaseHas('suppliers', [
            'id' => $supplier->id,
            'name' => 'Updated Supplier',
            'version' => 2,
        ]);
    }

    public function test_version_mismatch_prevents_update()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $supplier = Supplier::factory()->create(['version' => 2]);

        $updateData = [
            'name' => 'Updated Supplier',
            'code' => $supplier->code,
            'version' => 1, // Wrong version
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/suppliers/{$supplier->id}", $updateData);

        $response->assertStatus(500);
    }

    public function test_can_delete_supplier()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $supplier = Supplier::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/suppliers/{$supplier->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('suppliers', ['id' => $supplier->id]);
    }

    public function test_requires_authentication()
    {
        $response = $this->getJson('/api/suppliers');
        $response->assertStatus(401);
    }
}
