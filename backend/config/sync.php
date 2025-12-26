<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Sync Configuration
    |--------------------------------------------------------------------------
    */
    
    // Maximum number of records per sync batch
    'batch_size' => env('SYNC_BATCH_SIZE', 100),
    
    // Conflict resolution strategy: 'server_wins', 'client_wins', 'latest_wins'
    'conflict_strategy' => env('SYNC_CONFLICT_STRATEGY', 'server_wins'),
    
    // Maximum retry attempts for failed sync operations
    'max_retry_attempts' => env('SYNC_MAX_RETRY_ATTEMPTS', 3),
    
    // Payload signing key for tamper detection
    'payload_signing_key' => env('PAYLOAD_ENCRYPTION_KEY'),
    
    // Entities that support synchronization
    'syncable_entities' => [
        'users',
        'suppliers',
        'products',
        'product_rates',
        'collections',
        'payments',
    ],
    
    // Sync priority order (lower = higher priority)
    'sync_priority' => [
        'users' => 1,
        'suppliers' => 2,
        'products' => 3,
        'product_rates' => 4,
        'collections' => 5,
        'payments' => 6,
    ],
    
    // Soft delete retention period in days
    'soft_delete_retention_days' => 90,
    
    // Enable detailed sync logging
    'enable_sync_logging' => env('SYNC_LOGGING_ENABLED', true),
];
