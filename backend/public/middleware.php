<?php

declare(strict_types=1);

// Middleware Configuration

use Slim\App;

/** @var App $app */

// Parse JSON body
$app->addBodyParsingMiddleware();

// Add routing middleware
$app->addRoutingMiddleware();

// CORS Middleware
$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    
    $allowedOrigins = explode(',', getenv('CORS_ALLOWED_ORIGINS') ?: '*');
    $origin = $request->getHeaderLine('Origin');
    
    if (in_array($origin, $allowedOrigins) || in_array('*', $allowedOrigins)) {
        $response = $response
            ->withHeader('Access-Control-Allow-Origin', $origin ?: '*')
            ->withHeader('Access-Control-Allow-Methods', getenv('CORS_ALLOWED_METHODS') ?: 'GET, POST, PUT, DELETE, OPTIONS')
            ->withHeader('Access-Control-Allow-Headers', getenv('CORS_ALLOWED_HEADERS') ?: 'Content-Type, Authorization')
            ->withHeader('Access-Control-Max-Age', '3600');
    }
    
    return $response;
});

// Error middleware (should be last)
$errorMiddleware = $app->addErrorMiddleware(
    displayErrorDetails: getenv('APP_DEBUG') === 'true',
    logErrors: true,
    logErrorDetails: true
);
