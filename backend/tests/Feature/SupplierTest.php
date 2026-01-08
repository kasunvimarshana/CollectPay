<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Supplier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupplierTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin role
        Role::factory()->create([
            'name' => 'Admin',
            'display_name' => 'Administrator',
            'permissions' => json_encode(['*']),
        ]);
    }

    // Using parent TestCase::authenticatedHeaders() method to get auth headers

    public function test_can_create_supplier(): void
    {
        $data = [
            'name' => 'Test Supplier',
            'code' => 'SUP001',
            'contact_person' => 'John Doe',
            'phone' => '1234567890',
            'email' => 'supplier@example.com',
            'address' => '123 Test Street',
        ];

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->postJson('/api/suppliers', $data);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'name',
                    'code',
                    'contact_person',
                    'phone',
                    'email',
                    'address',
                ],
            ]);

        $this->assertDatabaseHas('suppliers', [
            'name' => 'Test Supplier',
            'code' => 'SUP001',
        ]);
    }

    public function test_can_list_suppliers(): void
    {
        Supplier::factory()->count(3)->create();

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->getJson('/api/suppliers');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => ['id', 'name', 'code'],
                    ],
                ],
            ]);
    }

    public function test_can_show_supplier(): void
    {
        $supplier = Supplier::factory()->create([
            'name' => 'Test Supplier',
            'code' => 'SUP001',
        ]);

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->getJson('/api/suppliers/'.$supplier->id);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $supplier->id,
                    'name' => 'Test Supplier',
                    'code' => 'SUP001',
                ],
            ]);
    }

    public function test_can_update_supplier(): void
    {
        $supplier = Supplier::factory()->create([
            'name' => 'Old Name',
            'code' => 'SUP001',
        ]);

        $data = [
            'name' => 'Updated Name',
            'code' => 'SUP001',
            'version' => $supplier->version,
        ];

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->putJson('/api/suppliers/'.$supplier->id, $data);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Supplier updated successfully',
                'data' => [
                    'name' => 'Updated Name',
                ],
            ]);

        $this->assertDatabaseHas('suppliers', [
            'id' => $supplier->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_can_delete_supplier(): void
    {
        $supplier = Supplier::factory()->create();

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->deleteJson('/api/suppliers/'.$supplier->id);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Supplier deleted successfully',
            ]);

        $this->assertSoftDeleted('suppliers', [
            'id' => $supplier->id,
        ]);
    }

    public function test_supplier_balance_is_calculated_correctly(): void
    {
        $supplier = Supplier::factory()->create();

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->getJson('/api/suppliers/'.$supplier->id.'/balance');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'supplier',
                    'total_collected',
                    'total_paid',
                    'balance',
                    'period',
                ],
            ]);
    }

    public function test_can_get_supplier_collections(): void
    {
        $supplier = Supplier::factory()->create();

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->getJson('/api/suppliers/'.$supplier->id.'/collections');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_can_get_supplier_payments(): void
    {
        $supplier = Supplier::factory()->create();

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->getJson('/api/suppliers/'.$supplier->id.'/payments');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_cannot_create_supplier_with_duplicate_code(): void
    {
        Supplier::factory()->create(['code' => 'SUP001']);

        $data = [
            'name' => 'Another Supplier',
            'code' => 'SUP001',
        ];

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->postJson('/api/suppliers', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    public function test_version_conflict_is_detected_on_update(): void
    {
        $supplier = Supplier::factory()->create([
            'name' => 'Original Name',
            'version' => 1,
        ]);

        // Simulate another update that increments version
        $supplier->update(['version' => 2]);

        $data = [
            'name' => 'Conflicting Update',
            'code' => $supplier->code,
            'version' => 1, // Old version
        ];

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->putJson('/api/suppliers/'.$supplier->id, $data);

        $response->assertStatus(409); // Conflict
    }

    public function test_unauthenticated_user_cannot_access_suppliers(): void
    {
        $response = $this->getJson('/api/suppliers');

        $response->assertStatus(401);
    }
}
