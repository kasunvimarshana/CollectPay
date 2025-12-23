<?php

namespace App\Http\Middleware;

use App\Services\AuthorizationService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    protected AuthorizationService $authService;
    
    public function __construct(AuthorizationService $authService)
    {
        $this->authService = $authService;
    }
    
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }
        
        if (!$this->authService->hasPermission($user, $permission)) {
            return response()->json([
                'message' => 'Unauthorized. Insufficient permissions.',
                'required_permission' => $permission,
            ], 403);
        }
        
        return $next($request);
    }
}
