<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Supplier;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentApiTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticate()
    {
        $user = User::factory()->create(['role' => 'manager']);
        return $this->actingAs($user, 'sanctum');
    }

    /** @test */
    public function it_can_list_payments()
    {
        $this->authenticate();
        Payment::factory()->count(3)->create();

        $response = $this->getJson('/api/payments');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    /** @test */
    public function it_can_create_a_payment()
    {
        $this->authenticate();
        $supplier = Supplier::factory()->create();

        $paymentData = [
            'supplier_id' => $supplier->id,
            'amount' => 500.00,
            'payment_date' => now()->toDateString(),
            'payment_type' => 'advance',
            'reference_number' => 'PAY-001',
            'notes' => 'Advance payment'
        ];

        $response = $this->postJson('/api/payments', $paymentData);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'amount' => '500.00',
                'payment_type' => 'advance'
            ]);

        $this->assertDatabaseHas('payments', [
            'supplier_id' => $supplier->id,
            'amount' => 500.00,
            'payment_type' => 'advance'
        ]);
    }

    /** @test */
    public function it_validates_required_fields_on_create()
    {
        $this->authenticate();

        $response = $this->postJson('/api/payments', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['supplier_id', 'amount', 'payment_date', 'payment_type']);
    }

    /** @test */
    public function it_validates_payment_type()
    {
        $this->authenticate();
        $supplier = Supplier::factory()->create();

        $paymentData = [
            'supplier_id' => $supplier->id,
            'amount' => 500.00,
            'payment_date' => now()->toDateString(),
            'payment_type' => 'invalid_type'
        ];

        $response = $this->postJson('/api/payments', $paymentData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['payment_type']);
    }

    /** @test */
    public function it_can_show_a_payment()
    {
        $this->authenticate();
        $payment = Payment::factory()->create();

        $response = $this->getJson("/api/payments/{$payment->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'payment' => [
                    'id',
                    'amount',
                    'payment_type',
                    'supplier'
                ]
            ]);
    }

    /** @test */
    public function it_can_update_a_payment()
    {
        $this->authenticate();
        $payment = Payment::factory()->create([
            'amount' => 500,
            'notes' => 'Original note'
        ]);

        $updateData = [
            'notes' => 'Updated note',
            'version' => $payment->version
        ];

        $response = $this->putJson("/api/payments/{$payment->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment(['notes' => 'Updated note']);

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'notes' => 'Updated note'
        ]);
    }

    /** @test */
    public function it_can_delete_a_payment()
    {
        $this->authenticate();
        $payment = Payment::factory()->create();

        $response = $this->deleteJson("/api/payments/{$payment->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('payments', ['id' => $payment->id]);
    }

    /** @test */
    public function it_requires_authentication()
    {
        $response = $this->getJson('/api/payments');

        $response->assertStatus(401);
    }

    /** @test */
    public function it_tracks_user_who_created_payment()
    {
        $user = User::factory()->create(['role' => 'manager']);
        $this->actingAs($user, 'sanctum');
        
        $supplier = Supplier::factory()->create();

        $paymentData = [
            'supplier_id' => $supplier->id,
            'amount' => 500.00,
            'payment_date' => now()->toDateString(),
            'payment_type' => 'partial'
        ];

        $response = $this->postJson('/api/payments', $paymentData);

        $response->assertStatus(201);

        $this->assertDatabaseHas('payments', [
            'supplier_id' => $supplier->id,
            'user_id' => $user->id
        ]);
    }
}
