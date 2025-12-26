<?php

namespace Database\Seeders;

use App\Domain\User\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::create([
            'name' => 'System Admin',
            'email' => 'admin@fieldsync.local',
            'password' => Hash::make('admin123'),
            'phone' => '+94771234567',
            'role' => 'admin',
            'status' => 'active',
            'email_verified_at' => now(),
            'sync_status' => 'synced',
        ]);

        // Manager user
        User::create([
            'name' => 'Regional Manager',
            'email' => 'manager@fieldsync.local',
            'password' => Hash::make('manager123'),
            'phone' => '+94772345678',
            'role' => 'manager',
            'status' => 'active',
            'email_verified_at' => now(),
            'sync_status' => 'synced',
            'metadata' => json_encode(['region' => 'Central']),
        ]);

        // Collector users
        $collectors = [
            ['name' => 'John Collector', 'email' => 'john@fieldsync.local', 'region' => 'Central'],
            ['name' => 'Mary Collector', 'email' => 'mary@fieldsync.local', 'region' => 'Southern'],
            ['name' => 'David Collector', 'email' => 'david@fieldsync.local', 'region' => 'Western'],
        ];

        foreach ($collectors as $collector) {
            User::create([
                'name' => $collector['name'],
                'email' => $collector['email'],
                'password' => Hash::make('collector123'),
                'phone' => '+9477' . rand(1000000, 9999999),
                'role' => 'collector',
                'status' => 'active',
                'email_verified_at' => now(),
                'sync_status' => 'synced',
                'metadata' => json_encode(['region' => $collector['region']]),
            ]);
        }
    }
}
