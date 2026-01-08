<?php

namespace Tests\Feature;

use App\Models\Collection;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Rate;
use App\Models\Role;
use App\Models\Supplier;
use App\Models\User;
use Database\Seeders\CollectionSeeder;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\PaymentSeeder;
use Database\Seeders\ProductSeeder;
use Database\Seeders\RateSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\SupplierSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_role_seeder_creates_all_roles(): void
    {
        $this->seed(RoleSeeder::class);

        $this->assertDatabaseCount('roles', 4);

        $this->assertDatabaseHas('roles', ['name' => 'admin']);
        $this->assertDatabaseHas('roles', ['name' => 'manager']);
        $this->assertDatabaseHas('roles', ['name' => 'collector']);
        $this->assertDatabaseHas('roles', ['name' => 'viewer']);
    }

    public function test_supplier_seeder_creates_suppliers(): void
    {
        $this->seed(SupplierSeeder::class);

        $this->assertDatabaseCount('suppliers', 6);

        $this->assertDatabaseHas('suppliers', [
            'name' => 'Green Valley Farms',
            'code' => 'SUP001',
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('suppliers', [
            'name' => 'Plains Produce Group',
            'code' => 'SUP006',
            'is_active' => false,
        ]);
    }

    public function test_product_seeder_creates_products(): void
    {
        $this->seed(ProductSeeder::class);

        $this->assertDatabaseCount('products', 8);

        $this->assertDatabaseHas('products', [
            'name' => 'Coconuts',
            'code' => 'PROD001',
            'base_unit' => 'kg',
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('products', [
            'name' => 'Latex',
            'code' => 'PROD002',
            'is_active' => true,
        ]);

        // Check that supported_units is properly stored as JSON
        $coconut = Product::where('name', 'Coconuts')->first();
        $this->assertIsArray($coconut->supported_units);
        $this->assertContains('kg', $coconut->supported_units);
    }

    public function test_rate_seeder_creates_rates_with_historical_data(): void
    {
        $this->seed([ProductSeeder::class, RateSeeder::class]);

        $this->assertGreaterThan(0, Rate::count());

        // Check that coconut has multiple rates
        $coconut = Product::where('name', 'Coconuts')->first();
        $coconutRates = Rate::where('product_id', $coconut->id)->get();

        $this->assertGreaterThan(1, $coconutRates->count());

        // Check for active and inactive rates
        $this->assertTrue($coconutRates->contains('is_active', true));
        $this->assertTrue($coconutRates->contains('is_active', false));

        // Verify rate has proper date ranges
        $activeRate = Rate::where('product_id', $coconut->id)
            ->where('is_active', true)
            ->first();

        $this->assertNotNull($activeRate->effective_from);
        $this->assertNull($activeRate->effective_to);
    }

    public function test_collection_seeder_creates_collections(): void
    {
        $this->seed([
            RoleSeeder::class,
            SupplierSeeder::class,
            ProductSeeder::class,
            RateSeeder::class,
        ]);

        // Create test users
        $role = Role::first();
        User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
            'is_active' => true,
        ]);

        $this->seed(CollectionSeeder::class);

        $this->assertGreaterThan(0, Collection::count());

        // Verify collection has proper relationships
        $collection = Collection::first();
        $this->assertNotNull($collection->supplier);
        $this->assertNotNull($collection->product);
        $this->assertNotNull($collection->user);
        $this->assertNotNull($collection->rate);

        // Verify total amount calculation
        $expectedTotal = $collection->quantity * $collection->rate_applied;
        $this->assertEquals($expectedTotal, $collection->total_amount);
    }

    public function test_payment_seeder_creates_payments(): void
    {
        $this->seed([
            RoleSeeder::class,
            SupplierSeeder::class,
        ]);

        // Create test users
        $role = Role::first();
        User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
            'is_active' => true,
        ]);

        $this->seed(PaymentSeeder::class);

        $this->assertGreaterThan(0, Payment::count());

        // Verify payment has proper relationships
        $payment = Payment::first();
        $this->assertNotNull($payment->supplier);
        $this->assertNotNull($payment->user);

        // Verify payment has required fields
        $this->assertNotNull($payment->payment_date);
        $this->assertGreaterThan(0, $payment->amount);
        $this->assertNotNull($payment->type);
        $this->assertNotNull($payment->reference_number);

        // Check for unique reference numbers
        $payments = Payment::all();
        $referenceNumbers = $payments->pluck('reference_number')->toArray();
        $this->assertEquals(count($referenceNumbers), count(array_unique($referenceNumbers)));
    }

    public function test_database_seeder_runs_all_seeders(): void
    {
        $this->seed(DatabaseSeeder::class);

        // Verify all entities are created
        $this->assertGreaterThan(0, Role::count());
        $this->assertGreaterThan(0, User::count());
        $this->assertGreaterThan(0, Supplier::count());
        $this->assertGreaterThan(0, Product::count());
        $this->assertGreaterThan(0, Rate::count());
        $this->assertGreaterThan(0, Collection::count());
        $this->assertGreaterThan(0, Payment::count());

        // Verify data integrity
        $collections = Collection::all();
        foreach ($collections as $collection) {
            $this->assertNotNull($collection->supplier_id);
            $this->assertNotNull($collection->product_id);
            $this->assertNotNull($collection->user_id);
            $this->assertNotNull($collection->rate_id);
        }

        $payments = Payment::all();
        foreach ($payments as $payment) {
            $this->assertNotNull($payment->supplier_id);
            $this->assertNotNull($payment->user_id);
        }
    }

    public function test_seeders_create_realistic_data(): void
    {
        $this->seed(DatabaseSeeder::class);

        // Check for realistic supplier data
        $supplier = Supplier::where('code', 'SUP001')->first();
        $this->assertNotNull($supplier->name);
        $this->assertNotNull($supplier->contact_person);
        $this->assertNotNull($supplier->phone);

        // Check for realistic product data
        $product = Product::where('code', 'PROD001')->first();
        $this->assertNotNull($product->name);
        $this->assertNotNull($product->base_unit);
        $this->assertIsArray($product->supported_units);

        // Check for realistic rate progression
        $coconut = Product::where('name', 'Coconuts')->first();
        $rates = Rate::where('product_id', $coconut->id)
            ->where('unit', 'kg')
            ->orderBy('effective_from')
            ->get();

        if ($rates->count() > 1) {
            // Rates should increase over time - verify the trend is generally upward
            $firstRate = $rates->first()->rate;
            $lastRate = $rates->last()->rate;
            $this->assertGreaterThan($firstRate, $lastRate, 'Last rate should be higher than first rate to show price increase over time');
        }
    }
}
