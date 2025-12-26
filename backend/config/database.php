<?php

/**
 * Database Configuration
 */

// Load environment variables from .env file if it exists
if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        if (!array_key_exists($name, $_ENV)) {
            $_ENV[$name] = $value;
            putenv("$name=$value");
        }
    }
}

return [
    'database' => [
        'host' => $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?: 'localhost',
        'port' => $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?: 3306,
        'database' => $_ENV['DB_DATABASE'] ?? getenv('DB_DATABASE') ?: 'paymaster',
        'username' => $_ENV['DB_USERNAME'] ?? getenv('DB_USERNAME') ?: 'root',
        'password' => $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?: '',
        'charset' => 'utf8mb4',
    ],
];
