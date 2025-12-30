<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\Rate;
use App\Models\Collection;
use App\Models\Payment;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $token;
    protected $supplier;
    protected $product;
    protected $rate;
    protected $collection;

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
        $this->product = Product::factory()->create();
        $this->rate = Rate::factory()->create([
            'product_id' => $this->product->id,
            'rate' => 250.00,
            'unit' => 'kg',
        ]);
        $this->collection = Collection::factory()->create([
            'supplier_id' => $this->supplier->id,
            'product_id' => $this->product->id,
            'rate_id' => $this->rate->id,
            'quantity' => 50.5,
            'amount' => 12625.00, // 50.5 * 250
        ]);
    }

    // Using parent TestCase::authenticatedHeaders() method with $this->user parameter

    public function test_can_create_advance_payment(): void
    {
        $data = [
            'supplier_id' => $this->supplier->id,
            'amount' => 5000.00,
            'payment_type' => 'advance',
            'payment_date' => now()->toDateString(),
            'reference' => 'ADV-001',
            'notes' => 'Advance payment',
        ];

        $response = $this->withHeaders($this->authenticatedHeaders($this->user))
            ->postJson('/api/payments', $data);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'supplier_id',
                'amount',
                'payment_type',
                'payment_date',
            ])
            ->assertJson([
                'amount' => 5000.00,
                'payment_type' => 'advance',
            ]);

        $this->assertDatabaseHas('payments', [
            'supplier_id' => $this->supplier->id,
            'amount' => 5000.00,
            'payment_type' => 'advance',
        ]);
    }

    public function test_can_create_partial_payment(): void
    {
        $data = [
            'supplier_id' => $this->supplier->id,
            'amount' => 7000.00,
            'payment_type' => 'partial',
            'payment_date' => now()->toDateString(),
            'reference' => 'PART-001',
        ];

        $response = $this->withHeaders($this->authenticatedHeaders($this->user))
            ->postJson('/api/payments', $data);

        $response->assertStatus(201)
            ->assertJson([
                'payment_type' => 'partial',
                'amount' => 7000.00,
            ]);
    }

    public function test_can_create_full_payment(): void
    {
        $data = [
            'supplier_id' => $this->supplier->id,
            'amount' => 12625.00,
            'payment_type' => 'full',
            'payment_date' => now()->toDateString(),
            'reference' => 'FULL-001',
        ];

        $response = $this->withHeaders($this->authenticatedHeaders($this->user))
            ->postJson('/api/payments', $data);

        $response->assertStatus(201)
            ->assertJson([
                'payment_type' => 'full',
                'amount' => 12625.00,
            ]);
    }

    public function test_can_list_payments(): void
    {
        Payment::factory()->count(3)->create([
            'supplier_id' => $this->supplier->id,
        ]);

        $response = $this->withHeaders($this->authenticatedHeaders($this->user))
            ->getJson('/api/payments');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'amount', 'payment_type', 'payment_date'],
                ],
            ])
            ->assertJsonCount(3, 'data');
    }

    public function test_can_show_payment(): void
    {
        $payment = Payment::factory()->create([
            'supplier_id' => $this->supplier->id,
            'amount' => 5000.00,
        ]);

        $response = $this->withHeaders($this->authenticatedHeaders($this->user))
            ->getJson('/api/payments/' . $payment->id);

        $response->assertStatus(200)
            ->assertJson([
                'id' => $payment->id,
                'amount' => 5000.00,
            ]);
    }

    public function test_can_update_payment(): void
    {
        $payment = Payment::factory()->create([
            'supplier_id' => $this->supplier->id,
            'amount' => 5000.00,
        ]);

        $data = [
            'supplier_id' => $this->supplier->id,
            'amount' => 6000.00,
            'payment_type' => 'advance',
            'payment_date' => now()->toDateString(),
            'version' => $payment->version,
        ];

        $response = $this->withHeaders($this->authenticatedHeaders($this->user))
            ->putJson('/api/payments/' . $payment->id, $data);

        $response->assertStatus(200)
            ->assertJson([
                'amount' => 6000.00,
            ]);

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'amount' => 6000.00,
        ]);
    }

    public function test_can_delete_payment(): void
    {
        $payment = Payment::factory()->create([
            'supplier_id' => $this->supplier->id,
        ]);

        $response = $this->withHeaders($this->authenticatedHeaders($this->user))
            ->deleteJson('/api/payments/' . $payment->id);

        $response->assertStatus(204);

        $this->assertSoftDeleted('payments', [
            'id' => $payment->id,
        ]);
    }

    public function test_supplier_balance_calculation_with_payments(): void
    {
        // Collection: 50.5 kg * 250 = 12,625
        // Already created in setUp

        // Payment: 5,000 (advance)
        Payment::factory()->create([
            'supplier_id' => $this->supplier->id,
            'amount' => 5000.00,
            'payment_type' => 'advance',
        ]);

        $response = $this->withHeaders($this->authenticatedHeaders($this->user))
            ->getJson('/api/suppliers/' . $this->supplier->id . '/balance');

        $response->assertStatus(200)
            ->assertJson([
                'total_collections' => 12625.00,
                'total_payments' => 5000.00,
                'balance' => 7625.00, // 12,625 - 5,000
            ]);
    }

    public function test_payment_validation_requires_required_fields(): void
    {
        $response = $this->withHeaders($this->authenticatedHeaders($this->user))
            ->postJson('/api/payments', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'supplier_id',
                'amount',
                'payment_type',
                'payment_date',
            ]);
    }

    public function test_payment_amount_must_be_positive(): void
    {
        $data = [
            'supplier_id' => $this->supplier->id,
            'amount' => -1000,
            'payment_type' => 'advance',
            'payment_date' => now()->toDateString(),
        ];

        $response = $this->withHeaders($this->authenticatedHeaders($this->user))
            ->postJson('/api/payments', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['amount']);
    }

    public function test_payment_type_must_be_valid(): void
    {
        $data = [
            'supplier_id' => $this->supplier->id,
            'amount' => 1000,
            'payment_type' => 'invalid_type',
            'payment_date' => now()->toDateString(),
        ];

        $response = $this->withHeaders($this->authenticatedHeaders($this->user))
            ->postJson('/api/payments', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['payment_type']);
    }

    public function test_unauthenticated_user_cannot_access_payments(): void
    {
        $response = $this->getJson('/api/payments');

        $response->assertStatus(401);
    }
}
