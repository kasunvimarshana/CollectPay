<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Collection;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\RateVersion;
use App\Models\User;
use Carbon\Carbon;

class CollectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $collector = User::where('email', 'john@fieldsyncledger.com')->first();

        if (!$collector) {
            return;
        }

        $suppliers = Supplier::all();
        $product = Product::where('code', 'PRD001')->first();

        if (!$product || $suppliers->isEmpty()) {
            return;
        }

        // Create collections for the past 30 days
        foreach ($suppliers->take(5) as $supplier) {
            for ($i = 30; $i >= 1; $i--) {
                $collectionDate = Carbon::now()->subDays($i);
                
                // Get the applicable rate for this date
                $rateVersion = RateVersion::where('product_id', $product->id)
                    ->where('effective_from', '<=', $collectionDate)
                    ->where(function ($query) use ($collectionDate) {
                        $query->whereNull('effective_to')
                            ->orWhere('effective_to', '>=', $collectionDate);
                    })
                    ->orderBy('effective_from', 'desc')
                    ->first();

                if (!$rateVersion) {
                    continue;
                }

                // Random quantity between 50 and 200 kg
                $quantity = rand(50, 200);

                Collection::create([
                    'id' => (string) Str::uuid(),
                    'supplier_id' => $supplier->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'rate_version_id' => $rateVersion->id,
                    'applied_rate' => $rateVersion->rate,
                    'collection_date' => $collectionDate,
                    'notes' => 'Daily collection',
                    'user_id' => $collector->id,
                    'idempotency_key' => (string) Str::uuid(),
                    'version' => 1,
                ]);
            }
        }
    }
}
