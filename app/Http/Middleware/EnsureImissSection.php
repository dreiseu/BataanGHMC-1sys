<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restrict access to users belonging to the
 * "Integrated Management Information System Section" only.
 * Applied to Utilities module routes.
 */
class EnsureImissSection
{
    private const ALLOWED_SECTION = 'Integrated Management Information System Section';

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $sessionUser = $request->session()->get('soap_user_data');
        $sectionName = $sessionUser['SectionName'] ?? '';

        if ($sectionName !== self::ALLOWED_SECTION) {
            abort(403, 'Access restricted to IMISS personnel only.');
        }

        return $next($request);
    }
}
