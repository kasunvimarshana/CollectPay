<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AttributeBasedAccessControl
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $attribute  Format: "key:value" or just "key" to check existence
     */
    public function handle(Request $request, Closure $next, string $attribute): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!$request->user()->is_active) {
            return response()->json(['message' => 'Account is inactive.'], 403);
        }

        [$key, $value] = $this->parseAttribute($attribute);

        if (!$request->user()->hasUserAttribute($key, $value)) {
            return response()->json([
                'message' => "Unauthorized. Required attribute: {$attribute}"
            ], 403);
        }

        return $next($request);
    }

    private function parseAttribute(string $attribute): array
    {
        if (str_contains($attribute, ':')) {
            return explode(':', $attribute, 2);
        }

        return [$attribute, null];
    }
}
