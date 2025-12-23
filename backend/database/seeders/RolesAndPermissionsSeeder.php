<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define permissions
        $permissions = [
            // Supplier permissions
            ['name' => 'View Suppliers', 'slug' => 'suppliers.view', 'resource' => 'suppliers', 'action' => 'view'],
            ['name' => 'Create Suppliers', 'slug' => 'suppliers.create', 'resource' => 'suppliers', 'action' => 'create'],
            ['name' => 'Update Suppliers', 'slug' => 'suppliers.update', 'resource' => 'suppliers', 'action' => 'update'],
            ['name' => 'Delete Suppliers', 'slug' => 'suppliers.delete', 'resource' => 'suppliers', 'action' => 'delete'],
            
            // Product permissions
            ['name' => 'View Products', 'slug' => 'products.view', 'resource' => 'products', 'action' => 'view'],
            ['name' => 'Create Products', 'slug' => 'products.create', 'resource' => 'products', 'action' => 'create'],
            ['name' => 'Update Products', 'slug' => 'products.update', 'resource' => 'products', 'action' => 'update'],
            ['name' => 'Delete Products', 'slug' => 'products.delete', 'resource' => 'products', 'action' => 'delete'],
            
            // Product Rate permissions
            ['name' => 'View Rates', 'slug' => 'rates.view', 'resource' => 'rates', 'action' => 'view'],
            ['name' => 'Create Rates', 'slug' => 'rates.create', 'resource' => 'rates', 'action' => 'create'],
            ['name' => 'Update Rates', 'slug' => 'rates.update', 'resource' => 'rates', 'action' => 'update'],
            ['name' => 'Delete Rates', 'slug' => 'rates.delete', 'resource' => 'rates', 'action' => 'delete'],
            
            // Collection permissions
            ['name' => 'View Collections', 'slug' => 'collections.view', 'resource' => 'collections', 'action' => 'view'],
            ['name' => 'Create Collections', 'slug' => 'collections.create', 'resource' => 'collections', 'action' => 'create'],
            ['name' => 'Update Collections', 'slug' => 'collections.update', 'resource' => 'collections', 'action' => 'update'],
            ['name' => 'Delete Collections', 'slug' => 'collections.delete', 'resource' => 'collections', 'action' => 'delete'],
            ['name' => 'Confirm Collections', 'slug' => 'collections.confirm', 'resource' => 'collections', 'action' => 'confirm'],
            
            // Payment permissions
            ['name' => 'View Payments', 'slug' => 'payments.view', 'resource' => 'payments', 'action' => 'view'],
            ['name' => 'Create Payments', 'slug' => 'payments.create', 'resource' => 'payments', 'action' => 'create'],
            ['name' => 'Update Payments', 'slug' => 'payments.update', 'resource' => 'payments', 'action' => 'update'],
            ['name' => 'Delete Payments', 'slug' => 'payments.delete', 'resource' => 'payments', 'action' => 'delete'],
            ['name' => 'Confirm Payments', 'slug' => 'payments.confirm', 'resource' => 'payments', 'action' => 'confirm'],
            
            // User management permissions
            ['name' => 'View Users', 'slug' => 'users.view', 'resource' => 'users', 'action' => 'view'],
            ['name' => 'Create Users', 'slug' => 'users.create', 'resource' => 'users', 'action' => 'create'],
            ['name' => 'Update Users', 'slug' => 'users.update', 'resource' => 'users', 'action' => 'update'],
            ['name' => 'Delete Users', 'slug' => 'users.delete', 'resource' => 'users', 'action' => 'delete'],
            
            // Report permissions
            ['name' => 'View Reports', 'slug' => 'reports.view', 'resource' => 'reports', 'action' => 'view'],
            ['name' => 'Export Reports', 'slug' => 'reports.export', 'resource' => 'reports', 'action' => 'export'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['slug' => $permission['slug']],
                $permission
            );
        }

        // Define roles
        $roles = [
            [
                'name' => 'Administrator',
                'slug' => 'admin',
                'description' => 'Full system access',
                'permissions' => Permission::all()->pluck('id')->toArray(),
            ],
            [
                'name' => 'Manager',
                'slug' => 'manager',
                'description' => 'Can manage collections, payments, and view reports',
                'permissions' => Permission::whereIn('resource', ['suppliers', 'products', 'collections', 'payments', 'reports'])
                    ->pluck('id')->toArray(),
            ],
            [
                'name' => 'Collector',
                'slug' => 'collector',
                'description' => 'Can create collections and view suppliers/products',
                'permissions' => Permission::whereIn('slug', [
                    'suppliers.view',
                    'products.view',
                    'rates.view',
                    'collections.view',
                    'collections.create',
                    'collections.update',
                ])->pluck('id')->toArray(),
            ],
            [
                'name' => 'Viewer',
                'slug' => 'viewer',
                'description' => 'Read-only access',
                'permissions' => Permission::where('action', 'view')->pluck('id')->toArray(),
            ],
        ];

        foreach ($roles as $roleData) {
            $permissions = $roleData['permissions'];
            unset($roleData['permissions']);

            $role = Role::firstOrCreate(
                ['slug' => $roleData['slug']],
                $roleData
            );

            $role->permissions()->sync($permissions);
        }

        $this->command->info('Roles and permissions seeded successfully!');
    }
}
