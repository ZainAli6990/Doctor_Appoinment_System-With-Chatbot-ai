<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Blocks every request whose authenticated user is not role = 'user' (patient).
 * Must run AFTER 'auth:sanctum' in the route middleware chain.
 */
class EnsureUserIsPatient
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || $request->user()->role !== 'user') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Patient account access only.',
            ], 403);
        }

        return $next($request);
    }
}
