<?php

namespace Tests\Feature;

use App\Models\Collection;
use App\Models\Product;
use App\Models\Rate;
use App\Models\Role;
use App\Models\Supplier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RateUpdateCollectionTest extends TestCase
{
    use RefreshDatabase;

    protected $supplier;

    protected $product;

    protected $rate;

    protected function setUp(): void
    {
        parent::setUp();

        Role::factory()->create([
            'name' => 'Admin',
            'display_name' => 'Administrator',
            'permissions' => json_encode(['*']),
        ]);

        $this->supplier = Supplier::factory()->create();
        $this->product = Product::factory()->create([
            'supported_units' => json_encode(['kg']),
            'base_unit' => 'kg',
        ]);
        $this->rate = Rate::factory()->create([
            'product_id' => $this->product->id,
            'rate' => 200.00,
            'unit' => 'kg',
            'effective_from' => now()->subDays(10),
            'effective_to' => null,
        ]);
    }

    public function test_updating_rate_value_recalculates_non_finalized_collections(): void
    {
        $collection = Collection::factory()->create([
            'supplier_id' => $this->supplier->id,
            'product_id' => $this->product->id,
            'rate_id' => $this->rate->id,
            'quantity' => 10.0,
            'unit' => 'kg',
            'rate_applied' => 200.00,
            'total_amount' => 2000.00,
            'is_finalized' => false,
        ]);

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->putJson('/api/rates/'.$this->rate->id, ['rate' => 250.00]);

        $response->assertStatus(200);

        $collection->refresh();
        $this->assertEquals('250.00', $collection->rate_applied);
        $this->assertEquals('2500.00', $collection->total_amount);
    }

    public function test_updating_rate_value_does_not_recalculate_finalized_collections(): void
    {
        $finalized = Collection::factory()->create([
            'supplier_id' => $this->supplier->id,
            'product_id' => $this->product->id,
            'rate_id' => $this->rate->id,
            'quantity' => 10.0,
            'unit' => 'kg',
            'rate_applied' => 200.00,
            'total_amount' => 2000.00,
            'is_finalized' => true,
        ]);

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->putJson('/api/rates/'.$this->rate->id, ['rate' => 300.00]);

        $response->assertStatus(200);

        $finalized->refresh();
        $this->assertEquals('200.00', $finalized->rate_applied);
        $this->assertEquals('2000.00', $finalized->total_amount);
    }

    public function test_updating_rate_only_affects_collections_linked_to_that_rate(): void
    {
        $otherRate = Rate::factory()->create([
            'product_id' => $this->product->id,
            'rate' => 100.00,
            'unit' => 'kg',
            'effective_from' => now()->subDays(20),
            'effective_to' => now()->subDays(11),
        ]);

        $linkedCollection = Collection::factory()->create([
            'supplier_id' => $this->supplier->id,
            'product_id' => $this->product->id,
            'rate_id' => $this->rate->id,
            'quantity' => 5.0,
            'unit' => 'kg',
            'rate_applied' => 200.00,
            'total_amount' => 1000.00,
            'is_finalized' => false,
        ]);

        $unlinkedCollection = Collection::factory()->create([
            'supplier_id' => $this->supplier->id,
            'product_id' => $this->product->id,
            'rate_id' => $otherRate->id,
            'quantity' => 5.0,
            'unit' => 'kg',
            'rate_applied' => 100.00,
            'total_amount' => 500.00,
            'is_finalized' => false,
        ]);

        $this->withHeaders($this->authenticatedHeaders())
            ->putJson('/api/rates/'.$this->rate->id, ['rate' => 220.00]);

        $linkedCollection->refresh();
        $unlinkedCollection->refresh();

        $this->assertEquals('220.00', $linkedCollection->rate_applied);
        $this->assertEquals('1100.00', $linkedCollection->total_amount);

        // Unlinked collection must remain unchanged
        $this->assertEquals('100.00', $unlinkedCollection->rate_applied);
        $this->assertEquals('500.00', $unlinkedCollection->total_amount);
    }

    public function test_updating_non_rate_field_does_not_recalculate_collections(): void
    {
        $collection = Collection::factory()->create([
            'supplier_id' => $this->supplier->id,
            'product_id' => $this->product->id,
            'rate_id' => $this->rate->id,
            'quantity' => 10.0,
            'unit' => 'kg',
            'rate_applied' => 200.00,
            'total_amount' => 2000.00,
            'is_finalized' => false,
        ]);

        // Update only effective_to, not the rate value
        $this->withHeaders($this->authenticatedHeaders())
            ->putJson('/api/rates/'.$this->rate->id, [
                'effective_to' => now()->addDays(30)->toDateString(),
            ]);

        $collection->refresh();
        $this->assertEquals('200.00', $collection->rate_applied);
        $this->assertEquals('2000.00', $collection->total_amount);
    }

    public function test_collection_version_incremented_on_rate_recalculation(): void
    {
        $collection = Collection::factory()->create([
            'supplier_id' => $this->supplier->id,
            'product_id' => $this->product->id,
            'rate_id' => $this->rate->id,
            'quantity' => 10.0,
            'unit' => 'kg',
            'rate_applied' => 200.00,
            'total_amount' => 2000.00,
            'is_finalized' => false,
            'version' => 1,
        ]);

        $this->withHeaders($this->authenticatedHeaders())
            ->putJson('/api/rates/'.$this->rate->id, ['rate' => 250.00]);

        $collection->refresh();
        $this->assertEquals(2, $collection->version);
    }
}
