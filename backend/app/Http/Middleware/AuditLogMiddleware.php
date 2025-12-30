<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Infrastructure\Logging\AuditLogger;
use Symfony\Component\HttpFoundation\Response;

class AuditLogMiddleware
{
    public function __construct(
        private readonly AuditLogger $auditLogger
    ) {}

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log successful state-changing operations
        if ($response->isSuccessful() && in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            $this->logRequest($request, $response);
        }

        return $response;
    }

    private function logRequest(Request $request, Response $response): void
    {
        $path = $request->path();
        $method = $request->method();
        
        // Extract entity type and ID from path
        $entityInfo = $this->extractEntityInfo($path, $method);
        
        if ($entityInfo) {
            [$entityType, $entityId, $action] = $entityInfo;
            
            $data = $request->all();
            unset($data['password']); // Don't log passwords
            
            if ($action === 'create') {
                $this->auditLogger->logCreate($entityType, $entityId ?? 'pending', $data);
            } elseif ($action === 'update') {
                $this->auditLogger->logUpdate($entityType, $entityId, [], $data);
            } elseif ($action === 'delete') {
                $this->auditLogger->logDelete($entityType, $entityId, $data);
            }
        }
    }

    private function extractEntityInfo(string $path, string $method): ?array
    {
        // Match patterns like api/v1/suppliers/uuid or api/v1/collections
        if (preg_match('#api/v1/(\w+)(?:/([a-f0-9-]+))?#', $path, $matches)) {
            $entityType = $matches[1];
            $entityId = $matches[2] ?? null;
            
            $action = match($method) {
                'POST' => 'create',
                'PUT', 'PATCH' => 'update',
                'DELETE' => 'delete',
                default => null
            };
            
            return [$entityType, $entityId, $action];
        }
        
        return null;
    }
}
