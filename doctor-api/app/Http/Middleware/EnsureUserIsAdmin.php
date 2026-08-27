<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Blocks every request whose authenticated user is not role = 'admin'.
 *
 * This must always run AFTER 'auth:sanctum' in the route middleware chain,
 * so $request->user() is guaranteed to be resolved when this checks role.
 * A logged-in 'user' role account gets a clean 403 here instead of being
 * able to reach any admin-management endpoint.
 */
class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access only.',
            ], 403);
        }

        return $next($request);
    }
}
