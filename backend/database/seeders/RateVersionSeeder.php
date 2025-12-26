<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\RateVersion;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;

class RateVersionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@fieldsyncledger.com')->first();

        if (!$admin) {
            return;
        }

        $products = Product::all();

        foreach ($products as $product) {
            // Create historical rate version (3 months ago - 1 month ago)
            RateVersion::create([
                'id' => (string) Str::uuid(),
                'product_id' => $product->id,
                'rate' => 150.00,
                'effective_from' => Carbon::now()->subMonths(3),
                'effective_to' => Carbon::now()->subMonth(),
                'user_id' => $admin->id,
                'version' => 1,
            ]);

            // Create current rate version (1 month ago - present)
            RateVersion::create([
                'id' => (string) Str::uuid(),
                'product_id' => $product->id,
                'rate' => 180.00,
                'effective_from' => Carbon::now()->subMonth(),
                'effective_to' => null,
                'user_id' => $admin->id,
                'version' => 1,
            ]);
        }
    }
}
