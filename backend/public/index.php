<?php

/**
 * PayMaster API Entry Point
 * 
 * Main entry point for all API requests.
 * Handles routing, authentication, and CORS.
 */

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', '1');

// Autoloader
require_once __DIR__ . '/../vendor/autoload.php';

// Load configuration
$config = require __DIR__ . '/../config/database.php';

// Initialize database connection
use App\Infrastructure\Database\DatabaseConnection;
DatabaseConnection::init($config['database']);

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Get request URI and method
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove /api prefix if present
$requestUri = preg_replace('#^/api#', '', $requestUri);

// Simple routing
try {
    // Authentication routes
    if ($requestUri === '/auth/login' && $requestMethod === 'POST') {
        $controller = new App\Presentation\Controllers\AuthController();
        $controller->login();
        exit;
    }
    
    if ($requestUri === '/auth/register' && $requestMethod === 'POST') {
        $controller = new App\Presentation\Controllers\AuthController();
        $controller->register();
        exit;
    }
    
    if ($requestUri === '/auth/me' && $requestMethod === 'GET') {
        $controller = new App\Presentation\Controllers\AuthController();
        $controller->me();
        exit;
    }
    
    if ($requestUri === '/auth/logout' && $requestMethod === 'POST') {
        $controller = new App\Presentation\Controllers\AuthController();
        $controller->logout();
        exit;
    }
    
    // Supplier routes
    if (preg_match('#^/suppliers$#', $requestUri) && $requestMethod === 'GET') {
        $controller = new App\Presentation\Controllers\SupplierController();
        $controller->index();
        exit;
    }
    
    if (preg_match('#^/suppliers$#', $requestUri) && $requestMethod === 'POST') {
        $controller = new App\Presentation\Controllers\SupplierController();
        $controller->store();
        exit;
    }
    
    if (preg_match('#^/suppliers/(\d+)$#', $requestUri, $matches) && $requestMethod === 'GET') {
        $controller = new App\Presentation\Controllers\SupplierController();
        $controller->show((int) $matches[1]);
        exit;
    }
    
    if (preg_match('#^/suppliers/(\d+)$#', $requestUri, $matches) && $requestMethod === 'PUT') {
        $controller = new App\Presentation\Controllers\SupplierController();
        $controller->update((int) $matches[1]);
        exit;
    }
    
    if (preg_match('#^/suppliers/(\d+)$#', $requestUri, $matches) && $requestMethod === 'DELETE') {
        $controller = new App\Presentation\Controllers\SupplierController();
        $controller->delete((int) $matches[1]);
        exit;
    }
    
    // Health check
    if ($requestUri === '/health' && $requestMethod === 'GET') {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => 'PayMaster API is running',
            'version' => '1.0.0',
            'timestamp' => date('Y-m-d H:i:s'),
        ]);
        exit;
    }
    
    // Route not found
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Route not found',
        'path' => $requestUri,
        'method' => $requestMethod,
    ]);
    
} catch (\Exception $e) {
    // Error handling
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error',
        'error' => $e->getMessage(),
    ]);
}
