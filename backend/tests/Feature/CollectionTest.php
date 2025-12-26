<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\ProductRate;
use App\Models\Collection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CollectionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_can_create_collection_with_automatic_rate_application()
    {
        $user = User::factory()->create(['role' => 'collector']);
        $supplier = Supplier::factory()->create();
        $product = Product::factory()->create();
        
        $rate = ProductRate::factory()->create([
            'product_id' => $product->id,
            'unit' => 'kg',
            'rate' => 120.00,
            'effective_date' => now()->subDays(5),
            'is_active' => true,
        ]);

        $collectionData = [
            'supplier_id' => $supplier->id,
            'product_id' => $product->id,
            'collection_date' => now()->format('Y-m-d'),
            'quantity' => 50.5,
            'unit' => 'kg',
            'notes' => 'Test collection',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/collections', $collectionData);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'quantity' => 50.5,
                'rate_applied' => 120.00,
                'total_amount' => 6060.00, // 50.5 * 120
            ]);

        $this->assertDatabaseHas('collections', [
            'supplier_id' => $supplier->id,
            'product_id' => $product->id,
            'quantity' => 50.5,
            'rate_applied' => 120.00,
        ]);
    }

    public function test_collection_fails_without_valid_rate()
    {
        $user = User::factory()->create(['role' => 'collector']);
        $supplier = Supplier::factory()->create();
        $product = Product::factory()->create();

        $collectionData = [
            'supplier_id' => $supplier->id,
            'product_id' => $product->id,
            'collection_date' => now()->format('Y-m-d'),
            'quantity' => 50.5,
            'unit' => 'kg',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/collections', $collectionData);

        $response->assertStatus(500);
    }

    public function test_can_list_collections_with_filters()
    {
        $user = User::factory()->create(['role' => 'collector']);
        $supplier1 = Supplier::factory()->create();
        $supplier2 = Supplier::factory()->create();
        $product = Product::factory()->create();
        
        Collection::factory()->create(['supplier_id' => $supplier1->id, 'product_id' => $product->id]);
        Collection::factory()->create(['supplier_id' => $supplier2->id, 'product_id' => $product->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/collections?supplier_id={$supplier1->id}");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_can_update_collection_recalculates_amount()
    {
        $user = User::factory()->create(['role' => 'collector']);
        $collection = Collection::factory()->create([
            'quantity' => 50.0,
            'rate_applied' => 100.00,
            'total_amount' => 5000.00,
            'version' => 1,
        ]);

        $updateData = [
            'quantity' => 60.0,
            'version' => 1,
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/collections/{$collection->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'quantity' => 60.0,
                'total_amount' => 6000.00, // 60 * 100
            ]);
    }
}
