<?php

namespace Tests\Feature;

use App\Models\Collection;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Rate;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VersionConflictTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    /**
     * Test supplier version conflict detection
     */
    public function test_supplier_version_conflict_detected(): void
    {
        // Create a supplier
        $supplier = Supplier::factory()->create([
            'name' => 'Test Supplier',
            'code' => 'SUP001',
            'version' => 1,
        ]);

        // Simulate another user updating the supplier (version becomes 2)
        $supplier->name = 'Updated Supplier';
        $supplier->save();
        $this->assertEquals(2, $supplier->fresh()->version);

        // Try to update with stale version (1)
        $response = $this->withHeaders($this->authenticatedHeaders())->putJson("/api/suppliers/{$supplier->id}", [
            'name' => 'My Update',
            'code' => 'SUP001',
            'version' => 1, // Stale version
        ]);

        // Should get 409 Conflict
        $response->assertStatus(409);
        $response->assertJson([
            'success' => false,
            'conflict' => true,
        ]);
        $response->assertJsonPath('data.server_version', 2);
        $response->assertJsonPath('data.client_version', 1);
    }

    /**
     * Test product version conflict detection
     */
    public function test_product_version_conflict_detected(): void
    {
        // Create a product
        $product = Product::factory()->create([
            'name' => 'Test Product',
            'code' => 'PROD001',
            'base_unit' => 'kg',
            'version' => 1,
        ]);

        // Another user updates the product
        $product->name = 'Updated Product';
        $product->save();
        $this->assertEquals(2, $product->fresh()->version);

        // Try to update with stale version
        $response = $this->withHeaders($this->authenticatedHeaders())->putJson("/api/products/{$product->id}", [
            'name' => 'My Update',
            'code' => 'PROD001',
            'base_unit' => 'kg',
            'version' => 1,
        ]);

        $response->assertStatus(409);
        $response->assertJsonPath('conflict', true);
    }

    /**
     * Test collection version conflict detection
     */
    public function test_collection_version_conflict_detected(): void
    {
        $supplier = Supplier::factory()->create();
        $product = Product::factory()->create();
        $rate = Rate::factory()->create(['product_id' => $product->id]);

        $collection = Collection::factory()->create([
            'supplier_id' => $supplier->id,
            'product_id' => $product->id,
            'rate_id' => $rate->id,
            'quantity' => 100,
            'version' => 1,
        ]);

        // Simulate concurrent update
        $collection->quantity = 150;
        $collection->save();

        // Try update with stale version
        $response = $this->withHeaders($this->authenticatedHeaders())->putJson("/api/collections/{$collection->id}", [
            'supplier_id' => $supplier->id,
            'product_id' => $product->id,
            'rate_id' => $rate->id,
            'collection_date' => now()->toDateString(),
            'quantity' => 200,
            'unit' => 'kg',
            'version' => 1,
        ]);

        $response->assertStatus(409);
        $response->assertJsonPath('conflict', true);
    }

    /**
     * Test payment version conflict detection
     */
    public function test_payment_version_conflict_detected(): void
    {
        $supplier = Supplier::factory()->create();

        $payment = Payment::factory()->create([
            'supplier_id' => $supplier->id,
            'amount' => 1000,
            'version' => 1,
        ]);

        // Concurrent update
        $payment->amount = 1500;
        $payment->save();

        // Try update with stale version
        $response = $this->withHeaders($this->authenticatedHeaders())->putJson("/api/payments/{$payment->id}", [
            'supplier_id' => $supplier->id,
            'payment_date' => now()->toDateString(),
            'amount' => 2000,
            'type' => 'advance',
            'version' => 1,
        ]);

        $response->assertStatus(409);
        $response->assertJsonPath('conflict', true);
    }

    /**
     * Test rate version conflict detection
     */
    public function test_rate_version_conflict_detected(): void
    {
        $product = Product::factory()->create();

        $rate = Rate::factory()->create([
            'product_id' => $product->id,
            'rate' => 100,
            'version' => 1,
        ]);

        // Concurrent update
        $rate->rate = 150;
        $rate->save();

        // Try update with stale version
        $response = $this->withHeaders($this->authenticatedHeaders())->putJson("/api/rates/{$rate->id}", [
            'product_id' => $product->id,
            'rate' => 200,
            'unit' => 'kg',
            'effective_from' => now()->toDateString(),
            'version' => 1,
        ]);

        $response->assertStatus(409);
        $response->assertJsonPath('conflict', true);
    }

    /**
     * Test successful update with correct version
     */
    public function test_successful_update_with_correct_version(): void
    {
        $supplier = Supplier::factory()->create([
            'name' => 'Test Supplier',
            'code' => 'SUP001',
            'version' => 1,
        ]);

        // Update with correct version
        $response = $this->withHeaders($this->authenticatedHeaders())->putJson("/api/suppliers/{$supplier->id}", [
            'name' => 'Updated Supplier',
            'code' => 'SUP001',
            'version' => 1, // Correct version
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);

        // Version should be incremented
        $this->assertEquals(2, $supplier->fresh()->version);
    }

    /**
     * Test version auto-increment on update
     */
    public function test_version_auto_increment_on_update(): void
    {
        $supplier = Supplier::factory()->create([
            'version' => 1,
        ]);

        $supplier->name = 'Updated Name';
        $supplier->save();

        $this->assertEquals(2, $supplier->version);

        $supplier->name = 'Another Update';
        $supplier->save();

        $this->assertEquals(3, $supplier->version);
    }

    /**
     * Test version starts at 1 for new records
     */
    public function test_version_starts_at_one_for_new_records(): void
    {
        $supplier = Supplier::factory()->create();
        $this->assertEquals(1, $supplier->version);

        $product = Product::factory()->create();
        $this->assertEquals(1, $product->version);

        $payment = Payment::factory()->create([
            'supplier_id' => $supplier->id,
        ]);
        $this->assertEquals(1, $payment->version);
    }

    /**
     * Test conflict response includes current data
     */
    public function test_conflict_response_includes_current_data(): void
    {
        $supplier = Supplier::factory()->create([
            'name' => 'Original Name',
            'version' => 1,
        ]);

        // Another user updates
        $supplier->name = 'Server Updated Name';
        $supplier->save();

        // Try to update with stale version
        $response = $this->withHeaders($this->authenticatedHeaders())->putJson("/api/suppliers/{$supplier->id}", [
            'name' => 'Client Update',
            'code' => $supplier->code,
            'version' => 1,
        ]);

        $response->assertStatus(409);
        $response->assertJsonPath('data.current_data.name', 'Server Updated Name');
        $response->assertJsonPath('data.current_data.version', 2);
    }

    /**
     * Test multi-device concurrent scenario
     */
    public function test_multi_device_concurrent_update_scenario(): void
    {
        // Device A fetches supplier
        $supplier = Supplier::factory()->create([
            'name' => 'Original',
            'version' => 1,
        ]);

        // Device B also fetches supplier (same version)
        $deviceBSupplier = Supplier::find($supplier->id);

        // Device A updates successfully
        $responseA = $this->withHeaders($this->authenticatedHeaders())->putJson("/api/suppliers/{$supplier->id}", [
            'name' => 'Device A Update',
            'code' => $supplier->code,
            'version' => 1,
        ]);

        $responseA->assertStatus(200);
        $this->assertEquals(2, Supplier::find($supplier->id)->version);

        // Device B tries to update with stale version
        $responseB = $this->withHeaders($this->authenticatedHeaders())->putJson("/api/suppliers/{$supplier->id}", [
            'name' => 'Device B Update',
            'code' => $supplier->code,
            'version' => 1, // Stale
        ]);

        // Device B should get conflict
        $responseB->assertStatus(409);
        $responseB->assertJsonPath('conflict', true);

        // Server data should be Device A's update
        $responseB->assertJsonPath('data.current_data.name', 'Device A Update');
        $responseB->assertJsonPath('data.current_data.version', 2);
    }
}
