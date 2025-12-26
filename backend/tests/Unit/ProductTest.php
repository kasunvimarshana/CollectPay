<?php

namespace Tests\Unit;

use App\Models\Product;
use App\Models\ProductRate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_create_a_product()
    {
        $product = Product::create([
            'name' => 'Test Product',
            'code' => 'PROD001',
            'description' => 'A test product',
            'unit' => 'kg',
            'is_active' => true
        ]);

        $this->assertDatabaseHas('products', [
            'name' => 'Test Product',
            'code' => 'PROD001',
            'unit' => 'kg'
        ]);
        $this->assertEquals('Test Product', $product->name);
        $this->assertTrue($product->is_active);
    }

    /** @test */
    public function it_has_rates()
    {
        $product = Product::factory()->create();
        
        $this->assertInstanceOf(
            'Illuminate\Database\Eloquent\Relations\HasMany',
            $product->rates()
        );
    }

    /** @test */
    public function it_gets_current_rate()
    {
        $product = Product::factory()->create(['unit' => 'kg']);
        
        // Create a current rate
        ProductRate::create([
            'product_id' => $product->id,
            'rate' => 10.50,
            'unit' => 'kg',
            'effective_from' => now()->subDays(10),
            'effective_to' => null,
            'is_active' => true
        ]);

        $currentRate = $product->getCurrentRate('kg');
        
        $this->assertNotNull($currentRate);
        $this->assertEquals(10.50, $currentRate->rate);
    }

    /** @test */
    public function it_returns_null_for_non_existent_current_rate()
    {
        $product = Product::factory()->create(['unit' => 'kg']);
        
        $currentRate = $product->getCurrentRate('kg');
        
        $this->assertNull($currentRate);
    }

    /** @test */
    public function it_soft_deletes()
    {
        $product = Product::factory()->create();
        $productId = $product->id;

        $product->delete();

        $this->assertSoftDeleted('products', ['id' => $productId]);
    }

    /** @test */
    public function it_has_version_field()
    {
        $product = Product::factory()->create();
        
        $this->assertEquals(0, $product->version);
        
        $product->increment('version');
        $product->refresh();
        
        $this->assertEquals(1, $product->version);
    }
}
