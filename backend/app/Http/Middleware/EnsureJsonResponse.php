<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureJsonResponse
{
    /**
     * Ensure all requests expect JSON responses
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Force JSON accept header for API routes
        $request->headers->set('Accept', 'application/json');
        
        return $next($request);
    }
}
