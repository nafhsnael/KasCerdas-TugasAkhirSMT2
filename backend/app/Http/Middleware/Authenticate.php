<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Handle an unauthenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  array  $guards
     * @return never
     *
     * @throws \Illuminate\Auth\AuthenticationException
     */
    protected function unauthenticated($request, array $guards)
    {
        if ($request->is('api/*')) {
            // Always return JSON 401 for API routes, even if Accept header is missing.
            abort(response()->json(['message' => 'Unauthenticated.'], 401));
        }

        parent::unauthenticated($request, $guards);
    }
}
