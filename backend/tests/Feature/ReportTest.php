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

class ReportTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected $token;

    protected function setUp(): void
    {
        parent::setUp();

        // Create user and get token
        $this->user = User::factory()->create();
        $this->token = auth('api')->login($this->user);
    }

    public function test_can_get_system_summary()
    {
        // Create test data
        Supplier::factory()->count(5)->create(['is_active' => true]);
        Supplier::factory()->count(2)->create(['is_active' => false]);
        Product::factory()->count(3)->create(['is_active' => true]);

        $supplier = Supplier::factory()->create();
        $product = Product::factory()->create();
        $rate = Rate::factory()->create([
            'product_id' => $product->id,
            'rate' => 100.00,
        ]);

        Collection::factory()->create([
            'supplier_id' => $supplier->id,
            'product_id' => $product->id,
            'total_amount' => 1000.00,
        ]);

        Payment::factory()->create([
            'supplier_id' => $supplier->id,
            'amount' => 500.00,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/reports/summary');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'totalSuppliers',
                    'activeSuppliers',
                    'totalProducts',
                    'activeProducts',
                    'totalCollections',
                    'totalCollectionAmount',
                    'totalPayments',
                    'totalPaymentAmount',
                    'outstandingBalance',
                    'collectionsThisMonth',
                    'paymentsThisMonth',
                    'collectionAmountThisMonth',
                    'paymentAmountThisMonth',
                ],
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'totalSuppliers' => 8,
                    'activeSuppliers' => 6,
                    'totalCollections' => 1,
                    'totalPayments' => 1,
                ],
            ]);

        // Verify totals exist and are numeric
        $data = $response->json('data');
        $this->assertIsNumeric($data['totalProducts']);
        $this->assertIsNumeric($data['totalCollectionAmount']);
    }

    public function test_can_get_supplier_balances()
    {
        $supplier1 = Supplier::factory()->create(['name' => 'Supplier 1', 'code' => 'SUP001']);
        $supplier2 = Supplier::factory()->create(['name' => 'Supplier 2', 'code' => 'SUP002']);
        $product = Product::factory()->create();

        // Supplier 1: 1000 collections, 300 payments = 700 balance
        Collection::factory()->create([
            'supplier_id' => $supplier1->id,
            'product_id' => $product->id,
            'total_amount' => 1000.00,
        ]);
        Payment::factory()->create([
            'supplier_id' => $supplier1->id,
            'amount' => 300.00,
        ]);

        // Supplier 2: 500 collections, 100 payments = 400 balance
        Collection::factory()->create([
            'supplier_id' => $supplier2->id,
            'product_id' => $product->id,
            'total_amount' => 500.00,
        ]);
        Payment::factory()->create([
            'supplier_id' => $supplier2->id,
            'amount' => 100.00,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/reports/supplier-balances?limit=10&sort=desc');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'supplier_id',
                        'supplier_name',
                        'supplier_code',
                        'total_collections',
                        'total_payments',
                        'balance',
                        'collection_count',
                        'payment_count',
                    ],
                ],
            ]);

        // Verify supplier 1 has higher balance and comes first (desc order)
        $data = $response->json('data');
        $this->assertEquals('Supplier 1', $data[0]['supplier_name']);
        $this->assertEquals(700.00, $data[0]['balance']);
        $this->assertEquals('Supplier 2', $data[1]['supplier_name']);
        $this->assertEquals(400.00, $data[1]['balance']);
    }

    public function test_can_get_collections_summary()
    {
        $supplier = Supplier::factory()->create();
        $product = Product::factory()->create(['name' => 'Test Product']);
        $rate = Rate::factory()->create([
            'product_id' => $product->id,
            'rate' => 100.00,
        ]);

        // Create collections with specific dates
        Collection::factory()->create([
            'supplier_id' => $supplier->id,
            'product_id' => $product->id,
            'collection_date' => '2025-01-15',
            'quantity' => 10,
            'total_amount' => 1000.00,
        ]);

        Collection::factory()->create([
            'supplier_id' => $supplier->id,
            'product_id' => $product->id,
            'collection_date' => '2025-01-20',
            'quantity' => 5,
            'total_amount' => 500.00,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/reports/collections-summary?start_date=2025-01-01&end_date=2025-01-31');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'summary' => [
                        'total_count',
                        'total_quantity',
                        'total_amount',
                    ],
                    'by_product',
                    'by_supplier',
                ],
            ]);

        $data = $response->json('data');
        $this->assertEquals(2, $data['summary']['total_count']);
        $this->assertEquals(15, $data['summary']['total_quantity']);
        $this->assertEquals(1500.00, $data['summary']['total_amount']);
    }

    public function test_can_get_payments_summary()
    {
        $supplier = Supplier::factory()->create(['name' => 'Test Supplier']);

        // Create different types of payments
        Payment::factory()->create([
            'supplier_id' => $supplier->id,
            'payment_date' => '2025-01-15',
            'amount' => 1000.00,
            'type' => 'advance',
        ]);

        Payment::factory()->create([
            'supplier_id' => $supplier->id,
            'payment_date' => '2025-01-20',
            'amount' => 500.00,
            'type' => 'partial',
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/reports/payments-summary?start_date=2025-01-01&end_date=2025-01-31');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'summary' => [
                        'total_count',
                        'total_amount',
                    ],
                    'by_type',
                    'by_supplier',
                ],
            ]);

        $data = $response->json('data');
        $this->assertEquals(2, $data['summary']['total_count']);
        $this->assertEquals(1500.00, $data['summary']['total_amount']);
    }

    public function test_can_get_product_performance()
    {
        // Use isolated test to avoid interference from other tests
        $product = Product::factory()->create(['name' => 'Unique Test Product '.uniqid()]);
        $supplier = Supplier::factory()->create();
        $rate = Rate::factory()->create([
            'product_id' => $product->id,
            'rate' => 100.00,
            'unit' => 'kg',
            'effective_from' => '2025-01-01',
        ]);

        // Create exactly 3 collections for this specific product
        Collection::factory()->count(3)->create([
            'supplier_id' => $supplier->id,
            'product_id' => $product->id,
            'quantity' => 10,
            'total_amount' => 1000.00,
            'collection_date' => '2025-01-15',
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/reports/product-performance');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'product_id',
                        'product_name',
                        'product_code',
                        'collection_count',
                        'total_quantity',
                        'total_amount',
                        'unique_suppliers',
                        'avg_rate',
                    ],
                ],
            ]);

        $data = $response->json('data');
        // Find our specific test product in the results
        $testProduct = collect($data)->firstWhere('product_id', $product->id);
        $this->assertNotNull($testProduct, 'Test product not found in results');
        $this->assertEquals($product->name, $testProduct['product_name']);
        $this->assertEquals(3, $testProduct['collection_count']);
        $this->assertEquals(30, $testProduct['total_quantity']);
    }

    public function test_can_get_financial_summary()
    {
        $supplier = Supplier::factory()->create();
        $product = Product::factory()->create();

        // Create data for different months
        Collection::factory()->create([
            'supplier_id' => $supplier->id,
            'product_id' => $product->id,
            'collection_date' => '2025-01-15',
            'total_amount' => 1000.00,
        ]);

        Collection::factory()->create([
            'supplier_id' => $supplier->id,
            'product_id' => $product->id,
            'collection_date' => '2025-02-15',
            'total_amount' => 2000.00,
        ]);

        Payment::factory()->create([
            'supplier_id' => $supplier->id,
            'payment_date' => '2025-01-20',
            'amount' => 500.00,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/reports/financial-summary?start_date=2025-01-01&end_date=2025-12-31');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'summary' => [
                        'total_collections',
                        'total_payments',
                        'net_balance',
                    ],
                    'monthly_breakdown',
                ],
            ]);

        $data = $response->json('data');
        $this->assertEquals(3000.00, $data['summary']['total_collections']);
        $this->assertEquals(500.00, $data['summary']['total_payments']);
        $this->assertEquals(2500.00, $data['summary']['net_balance']);
    }

    public function test_authenticated_user_can_access_reports()
    {
        // Reports require authentication
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/reports/summary');
        $response->assertStatus(200);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/reports/supplier-balances');
        $response->assertStatus(200);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/reports/collections-summary');
        $response->assertStatus(200);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/reports/payments-summary');
        $response->assertStatus(200);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/reports/product-performance');
        $response->assertStatus(200);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/reports/financial-summary');
        $response->assertStatus(200);
    }

    public function test_collections_summary_respects_date_filters()
    {
        $supplier = Supplier::factory()->create();
        $product = Product::factory()->create();

        // Collection in range
        Collection::factory()->create([
            'supplier_id' => $supplier->id,
            'product_id' => $product->id,
            'collection_date' => '2025-01-15',
            'total_amount' => 1000.00,
        ]);

        // Collection out of range
        Collection::factory()->create([
            'supplier_id' => $supplier->id,
            'product_id' => $product->id,
            'collection_date' => '2025-03-15',
            'total_amount' => 2000.00,
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/reports/collections-summary?start_date=2025-01-01&end_date=2025-01-31');

        $response->assertStatus(200);
        $data = $response->json('data');

        // Should only include the January collection
        $this->assertEquals(1, $data['summary']['total_count']);
        $this->assertEquals(1000.00, $data['summary']['total_amount']);
    }

    public function test_supplier_balances_respects_sort_order()
    {
        $supplier1 = Supplier::factory()->create(['name' => 'Low Balance']);
        $supplier2 = Supplier::factory()->create(['name' => 'High Balance']);
        $product = Product::factory()->create();

        // Low balance supplier
        Collection::factory()->create([
            'supplier_id' => $supplier1->id,
            'product_id' => $product->id,
            'total_amount' => 100.00,
        ]);

        // High balance supplier
        Collection::factory()->create([
            'supplier_id' => $supplier2->id,
            'product_id' => $product->id,
            'total_amount' => 1000.00,
        ]);

        // Test descending order (default)
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/reports/supplier-balances?sort=desc');

        $data = $response->json('data');
        $this->assertEquals('High Balance', $data[0]['supplier_name']);

        // Test ascending order
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/reports/supplier-balances?sort=asc');

        $data = $response->json('data');
        $this->assertEquals('Low Balance', $data[0]['supplier_name']);
    }
}
