<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Supplier;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_can_create_payment()
    {
        $user = User::factory()->create(['role' => 'finance']);
        $supplier = Supplier::factory()->create();

        $paymentData = [
            'supplier_id' => $supplier->id,
            'payment_date' => now()->format('Y-m-d'),
            'amount' => 5000.00,
            'payment_type' => 'advance',
            'payment_method' => 'Cash',
            'reference_number' => 'PAY-001',
            'notes' => 'Test payment',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/payments', $paymentData);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'amount' => 5000.00,
                'payment_type' => 'advance',
            ]);

        $this->assertDatabaseHas('payments', [
            'supplier_id' => $supplier->id,
            'amount' => 5000.00,
        ]);
    }

    public function test_can_get_supplier_balance()
    {
        $user = User::factory()->create(['role' => 'finance']);
        $supplier = Supplier::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/suppliers/{$supplier->id}/balance");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'supplier_id',
                'supplier_name',
                'total_collections',
                'total_payments',
                'balance',
            ]);
    }

    public function test_validates_payment_type()
    {
        $user = User::factory()->create(['role' => 'finance']);
        $supplier = Supplier::factory()->create();

        $paymentData = [
            'supplier_id' => $supplier->id,
            'payment_date' => now()->format('Y-m-d'),
            'amount' => 5000.00,
            'payment_type' => 'invalid_type',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/payments', $paymentData);

        $response->assertStatus(422);
    }

    public function test_can_filter_payments_by_supplier()
    {
        $user = User::factory()->create(['role' => 'finance']);
        $supplier1 = Supplier::factory()->create();
        $supplier2 = Supplier::factory()->create();

        Payment::factory()->create(['supplier_id' => $supplier1->id]);
        Payment::factory()->create(['supplier_id' => $supplier2->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/payments?supplier_id={$supplier1->id}");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_can_update_payment_with_version_control()
    {
        $user = User::factory()->create(['role' => 'finance']);
        $payment = Payment::factory()->create(['version' => 1, 'amount' => 5000.00]);

        $updateData = [
            'amount' => 6000.00,
            'supplier_id' => $payment->supplier_id,
            'payment_date' => $payment->payment_date,
            'payment_type' => $payment->payment_type,
            'version' => 1,
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/payments/{$payment->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment(['amount' => 6000.00]);

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'amount' => 6000.00,
            'version' => 2,
        ]);
    }
}
