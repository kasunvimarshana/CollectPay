<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RequestIdMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Generate a unique request ID for each request and add it to:
     * - Request context (for logging)
     * - Response headers (for client-side tracking)
     * - Log context (for debugging)
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if request already has an ID (from client or proxy)
        $requestId = $request->header('X-Request-ID');
        
        // If no ID provided, generate a new one
        if (empty($requestId)) {
            $requestId = $this->generateRequestId();
        }
        
        // Store request ID in request attributes for access throughout the request lifecycle
        $request->attributes->set('request_id', $requestId);
        
        // Share with logging context
        if (function_exists('config') && config('logging.include_request_id', true)) {
            logger()->withContext(['request_id' => $requestId]);
        }
        
        // Process the request
        $response = $next($request);
        
        // Add request ID to response headers
        $response->headers->set('X-Request-ID', $requestId);
        
        return $response;
    }
    
    /**
     * Generate a unique request ID in a format similar to Cloudflare Ray IDs
     * Format: XXXX:XXXXXX:XXXXXX:XXXXXXX:XXXXXXXX
     * 
     * @return string
     */
    protected function generateRequestId(): string
    {
        // Generate segments with varying lengths (4, 6, 6, 7, 8 hex characters)
        $segments = [
            $this->generateHex(4),
            $this->generateHex(6),
            $this->generateHex(6),
            $this->generateHex(7),
            $this->generateHex(8),
        ];
        
        return strtoupper(implode(':', $segments));
    }
    
    /**
     * Generate a random hexadecimal string of specified length
     * 
     * @param int $length
     * @return string
     */
    protected function generateHex(int $length): string
    {
        $bytes = ceil($length / 2);
        $hex = bin2hex(random_bytes((int) $bytes));
        return substr($hex, 0, $length);
    }
}
