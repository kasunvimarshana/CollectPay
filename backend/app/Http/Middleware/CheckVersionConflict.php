<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckVersionConflict
{
    /**
     * Handle an incoming request to check for version conflicts
     * Implements optimistic locking for concurrent updates
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only check for UPDATE operations
        if (!in_array($request->method(), ['PUT', 'PATCH'])) {
            return $next($request);
        }

        // Get the model being updated from route parameters
        $model = $this->getModelFromRoute($request);
        
        if (!$model || !$this->hasVersionField($model)) {
            return $next($request);
        }

        // Check if client sent version information
        $clientVersion = $request->input('version');
        
        if ($clientVersion !== null) {
            $serverVersion = $model->version;
            
            // Version mismatch - potential conflict
            if ($clientVersion != $serverVersion) {
                return response()->json([
                    'success' => false,
                    'message' => 'Version conflict detected',
                    'error' => 'The record has been modified by another user',
                    'conflict' => true,
                    'data' => [
                        'client_version' => $clientVersion,
                        'server_version' => $serverVersion,
                        'current_data' => $model,
                    ]
                ], 409); // HTTP 409 Conflict
            }
        }

        return $next($request);
    }

    /**
     * Get the model instance from route parameters
     */
    protected function getModelFromRoute(Request $request)
    {
        $route = $request->route();
        
        if (!$route) {
            return null;
        }

        // Get model from route parameters
        // Laravel automatically binds route parameters to models
        $parameters = $route->parameters();
        
        foreach ($parameters as $parameter) {
            if (is_object($parameter) && method_exists($parameter, 'getTable')) {
                return $parameter;
            }
        }
        
        return null;
    }

    /**
     * Check if model has version field
     */
    protected function hasVersionField($model): bool
    {
        if (!$model) {
            return false;
        }
        
        // Check if the model has a version attribute (handles Eloquent models)
        return array_key_exists('version', $model->getAttributes());
    }
}
