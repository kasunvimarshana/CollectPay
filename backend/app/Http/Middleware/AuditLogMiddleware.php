<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AuditLogMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log if user is authenticated and request was successful
        if (auth()->check() && $response->isSuccessful()) {
            $this->logRequest($request, $response);
        }

        return $response;
    }

    /**
     * Log the request
     */
    private function logRequest(Request $request, Response $response): void
    {
        try {
            // Determine the action type
            $action = $this->determineAction($request);

            // Skip if no significant action
            if (! $action) {
                return;
            }

            // Determine auditable entity
            $auditable = $this->determineAuditable($request);

            AuditLog::create([
                'user_id' => auth()->id(),
                'action' => $action,
                'auditable_type' => $auditable['type'] ?? null,
                'auditable_id' => $auditable['id'] ?? null,
                'old_values' => $auditable['old_values'] ?? null,
                'new_values' => $auditable['new_values'] ?? null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (\Exception $e) {
            // Log error but don't fail the request
            Log::error('Audit log error: '.$e->getMessage());
        }
    }

    /**
     * Determine the action type from the request
     */
    private function determineAction(Request $request): ?string
    {
        $method = $request->method();

        // Skip read operations
        if ($method === 'GET') {
            return null;
        }

        return match ($method) {
            'POST' => 'created',
            'PUT', 'PATCH' => 'updated',
            'DELETE' => 'deleted',
            default => null,
        };
    }

    /**
     * Determine the auditable entity
     */
    private function determineAuditable(Request $request): array
    {
        $path = $request->path();
        $segments = explode('/', $path);

        // Try to extract entity type and ID from path
        // Format: api/entity/{id}
        if (count($segments) >= 3) {
            $entityType = $segments[1];
            $entityId = is_numeric($segments[2]) ? $segments[2] : null;

            return [
                'type' => $this->normalizeEntityType($entityType),
                'id' => $entityId,
                'new_values' => $request->except(['password', 'password_confirmation']),
            ];
        }

        return [];
    }

    /**
     * Normalize entity type to model class
     */
    private function normalizeEntityType(string $type): ?string
    {
        $mapping = [
            'users' => 'App\Models\User',
            'roles' => 'App\Models\Role',
            'suppliers' => 'App\Models\Supplier',
            'products' => 'App\Models\Product',
            'rates' => 'App\Models\Rate',
            'collections' => 'App\Models\Collection',
            'payments' => 'App\Models\Payment',
        ];

        return $mapping[$type] ?? null;
    }
}
