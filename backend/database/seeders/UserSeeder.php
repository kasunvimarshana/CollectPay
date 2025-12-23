<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@transactrack.com',
            'password' => Hash::make('password'),
            'phone' => '+1234567890',
            'role' => 'admin',
            'status' => 'active',
        ]);
        
        // Create manager user
        User::create([
            'name' => 'Manager User',
            'email' => 'manager@transactrack.com',
            'password' => Hash::make('password'),
            'phone' => '+1234567891',
            'role' => 'manager',
            'status' => 'active',
        ]);
        
        // Create collector users
        User::create([
            'name' => 'Collector One',
            'email' => 'collector1@transactrack.com',
            'password' => Hash::make('password'),
            'phone' => '+1234567892',
            'role' => 'collector',
            'status' => 'active',
        ]);
        
        User::create([
            'name' => 'Collector Two',
            'email' => 'collector2@transactrack.com',
            'password' => Hash::make('password'),
            'phone' => '+1234567893',
            'role' => 'collector',
            'status' => 'active',
        ]);
        
        // Create viewer user
        User::create([
            'name' => 'Viewer User',
            'email' => 'viewer@transactrack.com',
            'password' => Hash::make('password'),
            'phone' => '+1234567894',
            'role' => 'viewer',
            'status' => 'active',
        ]);
    }
}
