<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Sync Configuration
    |--------------------------------------------------------------------------
    */

    'batch_size' => env('SYNC_BATCH_SIZE', 100),
    'max_retries' => env('SYNC_MAX_RETRIES', 3),
    'conflict_strategy' => env('SYNC_CONFLICT_STRATEGY', 'server_wins'), // server_wins, client_wins, manual
    'enable_audit_logs' => env('SYNC_ENABLE_AUDIT_LOGS', true),

];
