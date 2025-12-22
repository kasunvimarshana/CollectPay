<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::query()->firstOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'Test User', 'password' => 'password']
        );

        Unit::query()->firstOrCreate(
            ['code' => 'g'],
            ['name' => 'Gram', 'unit_type' => 'mass', 'to_base_multiplier' => 1, 'version' => 1]
        );
        Unit::query()->firstOrCreate(
            ['code' => 'kg'],
            ['name' => 'Kilogram', 'unit_type' => 'mass', 'to_base_multiplier' => 1000, 'version' => 1]
        );
        Unit::query()->firstOrCreate(
            ['code' => 'ml'],
            ['name' => 'Milliliter', 'unit_type' => 'volume', 'to_base_multiplier' => 1, 'version' => 1]
        );
        Unit::query()->firstOrCreate(
            ['code' => 'l'],
            ['name' => 'Liter', 'unit_type' => 'volume', 'to_base_multiplier' => 1000, 'version' => 1]
        );

        Product::query()->firstOrCreate(
            ['name' => 'Tea Leaves'],
            ['unit_type' => 'mass', 'is_active' => true, 'version' => 1]
        );
    }
}
