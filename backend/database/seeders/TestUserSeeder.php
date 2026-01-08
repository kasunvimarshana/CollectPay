<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * WARNING: This seeder is for development/testing only.
     * Do not run in production environments.
     */
    public function run(): void
    {
        // Prevent running in production
        if (app()->environment('production')) {
            $this->command->error('Cannot run TestUserSeeder in production environment!');

            return;
        }

        $roles = Role::all()->keyBy('name');
        $password = env('TEST_USER_PASSWORD', 'password');

        // Create test users
        $testUsers = [
            ['role' => 'admin', 'name' => 'Admin User', 'email' => 'admin@ledger.com'],
            ['role' => 'manager', 'name' => 'Manager User', 'email' => 'manager@ledger.com'],
            ['role' => 'collector', 'name' => 'Collector User', 'email' => 'collector@ledger.com'],
            ['role' => 'viewer', 'name' => 'Viewer User', 'email' => 'viewer@ledger.com'],
        ];

        foreach ($testUsers as $userData) {
            if ($roles->has($userData['role'])) {
                $this->createTestUser(
                    $userData['name'],
                    $userData['email'],
                    $password,
                    $roles[$userData['role']]->id
                );
            }
        }

        $this->command->info('Test users created successfully!');
        $this->command->warn('These are test credentials for development only.');
    }

    /**
     * Create a test user
     */
    private function createTestUser(string $name, string $email, string $password, int $roleId): void
    {
        User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'role_id' => $roleId,
            'is_active' => true,
        ]);
    }
}
