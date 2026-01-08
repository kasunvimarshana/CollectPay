<?php

namespace Tests\Feature;

use App\Models\Collection;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Rate;
use App\Models\Role;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

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
            'rate_applied' => $this->rate->rate,
            'total_amount' => 50.5 * $this->rate->rate, // 50.5 * 250 = 12625
        ]);
    }

    // Using parent TestCase::authenticatedHeaders() method with $this->user parameter

    public function test_can_create_advance_payment(): void
    {
        $data = [
            'supplier_id' => $this->supplier->id,
            'amount' => 5000.00,
            'type' => 'advance',
            'payment_date' => now()->toDateString(),
            'reference' => 'ADV-001',
            'notes' => 'Advance payment',
        ];

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->postJson('/api/payments', $data);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'supplier_id',
                    'amount',
                    'type',
                    'payment_date',
                ],
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'amount' => 5000.00,
                    'type' => 'advance',
                ],
            ]);

        $this->assertDatabaseHas('payments', [
            'supplier_id' => $this->supplier->id,
            'amount' => 5000.00,
            'type' => 'advance',
        ]);
    }

    public function test_can_create_partial_payment(): void
    {
        $data = [
            'supplier_id' => $this->supplier->id,
            'amount' => 7000.00,
            'type' => 'partial',
            'payment_date' => now()->toDateString(),
            'reference' => 'PART-001',
        ];

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->postJson('/api/payments', $data);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'type' => 'partial',
                    'amount' => 7000.00,
                ],
            ]);
    }

    public function test_can_create_full_payment(): void
    {
        $data = [
            'supplier_id' => $this->supplier->id,
            'amount' => 12625.00,
            'type' => 'full',
            'payment_date' => now()->toDateString(),
            'reference' => 'FULL-001',
        ];

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->postJson('/api/payments', $data);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'type' => 'full',
                    'amount' => 12625.00,
                ],
            ]);
    }

    public function test_can_list_payments(): void
    {
        Payment::factory()->count(3)->create([
            'supplier_id' => $this->supplier->id,
        ]);

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->getJson('/api/payments');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => ['id', 'amount', 'type', 'payment_date'],
                    ],
                ],
            ])
            ->assertJsonCount(3, 'data.data');
    }

    public function test_can_show_payment(): void
    {
        $payment = Payment::factory()->create([
            'supplier_id' => $this->supplier->id,
            'amount' => 5000.00,
        ]);

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->getJson('/api/payments/'.$payment->id);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $payment->id,
                    'amount' => 5000.00,
                ],
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
            'type' => 'advance',
            'payment_date' => now()->toDateString(),
            'version' => $payment->version,
        ];

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->putJson('/api/payments/'.$payment->id, $data);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'amount' => 6000.00,
                ],
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

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->deleteJson('/api/payments/'.$payment->id);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Payment deleted successfully',
            ]);

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
            'type' => 'advance',
        ]);

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->getJson('/api/suppliers/'.$this->supplier->id.'/balance');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_collected' => 12625.00,
                    'total_paid' => 5000.00,
                    'balance' => 7625.00, // 12,625 - 5,000
                ],
            ]);
    }

    public function test_payment_validation_requires_required_fields(): void
    {
        $response = $this->withHeaders($this->authenticatedHeaders())
            ->postJson('/api/payments', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'supplier_id',
                'amount',
                'type',
                'payment_date',
            ]);
    }

    public function test_payment_amount_must_be_positive(): void
    {
        $data = [
            'supplier_id' => $this->supplier->id,
            'amount' => -1000,
            'type' => 'advance',
            'payment_date' => now()->toDateString(),
        ];

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->postJson('/api/payments', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['amount']);
    }

    public function test_payment_type_must_be_valid(): void
    {
        $data = [
            'supplier_id' => $this->supplier->id,
            'amount' => 1000,
            'type' => 'invalid_type',
            'payment_date' => now()->toDateString(),
        ];

        $response = $this->withHeaders($this->authenticatedHeaders())
            ->postJson('/api/payments', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type']);
    }

    public function test_unauthenticated_user_cannot_access_payments(): void
    {
        $response = $this->getJson('/api/payments');

        $response->assertStatus(401);
    }
}
