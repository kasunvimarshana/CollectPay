<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\Rate;
use App\Models\Collection;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CollectionTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $token;
    protected $supplier;
    protected $product;
    protected $rate;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create admin role
        Role::factory()->create([
            'name' => 'Admin',
            'display_name' => 'Administrator',
            'permissions' => json_encode(['*']),
        ]);

        // Create authenticated user
        $this->user = User::factory()->create();
        $this->token = auth('api')->login($this->user);

        // Create test data
        $this->supplier = Supplier::factory()->create();
        $this->product = Product::factory()->create([
            'units' => json_encode(['kg', 'g']),
            'base_unit' => 'kg',
        ]);
        $this->rate = Rate::factory()->create([
            'product_id' => $this->product->id,
            'rate' => 250.00,
            'unit' => 'kg',
            'effective_from' => now()->subDays(1),
            'effective_until' => null,
        ]);
    }

    // Using parent TestCase::authenticatedHeaders() method with $this->user parameter

    public function test_can_create_collection(): void
    {
        $data = [
            'supplier_id' => $this->supplier->id,
            'product_id' => $this->product->id,
            'rate_id' => $this->rate->id,
            'quantity' => 50.5,
            'unit' => 'kg',
            'collection_date' => now()->toDateString(),
            'notes' => 'Daily collection',
        ];

        $response = $this->withHeaders($this->authenticatedHeaders($this->user))
            ->postJson('/api/collections', $data);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'supplier_id',
                'product_id',
                'rate_id',
                'quantity',
                'unit',
                'amount',
            ]);

        // Verify amount calculation: 50.5 * 250 = 12,625
        $response->assertJson([
            'quantity' => 50.5,
            'amount' => 12625.00,
        ]);

        $this->assertDatabaseHas('collections', [
            'supplier_id' => $this->supplier->id,
            'product_id' => $this->product->id,
            'quantity' => 50.5,
        ]);
    }

    public function test_collection_amount_is_calculated_correctly(): void
    {
        $data = [
            'supplier_id' => $this->supplier->id,
            'product_id' => $this->product->id,
            'rate_id' => $this->rate->id,
            'quantity' => 100,
            'unit' => 'kg',
            'collection_date' => now()->toDateString(),
        ];

        $response = $this->withHeaders($this->authenticatedHeaders($this->user))
            ->postJson('/api/collections', $data);

        $response->assertStatus(201);

        // Amount should be: 100 * 250 = 25,000
        $response->assertJson([
            'amount' => 25000.00,
        ]);
    }

    public function test_can_list_collections(): void
    {
        Collection::factory()->count(3)->create([
            'supplier_id' => $this->supplier->id,
            'product_id' => $this->product->id,
            'rate_id' => $this->rate->id,
        ]);

        $response = $this->withHeaders($this->authenticatedHeaders($this->user))
            ->getJson('/api/collections');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'quantity', 'unit', 'amount'],
                ],
            ])
            ->assertJsonCount(3, 'data');
    }

    public function test_can_show_collection(): void
    {
        $collection = Collection::factory()->create([
            'supplier_id' => $this->supplier->id,
            'product_id' => $this->product->id,
            'rate_id' => $this->rate->id,
            'quantity' => 50,
        ]);

        $response = $this->withHeaders($this->authenticatedHeaders($this->user))
            ->getJson('/api/collections/' . $collection->id);

        $response->assertStatus(200)
            ->assertJson([
                'id' => $collection->id,
                'quantity' => 50,
            ]);
    }

    public function test_can_update_collection(): void
    {
        $collection = Collection::factory()->create([
            'supplier_id' => $this->supplier->id,
            'product_id' => $this->product->id,
            'rate_id' => $this->rate->id,
            'quantity' => 50,
        ]);

        $data = [
            'supplier_id' => $this->supplier->id,
            'product_id' => $this->product->id,
            'rate_id' => $this->rate->id,
            'quantity' => 75,
            'unit' => 'kg',
            'collection_date' => now()->toDateString(),
            'version' => $collection->version,
        ];

        $response = $this->withHeaders($this->authenticatedHeaders($this->user))
            ->putJson('/api/collections/' . $collection->id, $data);

        $response->assertStatus(200)
            ->assertJson([
                'quantity' => 75,
            ]);

        $this->assertDatabaseHas('collections', [
            'id' => $collection->id,
            'quantity' => 75,
        ]);
    }

    public function test_can_delete_collection(): void
    {
        $collection = Collection::factory()->create([
            'supplier_id' => $this->supplier->id,
            'product_id' => $this->product->id,
            'rate_id' => $this->rate->id,
        ]);

        $response = $this->withHeaders($this->authenticatedHeaders($this->user))
            ->deleteJson('/api/collections/' . $collection->id);

        $response->assertStatus(204);

        $this->assertSoftDeleted('collections', [
            'id' => $collection->id,
        ]);
    }

    public function test_collection_validation_requires_required_fields(): void
    {
        $response = $this->withHeaders($this->authenticatedHeaders($this->user))
            ->postJson('/api/collections', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'supplier_id',
                'product_id',
                'rate_id',
                'quantity',
                'unit',
                'collection_date',
            ]);
    }

    public function test_collection_quantity_must_be_positive(): void
    {
        $data = [
            'supplier_id' => $this->supplier->id,
            'product_id' => $this->product->id,
            'rate_id' => $this->rate->id,
            'quantity' => -10,
            'unit' => 'kg',
            'collection_date' => now()->toDateString(),
        ];

        $response = $this->withHeaders($this->authenticatedHeaders($this->user))
            ->postJson('/api/collections', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['quantity']);
    }

    public function test_unauthenticated_user_cannot_access_collections(): void
    {
        $response = $this->getJson('/api/collections');

        $response->assertStatus(401);
    }
}
