<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'Full system access and management',
                'permissions' => [
                    'users.view', 'users.create', 'users.edit', 'users.delete',
                    'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
                    'suppliers.view', 'suppliers.create', 'suppliers.edit', 'suppliers.delete',
                    'products.view', 'products.create', 'products.edit', 'products.delete',
                    'rates.view', 'rates.create', 'rates.edit', 'rates.delete',
                    'collections.view', 'collections.create', 'collections.edit', 'collections.delete',
                    'payments.view', 'payments.create', 'payments.edit', 'payments.delete',
                    'reports.view', 'audit.view'
                ]
            ],
            [
                'name' => 'manager',
                'display_name' => 'Manager',
                'description' => 'Manage collections, payments, and view reports',
                'permissions' => [
                    'suppliers.view', 'suppliers.create', 'suppliers.edit',
                    'products.view',
                    'rates.view', 'rates.create', 'rates.edit',
                    'collections.view', 'collections.create', 'collections.edit',
                    'payments.view', 'payments.create', 'payments.edit',
                    'reports.view'
                ]
            ],
            [
                'name' => 'collector',
                'display_name' => 'Collector',
                'description' => 'Record collections and view basic information',
                'permissions' => [
                    'suppliers.view',
                    'products.view',
                    'rates.view',
                    'collections.view', 'collections.create', 'collections.edit',
                ]
            ],
            [
                'name' => 'viewer',
                'display_name' => 'Viewer',
                'description' => 'View-only access to data',
                'permissions' => [
                    'suppliers.view',
                    'products.view',
                    'rates.view',
                    'collections.view',
                    'payments.view',
                    'reports.view'
                ]
            ]
        ];

        foreach ($roles as $roleData) {
            Role::create($roleData);
        }
    }
}
