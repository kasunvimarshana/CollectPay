<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Add Request ID middleware to all API requests
        $middleware->append(\App\Http\Middleware\RequestIdMiddleware::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Add request ID to exception responses
        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response, \Throwable $exception, \Illuminate\Http\Request $request) {
            // Get request ID from request attributes
            $requestId = $request->attributes->get('request_id', 'N/A');
            
            // Add request ID to response header
            $response->headers->set('X-Request-ID', $requestId);
            
            // If it's a JSON response, add request ID to the body
            if ($response->headers->get('Content-Type') === 'application/json' || 
                str_starts_with($request->getPathInfo(), '/api/')) {
                
                $content = json_decode($response->getContent(), true);
                
                if (is_array($content)) {
                    $content['request_id'] = $requestId;
                    $response->setContent(json_encode($content));
                }
            }
            
            return $response;
        });
    })->create();
