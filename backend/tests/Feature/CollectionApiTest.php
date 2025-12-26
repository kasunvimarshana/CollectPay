<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\ProductRate;
use App\Models\Collection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CollectionApiTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticate()
    {
        $user = User::factory()->create(['role' => 'collector']);
        return $this->actingAs($user, 'sanctum');
    }

    /** @test */
    public function it_can_list_collections()
    {
        $this->authenticate();
        Collection::factory()->count(3)->create();

        $response = $this->getJson('/api/collections');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    /** @test */
    public function it_can_create_a_collection_with_automatic_rate_application()
    {
        $this->authenticate();

        $supplier = Supplier::factory()->create();
        $product = Product::factory()->create(['unit' => 'kg']);
        $rate = ProductRate::factory()->create([
            'product_id' => $product->id,
            'rate' => 10.00,
            'unit' => 'kg',
            'effective_from' => now()->subDays(10),
            'effective_to' => null,
            'is_active' => true
        ]);

        $collectionData = [
            'supplier_id' => $supplier->id,
            'product_id' => $product->id,
            'collection_date' => now()->toDateString(),
            'quantity' => 50,
            'unit' => 'kg',
            'notes' => 'Test collection'
        ];

        $response = $this->postJson('/api/collections', $collectionData);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'quantity' => '50.000',
                'rate_applied' => '10.00',
                'total_amount' => '500.00' // 50 * 10
            ]);

        $this->assertDatabaseHas('collections', [
            'supplier_id' => $supplier->id,
            'product_id' => $product->id,
            'quantity' => 50,
            'rate_applied' => 10.00,
            'total_amount' => 500.00
        ]);
    }

    /** @test */
    public function it_rejects_collection_without_active_rate()
    {
        $this->authenticate();

        $supplier = Supplier::factory()->create();
        $product = Product::factory()->create(['unit' => 'kg']);
        // No active rate created

        $collectionData = [
            'supplier_id' => $supplier->id,
            'product_id' => $product->id,
            'collection_date' => now()->toDateString(),
            'quantity' => 50,
            'unit' => 'kg'
        ];

        $response = $this->postJson('/api/collections', $collectionData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['product_id']);
    }

    /** @test */
    public function it_can_update_a_collection()
    {
        $this->authenticate();
        $collection = Collection::factory()->create([
            'quantity' => 50,
            'rate_applied' => 10
        ]);

        $updateData = [
            'quantity' => 75,
            'version' => $collection->version
        ];

        $response = $this->putJson("/api/collections/{$collection->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'quantity' => '75.000',
                'total_amount' => '750.00' // 75 * 10
            ]);
    }

    /** @test */
    public function it_can_delete_a_collection()
    {
        $this->authenticate();
        $collection = Collection::factory()->create();

        $response = $this->deleteJson("/api/collections/{$collection->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('collections', ['id' => $collection->id]);
    }

    /** @test */
    public function it_can_filter_collections_by_supplier()
    {
        $this->authenticate();
        $supplier1 = Supplier::factory()->create();
        $supplier2 = Supplier::factory()->create();

        Collection::factory()->create(['supplier_id' => $supplier1->id]);
        Collection::factory()->create(['supplier_id' => $supplier1->id]);
        Collection::factory()->create(['supplier_id' => $supplier2->id]);

        $response = $this->getJson("/api/collections?supplier_id={$supplier1->id}");

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    /** @test */
    public function it_requires_authentication()
    {
        $response = $this->getJson('/api/collections');

        $response->assertStatus(401);
    }
}
