<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\ProductRate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_can_list_products()
    {
        $user = User::factory()->create(['role' => 'admin']);
        Product::factory()->count(3)->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'code', 'default_unit', 'is_active']
                ]
            ]);
    }

    public function test_can_create_product()
    {
        $user = User::factory()->create(['role' => 'admin']);

        $productData = [
            'name' => 'Test Product',
            'code' => 'PROD-TEST',
            'description' => 'Test description',
            'default_unit' => 'kg',
            'supported_units' => ['kg', 'g'],
            'is_active' => true,
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/products', $productData);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Test Product']);

        $this->assertDatabaseHas('products', ['code' => 'PROD-TEST']);
    }

    public function test_can_get_product_with_rates()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $product = Product::factory()->create();
        ProductRate::factory()->count(2)->create(['product_id' => $product->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/products/{$product->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'name',
                'code',
                'rates' => [
                    '*' => ['id', 'unit', 'rate', 'effective_date']
                ]
            ]);
    }

    public function test_product_can_get_current_rate()
    {
        $product = Product::factory()->create();
        
        // Old rate
        ProductRate::factory()->create([
            'product_id' => $product->id,
            'unit' => 'kg',
            'rate' => 100.00,
            'effective_date' => now()->subDays(30),
            'end_date' => now()->subDays(1),
            'is_active' => false,
        ]);

        // Current rate
        $currentRate = ProductRate::factory()->create([
            'product_id' => $product->id,
            'unit' => 'kg',
            'rate' => 120.00,
            'effective_date' => now()->subDays(5),
            'is_active' => true,
        ]);

        $rate = $product->getCurrentRate('kg');

        $this->assertNotNull($rate);
        $this->assertEquals(120.00, $rate->rate);
        $this->assertEquals($currentRate->id, $rate->id);
    }

    public function test_can_update_product_with_version_control()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $product = Product::factory()->create(['version' => 1]);

        $updateData = [
            'name' => 'Updated Product',
            'code' => $product->code,
            'default_unit' => 'kg',
            'version' => 1,
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/products/{$product->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Updated Product']);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Product',
            'version' => 2,
        ]);
    }
}
