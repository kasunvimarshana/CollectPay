<?php

return [
    // Database configuration
    'database' => [
        'host' => getenv('DB_HOST') ?: 'localhost',
        'port' => getenv('DB_PORT') ?: '3306',
        'name' => getenv('DB_NAME') ?: 'trackvault',
        'user' => getenv('DB_USER') ?: 'root',
        'password' => getenv('DB_PASSWORD') ?: '',
        'charset' => 'utf8mb4',
    ],

    // Security configuration
    'security' => [
        'jwt_secret' => getenv('JWT_SECRET') ?: 'change-this-in-production',
        'jwt_algorithm' => 'HS256',
        'jwt_expiry' => 3600, // 1 hour
        'refresh_token_expiry' => 604800, // 7 days
        'encryption_key' => getenv('ENCRYPTION_KEY') ?: 'change-this-in-production-32-chars',
    ],

    // Application configuration
    'app' => [
        'name' => 'TrackVault',
        'env' => getenv('APP_ENV') ?: 'development',
        'debug' => getenv('APP_DEBUG') === 'true',
        'timezone' => 'UTC',
    ],

    // CORS configuration
    'cors' => [
        'allowed_origins' => explode(',', getenv('CORS_ALLOWED_ORIGINS') ?: '*'),
        'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With'],
        'max_age' => 86400,
    ],

    // Logging configuration
    'logging' => [
        'level' => getenv('LOG_LEVEL') ?: 'info',
        'path' => __DIR__ . '/../storage/logs',
    ],

    // Pagination defaults
    'pagination' => [
        'default_page_size' => 10,
        'max_page_size' => 100,
    ],
];
