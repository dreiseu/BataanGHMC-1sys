<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Memoize authority to prevent duplicate queries on every request
        static $authorityCache = null;
        
        $getAuthority = function ($bioid) use (&$authorityCache) {
            if (!$bioid) return null;
            if ($authorityCache !== null) return $authorityCache;
            
            $authorityCache = \Illuminate\Support\Facades\DB::table('UserAuthority')
                ->where('BiometricID', $bioid)
                ->first(['role', 'permissions']);
                
            return $authorityCache;
        };

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => function () use ($request, $getAuthority) {
                    $sessionUser = $request->session()->get('soap_user_data');
                    if (!$sessionUser) return null;

                    // Pull role and permissions from memoized DB query
                    $authority = $getAuthority($sessionUser['bioid'] ?? '');

                    if ($authority) {
                        $sessionUser['role'] = $authority->role ?? 'user';
                        $permissions = $authority->permissions ?? '[]';
                        $sessionUser['permissions'] = is_string($permissions)
                            ? (json_decode($permissions, true) ?? [])
                            : ($permissions ?? []);
                    }

                    // Fix for slow page loads on existing sessions: Strip out the bloated base64 avatar string
                    if (isset($sessionUser['avatar']) && str_starts_with($sessionUser['avatar'], 'data:image')) {
                        $sessionUser['avatar'] = route('user.avatar', ['bioid' => $sessionUser['bioid']]);
                        // Update the actual session so we don't have to deserialize it on the backend every time
                        $request->session()->put('soap_user_data', $sessionUser);
                    }

                    return $sessionUser;
                },
            ],
            'hospital_systems' => function () use ($request, $getAuthority) {
                $sessionUser = $request->session()->get('soap_user_data');
                if (!$sessionUser) return [];

                $authority = $getAuthority($sessionUser['bioid'] ?? '');

                $permissions = [];
                if ($authority && $authority->permissions) {
                    $permissions = is_string($authority->permissions) ? json_decode($authority->permissions, true) : $authority->permissions;
                }
                
                $systemsArray = \Illuminate\Support\Facades\Cache::remember('hospital_systems_array_v2', now()->addHours(24), function () {
                    return \App\Models\HospitalSystem::all()->toArray();
                });
                
                $systems = collect($systemsArray);
                
                return $systems->filter(function ($system) use ($permissions) {
                        return $system['is_default'] || in_array("system:{$system['id']}", $permissions ?? []);
                    })->values();
            },
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'toast' => function () use ($request) {
                    $toast = $request->session()->get('toast');
                    if (is_array($toast)) {
                        $toast['id'] = uniqid();
                    }
                    return $toast;
                },
            ],
        ];
    }
}
