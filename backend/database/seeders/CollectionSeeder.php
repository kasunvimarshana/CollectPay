<?php

namespace Database\Seeders;

use App\Models\Collection;
use App\Models\Product;
use App\Models\Rate;
use App\Models\Supplier;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class CollectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $suppliers = Supplier::where('is_active', true)->get();
        $products = Product::where('is_active', true)->get();
        $users = User::where('is_active', true)->get();

        if ($suppliers->isEmpty() || $products->isEmpty() || $users->isEmpty()) {
            $this->command->warn('Missing required data. Ensure SupplierSeeder, ProductSeeder, RoleSeeder, and user data are seeded first.');
            return;
        }

        // Create sample collections for the past 3 months
        $now = Carbon::now();
        $collectionData = [
            // Green Valley Farms - Coconuts
            [
                'supplier' => 'Green Valley Farms',
                'product' => 'Coconuts',
                'collections' => [
                    ['date' => $now->copy()->subMonths(2)->subDays(15), 'quantity' => 150.500, 'unit' => 'kg'],
                    ['date' => $now->copy()->subMonths(1)->subDays(20), 'quantity' => 200.750, 'unit' => 'kg'],
                    ['date' => $now->copy()->subDays(3), 'quantity' => 180.250, 'unit' => 'kg'],
                ],
            ],
            // Mountain Fresh Produce - Coffee Beans
            [
                'supplier' => 'Mountain Fresh Produce',
                'product' => 'Coffee Beans',
                'collections' => [
                    ['date' => $now->copy()->subMonths(2)->subDays(10), 'quantity' => 50.000, 'unit' => 'kg'],
                    ['date' => $now->copy()->subMonths(1)->subDays(15), 'quantity' => 75.500, 'unit' => 'kg'],
                    ['date' => $now->copy()->subDays(8), 'quantity' => 60.250, 'unit' => 'kg'],
                ],
            ],
            // Coastal Growers Co. - Tea Leaves
            [
                'supplier' => 'Coastal Growers Co.',
                'product' => 'Tea Leaves',
                'collections' => [
                    ['date' => $now->copy()->subMonths(2)->subDays(5), 'quantity' => 300.000, 'unit' => 'kg'],
                    ['date' => $now->copy()->subMonths(1)->subDays(10), 'quantity' => 350.750, 'unit' => 'kg'],
                    ['date' => $now->copy()->subDays(13), 'quantity' => 325.500, 'unit' => 'kg'],
                ],
            ],
            // Sunrise Agriculture - Latex
            [
                'supplier' => 'Sunrise Agriculture',
                'product' => 'Latex',
                'collections' => [
                    ['date' => $now->copy()->subMonths(2)->subDays(18), 'quantity' => 80.000, 'unit' => 'kg'],
                    ['date' => $now->copy()->subMonths(1)->subDays(22), 'quantity' => 95.250, 'unit' => 'kg'],
                    ['date' => $now->copy()->subDays(5), 'quantity' => 110.500, 'unit' => 'kg'],
                ],
            ],
            // Valley Harvest Inc. - Cocoa Beans
            [
                'supplier' => 'Valley Harvest Inc.',
                'product' => 'Cocoa Beans',
                'collections' => [
                    ['date' => $now->copy()->subMonths(2)->subDays(12), 'quantity' => 45.000, 'unit' => 'kg'],
                    ['date' => $now->copy()->subMonths(1)->subDays(18), 'quantity' => 55.750, 'unit' => 'kg'],
                    ['date' => $now->copy()->subDays(10), 'quantity' => 50.250, 'unit' => 'kg'],
                ],
            ],
        ];

        foreach ($collectionData as $data) {
            $supplier = $suppliers->firstWhere('name', $data['supplier']);
            $product = $products->firstWhere('name', $data['product']);

            if (!$supplier || !$product) {
                continue;
            }

            foreach ($data['collections'] as $collectionItem) {
                $collectionDate = $collectionItem['date'];
                
                // Get the appropriate rate for the collection date
                $rate = Rate::where('product_id', $product->id)
                    ->where('unit', $collectionItem['unit'])
                    ->whereDate('effective_from', '<=', $collectionDate)
                    ->where(function ($query) use ($collectionDate) {
                        $query->whereNull('effective_to')
                            ->orWhereDate('effective_to', '>=', $collectionDate);
                    })
                    ->orderBy('effective_from', 'desc')
                    ->first();

                if (!$rate) {
                    $this->command->warn("No rate found for {$product->name} on {$collectionDate->toDateString()}");
                    continue;
                }

                $quantity = $collectionItem['quantity'];
                $totalAmount = $quantity * $rate->rate;

                Collection::create([
                    'supplier_id' => $supplier->id,
                    'product_id' => $product->id,
                    'user_id' => $users->random()->id,
                    'rate_id' => $rate->id,
                    'collection_date' => $collectionDate,
                    'quantity' => $quantity,
                    'unit' => $collectionItem['unit'],
                    'rate_applied' => $rate->rate,
                    'total_amount' => $totalAmount,
                    'notes' => "Sample collection for {$supplier->name}",
                    'version' => 1,
                ]);
            }
        }

        $this->command->info('Collections seeded successfully!');
    }
}
