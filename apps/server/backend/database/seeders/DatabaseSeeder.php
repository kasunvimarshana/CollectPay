<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'attributes' => ['department' => 'hq'],
                'version' => 0,
            ]
        );

        // Manager in Sales
        User::updateOrCreate(
            ['email' => 'manager.sales@example.com'],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Sales Manager',
                'password' => Hash::make('password'),
                'role' => 'manager',
                'attributes' => ['department' => 'sales'],
                'version' => 0,
            ]
        );

        // Regular user in Sales
        User::updateOrCreate(
            ['email' => 'user.sales@example.com'],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Sales User',
                'password' => Hash::make('password'),
                'role' => 'user',
                'attributes' => ['department' => 'sales'],
                'version' => 0,
            ]
        );
    }
}
