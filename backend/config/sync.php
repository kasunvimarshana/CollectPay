<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Sync Configuration
    |--------------------------------------------------------------------------
    */

    'batch_size' => env('SYNC_BATCH_SIZE', 100),
    
    'conflict_strategy' => env('SYNC_CONFLICT_STRATEGY', 'server_wins'),
    
    'max_retry_attempts' => 3,
    
    'retry_delay' => 5, // seconds
];
