<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\ProductRate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticate()
    {
        $user = User::factory()->create(['role' => 'manager']);
        return $this->actingAs($user, 'sanctum');
    }

    /** @test */
    public function it_can_list_products()
    {
        $this->authenticate();
        Product::factory()->count(3)->create();

        $response = $this->getJson('/api/products');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    /** @test */
    public function it_can_create_a_product_with_initial_rate()
    {
        $this->authenticate();

        $productData = [
            'name' => 'New Product',
            'code' => 'PROD123',
            'description' => 'A test product',
            'unit' => 'kg',
            'is_active' => true,
            'rate' => 15.50,
            'rate_effective_from' => now()->toDateString()
        ];

        $response = $this->postJson('/api/products', $productData);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'New Product']);

        $this->assertDatabaseHas('products', [
            'name' => 'New Product',
            'code' => 'PROD123'
        ]);

        $this->assertDatabaseHas('product_rates', [
            'rate' => 15.50,
            'unit' => 'kg'
        ]);
    }

    /** @test */
    public function it_validates_required_fields_on_create()
    {
        $this->authenticate();

        $response = $this->postJson('/api/products', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'code', 'unit']);
    }

    /** @test */
    public function it_can_show_a_product_with_rates()
    {
        $this->authenticate();
        $product = Product::factory()->create();
        ProductRate::factory()->create(['product_id' => $product->id]);

        $response = $this->getJson("/api/products/{$product->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'product' => [
                    'id',
                    'name',
                    'rates'
                ]
            ]);
    }

    /** @test */
    public function it_can_update_a_product()
    {
        $this->authenticate();
        $product = Product::factory()->create();

        $updateData = [
            'name' => 'Updated Product',
            'version' => $product->version
        ];

        $response = $this->putJson("/api/products/{$product->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Updated Product']);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Product'
        ]);
    }

    /** @test */
    public function it_can_delete_a_product()
    {
        $this->authenticate();
        $product = Product::factory()->create();

        $response = $this->deleteJson("/api/products/{$product->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('products', ['id' => $product->id]);
    }

    /** @test */
    public function it_can_add_a_new_rate_to_product()
    {
        $this->authenticate();
        $product = Product::factory()->create(['unit' => 'kg']);

        // Create initial rate
        ProductRate::create([
            'product_id' => $product->id,
            'rate' => 10.00,
            'unit' => 'kg',
            'effective_from' => now()->subDays(30),
            'is_active' => true
        ]);

        // Add new rate
        $newRateData = [
            'rate' => 12.00,
            'unit' => 'kg',
            'effective_from' => now()->toDateString()
        ];

        $response = $this->postJson("/api/products/{$product->id}/rates", $newRateData);

        $response->assertStatus(201)
            ->assertJsonFragment(['rate' => '12.00']);

        // Verify old rate was deactivated
        $this->assertDatabaseHas('product_rates', [
            'product_id' => $product->id,
            'rate' => 10.00,
            'is_active' => false
        ]);

        // Verify new rate is active
        $this->assertDatabaseHas('product_rates', [
            'product_id' => $product->id,
            'rate' => 12.00,
            'is_active' => true
        ]);
    }

    /** @test */
    public function it_requires_authentication()
    {
        $response = $this->getJson('/api/products');

        $response->assertStatus(401);
    }

    /** @test */
    public function it_can_search_products()
    {
        $this->authenticate();
        Product::factory()->create(['name' => 'Tea Leaves']);
        Product::factory()->create(['name' => 'Coffee Beans']);

        $response = $this->getJson('/api/products?search=Tea');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment(['name' => 'Tea Leaves']);
    }
}
