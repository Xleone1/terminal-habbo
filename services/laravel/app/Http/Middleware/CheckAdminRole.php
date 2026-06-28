<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminRole
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->rank >= 7) {
            return $next($request);
        }

        return response()->json([
            'message' => 'No autorizado. Se requieren permisos de administrador.',
        ], 403);
    }
}
