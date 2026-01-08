<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

/**
 * Rate Limiting Middleware
 * Prevents abuse and brute force attacks
 */
class RateLimitMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $limit = '60', string $decayMinutes = '1'): Response
    {
        $key = $this->resolveRequestSignature($request);

        if (RateLimiter::tooManyAttempts($key, (int) $limit)) {
            return response()->json([
                'success' => false,
                'message' => 'Too many requests. Please try again later.',
                'retry_after' => RateLimiter::availableIn($key),
            ], 429);
        }

        RateLimiter::hit($key, (int) $decayMinutes * 60);

        $response = $next($request);

        return $this->addHeaders(
            $response,
            (int) $limit,
            RateLimiter::retriesLeft($key, (int) $limit)
        );
    }

    /**
     * Resolve request signature.
     */
    protected function resolveRequestSignature(Request $request): string
    {
        // Use user ID if authenticated, otherwise use IP
        if ($user = $request->user()) {
            return sprintf(
                'rate_limit:%s:%s',
                $user->id,
                $request->fingerprint()
            );
        }

        return sprintf(
            'rate_limit:ip:%s:%s',
            $request->ip(),
            $request->fingerprint()
        );
    }

    /**
     * Add rate limit headers to response.
     */
    protected function addHeaders(Response $response, int $limit, int $remaining): Response
    {
        $response->headers->add([
            'X-RateLimit-Limit' => $limit,
            'X-RateLimit-Remaining' => max(0, $remaining),
        ]);

        return $response;
    }
}
