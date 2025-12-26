<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Supplier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupplierApiTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticate()
    {
        $user = User::factory()->create(['role' => 'admin']);
        return $this->actingAs($user, 'sanctum');
    }

    /** @test */
    public function it_can_list_suppliers()
    {
        $this->authenticate();
        Supplier::factory()->count(3)->create();

        $response = $this->getJson('/api/suppliers');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    /** @test */
    public function it_can_create_a_supplier()
    {
        $this->authenticate();

        $supplierData = [
            'name' => 'New Supplier',
            'code' => 'SUP123',
            'phone' => '1234567890',
            'email' => 'new@supplier.com',
            'address' => '123 Main St',
            'location' => 'City',
            'is_active' => true
        ];

        $response = $this->postJson('/api/suppliers', $supplierData);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'New Supplier']);

        $this->assertDatabaseHas('suppliers', [
            'name' => 'New Supplier',
            'code' => 'SUP123'
        ]);
    }

    /** @test */
    public function it_validates_required_fields_on_create()
    {
        $this->authenticate();

        $response = $this->postJson('/api/suppliers', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'code']);
    }

    /** @test */
    public function it_can_show_a_supplier()
    {
        $this->authenticate();
        $supplier = Supplier::factory()->create();

        $response = $this->getJson("/api/suppliers/{$supplier->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => $supplier->name]);
    }

    /** @test */
    public function it_can_update_a_supplier()
    {
        $this->authenticate();
        $supplier = Supplier::factory()->create();

        $updateData = [
            'name' => 'Updated Supplier',
            'version' => $supplier->version
        ];

        $response = $this->putJson("/api/suppliers/{$supplier->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Updated Supplier']);

        $this->assertDatabaseHas('suppliers', [
            'id' => $supplier->id,
            'name' => 'Updated Supplier'
        ]);
    }

    /** @test */
    public function it_detects_version_conflicts_on_update()
    {
        $this->authenticate();
        $supplier = Supplier::factory()->create(['version' => 1]);

        $updateData = [
            'name' => 'Updated Supplier',
            'version' => 0 // Wrong version
        ];

        $response = $this->putJson("/api/suppliers/{$supplier->id}", $updateData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['version']);
    }

    /** @test */
    public function it_can_delete_a_supplier()
    {
        $this->authenticate();
        $supplier = Supplier::factory()->create();

        $response = $this->deleteJson("/api/suppliers/{$supplier->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('suppliers', ['id' => $supplier->id]);
    }

    /** @test */
    public function it_requires_authentication()
    {
        $response = $this->getJson('/api/suppliers');

        $response->assertStatus(401);
    }

    /** @test */
    public function it_can_search_suppliers()
    {
        $this->authenticate();
        Supplier::factory()->create(['name' => 'ABC Supplier']);
        Supplier::factory()->create(['name' => 'XYZ Supplier']);

        $response = $this->getJson('/api/suppliers?search=ABC');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment(['name' => 'ABC Supplier']);
    }
}
