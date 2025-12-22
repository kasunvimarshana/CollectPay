<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Domain Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for domain layer entities and business logic
    |
    */

    'entities' => [
        'user' => [
            'roles' => ['admin', 'manager', 'collector', 'viewer'],
            'default_role' => 'viewer',
        ],
        'supplier' => [
            'location_required' => false,
            'max_distance_km' => 100,
        ],
        'product' => [
            'units' => ['g', 'kg', 'l', 'ml', 'unit'],
            'default_unit' => 'kg',
        ],
        'payment' => [
            'types' => ['advance', 'partial', 'full'],
            'currency' => 'USD',
        ],
    ],

    'sync' => [
        'batch_size' => 100,
        'retry_attempts' => 3,
        'conflict_resolution' => 'server_wins', // 'server_wins', 'client_wins', 'last_write_wins'
    ],

    'offline' => [
        'max_queue_size' => 1000,
        'sync_interval_seconds' => 300, // 5 minutes
    ],
];
