<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class ThrottleApi
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  int  $maxAttempts
     * @param  int  $decayMinutes
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $maxAttempts = 60, $decayMinutes = 1)
    {
        $key = $this->resolveRequestSignature($request);

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);

            return response()->json([
                'success' => false,
                'message' => 'Too many requests. Please try again later.',
                'retry_after' => $seconds,
            ], 429)->header('Retry-After', $seconds);
        }

        RateLimiter::hit($key, $decayMinutes * 60);

        $response = $next($request);

        // Add rate limit headers
        $response->headers->add([
            'X-RateLimit-Limit' => $maxAttempts,
            'X-RateLimit-Remaining' => RateLimiter::remaining($key, $maxAttempts),
        ]);

        return $response;
    }

    /**
     * Resolve the request signature.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string
     */
    protected function resolveRequestSignature(Request $request)
    {
        if ($user = $request->user()) {
            return 'throttle:' . $user->id;
        }

        return 'throttle:' . $request->ip();
    }
}
