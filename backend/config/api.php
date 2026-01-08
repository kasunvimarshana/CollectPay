<?php

return [
    /*
    |--------------------------------------------------------------------------
    | API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration values for API behavior and limits
    |
    */

    // Pagination
    'pagination' => [
        'default_per_page' => env('API_DEFAULT_PER_PAGE', 15),
        'max_per_page' => env('API_MAX_PER_PAGE', 100),
    ],

    // Rate Limiting
    'rate_limit' => [
        // Default rate limit for API endpoints (requests per minute)
        'default' => [
            'limit' => env('API_RATE_LIMIT', 60),
            'decay_minutes' => env('API_RATE_LIMIT_DECAY', 1),
        ],

        // Stricter rate limit for authentication endpoints
        'auth' => [
            'limit' => env('API_AUTH_RATE_LIMIT', 5),
            'decay_minutes' => env('API_AUTH_RATE_LIMIT_DECAY', 1),
        ],

        // Rate limit for reporting endpoints (can be resource intensive)
        'reports' => [
            'limit' => env('API_REPORTS_RATE_LIMIT', 30),
            'decay_minutes' => env('API_REPORTS_RATE_LIMIT_DECAY', 1),
        ],
    ],

    // Caching
    'cache' => [
        // Cache TTL for frequently accessed data (in seconds)
        'suppliers' => env('CACHE_SUPPLIERS_TTL', 3600), // 1 hour
        'products' => env('CACHE_PRODUCTS_TTL', 3600), // 1 hour
        'rates' => env('CACHE_RATES_TTL', 1800), // 30 minutes
        'reports' => env('CACHE_REPORTS_TTL', 600), // 10 minutes
    ],

    // Query Limits
    'query_limits' => [
        'max_date_range_days' => env('API_MAX_DATE_RANGE_DAYS', 365),
        'max_export_records' => env('API_MAX_EXPORT_RECORDS', 10000),
    ],

    // Response
    'response' => [
        'include_debug_info' => env('API_DEBUG_INFO', false),
        'pretty_print' => env('API_PRETTY_PRINT', false),
    ],

    // Version
    'version' => env('API_VERSION', '1.0.0'),

    // API Documentation
    'docs' => [
        'enabled' => env('API_DOCS_ENABLED', true),
        'path' => env('API_DOCS_PATH', '/api/documentation'),
    ],
];
