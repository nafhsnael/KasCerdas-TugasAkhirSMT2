<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenance
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Retrieve maintenance mode flag from .env
        $isMaintenance = env('MAINTENANCE_MODE', false);

        if ($isMaintenance) {
            // Admin can bypass maintenance mode
            $user = $request->user();
            if ($user && $user->isAdmin()) {
                return $next($request);
            }

            // Whitelisted routes that should work during maintenance
            $whitelisted = [
                'api/user/profil', // profile view/update
                'api/user/profil/*', // any sub‑routes for profile
                'api/auth/logout', // logout
                'api/auth/me', // get authenticated user info
                'api/wallet/me', // wallet info after login
            ];
            foreach ($whitelisted as $path) {
                if ($request->is($path)) {
                    return $next($request);
                }
            }

            // Return a generic Service Unavailable response without extra text
            return response()->json([], 503);
        }

        return $next($request);
    }
}
