<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Permissions Configuration - RBAC & ABAC
    |--------------------------------------------------------------------------
    |
    | Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC)
    | configuration for fine-grained authorization
    |
    */

    'roles' => [
        'admin' => [
            'permissions' => ['*'], // Full access
            'description' => 'Full system access',
        ],
        'manager' => [
            'permissions' => [
                'users.view',
                'users.create',
                'users.update',
                'suppliers.view',
                'suppliers.create',
                'suppliers.update',
                'suppliers.delete',
                'collections.view',
                'collections.create',
                'collections.update',
                'collections.delete',
                'payments.view',
                'payments.create',
                'payments.update',
                'payments.delete',
                'reports.view',
            ],
            'description' => 'Manage suppliers, collections, and payments',
        ],
        'collector' => [
            'permissions' => [
                'suppliers.view',
                'suppliers.create',
                'collections.view',
                'collections.create',
                'collections.update.own',
                'payments.view',
                'payments.create',
            ],
            'description' => 'Record collections and payments',
        ],
        'viewer' => [
            'permissions' => [
                'suppliers.view',
                'collections.view',
                'payments.view',
            ],
            'description' => 'Read-only access',
        ],
    ],

    'permissions' => [
        'users.view',
        'users.create',
        'users.update',
        'users.delete',
        'suppliers.view',
        'suppliers.create',
        'suppliers.update',
        'suppliers.delete',
        'collections.view',
        'collections.create',
        'collections.update',
        'collections.update.own',
        'collections.delete',
        'payments.view',
        'payments.create',
        'payments.update',
        'payments.delete',
        'reports.view',
        'reports.export',
    ],

    // ABAC Attributes for fine-grained access control
    'attributes' => [
        'ownership' => [
            'enabled' => true,
            'resources' => ['collections', 'payments'],
        ],
        'location' => [
            'enabled' => true,
            'max_distance_km' => 50,
        ],
        'time' => [
            'enabled' => false,
            'working_hours' => ['09:00', '18:00'],
        ],
    ],
];
