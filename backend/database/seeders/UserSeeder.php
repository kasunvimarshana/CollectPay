<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin user
        User::create([
            'id' => (string) Str::uuid(),
            'name' => 'Admin User',
            'email' => 'admin@fieldsyncledger.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'permissions' => [
                'manage_users',
                'manage_suppliers',
                'manage_products',
                'manage_rates',
                'manage_collections',
                'manage_payments',
                'view_reports',
            ],
            'version' => 1,
        ]);

        // Collector user 1
        User::create([
            'id' => (string) Str::uuid(),
            'name' => 'John Collector',
            'email' => 'john@fieldsyncledger.com',
            'password' => Hash::make('password'),
            'role' => 'collector',
            'permissions' => [
                'manage_suppliers',
                'manage_collections',
                'manage_payments',
                'view_reports',
            ],
            'version' => 1,
        ]);

        // Collector user 2
        User::create([
            'id' => (string) Str::uuid(),
            'name' => 'Jane Collector',
            'email' => 'jane@fieldsyncledger.com',
            'password' => Hash::make('password'),
            'role' => 'collector',
            'permissions' => [
                'manage_suppliers',
                'manage_collections',
                'manage_payments',
                'view_reports',
            ],
            'version' => 1,
        ]);

        // Viewer user
        User::create([
            'id' => (string) Str::uuid(),
            'name' => 'Viewer User',
            'email' => 'viewer@fieldsyncledger.com',
            'password' => Hash::make('password'),
            'role' => 'viewer',
            'permissions' => [
                'view_reports',
            ],
            'version' => 1,
        ]);
    }
}
