<?php

namespace Tests\Feature;

use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupplierTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $collector;
    protected User $viewer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $this->collector = User::factory()->create(['role' => 'collector', 'is_active' => true]);
        $this->viewer = User::factory()->create(['role' => 'viewer', 'is_active' => true]);
    }

    public function test_admin_can_list_all_suppliers(): void
    {
        Supplier::factory()->count(3)->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/suppliers');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => ['id', 'name', 'email', 'phone', 'status'],
                    ],
                ],
            ]);
    }

    public function test_collector_can_create_supplier(): void
    {
        $response = $this->actingAs($this->collector, 'sanctum')
            ->postJson('/api/v1/suppliers', [
                'name' => 'Test Supplier',
                'contact_person' => 'John Doe',
                'phone' => '1234567890',
                'email' => 'supplier@test.com',
                'address' => '123 Test St',
                'status' => 'active',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => ['id', 'name', 'email'],
                'message',
            ]);

        $this->assertDatabaseHas('suppliers', [
            'name' => 'Test Supplier',
            'created_by' => $this->collector->id,
        ]);
    }

    public function test_viewer_cannot_create_supplier(): void
    {
        $response = $this->actingAs($this->viewer, 'sanctum')
            ->postJson('/api/v1/suppliers', [
                'name' => 'Test Supplier',
                'email' => 'supplier@test.com',
            ]);

        $response->assertStatus(403); // Forbidden
    }

    public function test_admin_can_update_any_supplier(): void
    {
        $supplier = Supplier::factory()->create([
            'created_by' => $this->collector->id,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/suppliers/{$supplier->id}", [
                'name' => 'Updated Supplier Name',
                'email' => $supplier->email,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('suppliers', [
            'id' => $supplier->id,
            'name' => 'Updated Supplier Name',
        ]);
    }

    public function test_collector_can_update_own_supplier(): void
    {
        $supplier = Supplier::factory()->create([
            'created_by' => $this->collector->id,
        ]);

        $response = $this->actingAs($this->collector, 'sanctum')
            ->putJson("/api/v1/suppliers/{$supplier->id}", [
                'name' => 'Updated Name',
                'email' => $supplier->email,
            ]);

        $response->assertStatus(200);
    }

    public function test_collector_cannot_update_others_supplier(): void
    {
        $otherCollector = User::factory()->create(['role' => 'collector']);
        $supplier = Supplier::factory()->create([
            'created_by' => $otherCollector->id,
        ]);

        $response = $this->actingAs($this->collector, 'sanctum')
            ->putJson("/api/v1/suppliers/{$supplier->id}", [
                'name' => 'Updated Name',
                'email' => $supplier->email,
            ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_delete_supplier(): void
    {
        $supplier = Supplier::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/suppliers/{$supplier->id}");

        $response->assertStatus(200);

        $this->assertSoftDeleted('suppliers', [
            'id' => $supplier->id,
        ]);
    }

    public function test_collector_cannot_delete_supplier(): void
    {
        $supplier = Supplier::factory()->create([
            'created_by' => $this->collector->id,
        ]);

        $response = $this->actingAs($this->collector, 'sanctum')
            ->deleteJson("/api/v1/suppliers/{$supplier->id}");

        $response->assertStatus(403);
    }

    public function test_supplier_search_works(): void
    {
        Supplier::factory()->create(['name' => 'ABC Company']);
        Supplier::factory()->create(['name' => 'XYZ Corporation']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/suppliers?search=ABC');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.data');
    }

    public function test_guest_cannot_access_suppliers(): void
    {
        $response = $this->getJson('/api/v1/suppliers');

        $response->assertStatus(401); // Unauthorized
    }
}
