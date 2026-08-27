<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Blocks every request whose authenticated user is not role = 'doctor'.
 * Must run AFTER 'auth:sanctum' in the route middleware chain.
 */
class EnsureUserIsDoctor
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || $request->user()->role !== 'doctor') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Doctor access only.',
            ], 403);
        }

        return $next($request);
    }
}
