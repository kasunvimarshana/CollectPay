<?php

namespace Tests\Unit;

use App\Models\Supplier;
use App\Models\Collection;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupplierTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_create_a_supplier()
    {
        $supplier = Supplier::create([
            'name' => 'Test Supplier',
            'code' => 'SUP001',
            'phone' => '1234567890',
            'email' => 'test@supplier.com',
            'address' => '123 Test St',
            'location' => 'Test City',
            'is_active' => true
        ]);

        $this->assertDatabaseHas('suppliers', [
            'name' => 'Test Supplier',
            'code' => 'SUP001'
        ]);
        $this->assertEquals('Test Supplier', $supplier->name);
        $this->assertTrue($supplier->is_active);
    }

    /** @test */
    public function it_has_collections()
    {
        $supplier = Supplier::factory()->create();
        
        $this->assertInstanceOf(
            'Illuminate\Database\Eloquent\Relations\HasMany',
            $supplier->collections()
        );
    }

    /** @test */
    public function it_has_payments()
    {
        $supplier = Supplier::factory()->create();
        
        $this->assertInstanceOf(
            'Illuminate\Database\Eloquent\Relations\HasMany',
            $supplier->payments()
        );
    }

    /** @test */
    public function it_calculates_total_owed()
    {
        $supplier = Supplier::factory()->create();
        
        // Create collections worth 1000
        Collection::factory()->create([
            'supplier_id' => $supplier->id,
            'total_amount' => 500
        ]);
        Collection::factory()->create([
            'supplier_id' => $supplier->id,
            'total_amount' => 500
        ]);

        // Create payments worth 300
        Payment::factory()->create([
            'supplier_id' => $supplier->id,
            'amount' => 300
        ]);

        $totalOwed = $supplier->calculateTotalOwed();
        
        // Total collections (1000) - Total payments (300) = 700
        $this->assertEquals(700, $totalOwed);
    }

    /** @test */
    public function it_soft_deletes()
    {
        $supplier = Supplier::factory()->create();
        $supplierId = $supplier->id;

        $supplier->delete();

        $this->assertSoftDeleted('suppliers', ['id' => $supplierId]);
    }

    /** @test */
    public function it_has_version_field()
    {
        $supplier = Supplier::factory()->create();
        
        $this->assertEquals(0, $supplier->version);
        
        $supplier->increment('version');
        $supplier->refresh();
        
        $this->assertEquals(1, $supplier->version);
    }

    /** @test */
    public function it_casts_is_active_to_boolean()
    {
        $supplier = Supplier::factory()->create(['is_active' => 1]);
        
        $this->assertIsBool($supplier->is_active);
        $this->assertTrue($supplier->is_active);
    }
}
