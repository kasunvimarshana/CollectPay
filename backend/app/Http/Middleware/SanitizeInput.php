<?php

namespace App\Http\Middleware;

use App\Services\ValidationService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeInput
{
    protected ValidationService $validationService;
    
    public function __construct(ValidationService $validationService)
    {
        $this->validationService = $validationService;
    }
    
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check for SQL injection and XSS attempts in all input
        foreach ($request->all() as $key => $value) {
            if (is_string($value)) {
                if ($this->validationService->containsSqlInjection($value)) {
                    return response()->json([
                        'message' => 'Invalid input detected. Possible SQL injection attempt.',
                        'field' => $key,
                    ], 400);
                }
                
                if ($this->validationService->containsXss($value)) {
                    return response()->json([
                        'message' => 'Invalid input detected. Possible XSS attempt.',
                        'field' => $key,
                    ], 400);
                }
            }
        }
        
        return $next($request);
    }
}
