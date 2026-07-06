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
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => function () use ($request) {
                    $sessionUser = $request->session()->get('soap_user_data');
                    if (!$sessionUser) return null;

                    // Always pull fresh role and permissions from DB
                    $authority = \Illuminate\Support\Facades\DB::table('UserAuthority')
                        ->where('BiometricID', $sessionUser['bioid'] ?? '')
                        ->first(['role', 'permissions']);

                    if ($authority) {
                        $sessionUser['role'] = $authority->role ?? 'user';
                        $permissions = $authority->permissions ?? '[]';
                        $sessionUser['permissions'] = is_string($permissions)
                            ? (json_decode($permissions, true) ?? [])
                            : ($permissions ?? []);
                    }

                    return $sessionUser;
                },
            ],
            'hospital_systems' => function () use ($request) {
                $sessionUser = $request->session()->get('soap_user_data');
                if (!$sessionUser) return [];

                $authority = \Illuminate\Support\Facades\DB::table('UserAuthority')
                    ->where('BiometricID', $sessionUser['bioid'] ?? '')
                    ->first(['permissions']);

                $permissions = [];
                if ($authority && $authority->permissions) {
                    $permissions = is_string($authority->permissions) ? json_decode($authority->permissions, true) : $authority->permissions;
                }
                
                $defaultSystems = [
                    'DiCe',
                    'EFMS Job Order Request System',
                    "Employee's Portal",
                    'Health & Wellness Clinic',
                    'Parking Management System',
                    'PGS Online System'
                ];

                return \Illuminate\Support\Facades\DB::table('hospital_systems')->get()
                    ->filter(function ($system) use ($defaultSystems, $permissions) {
                        return in_array($system->name, $defaultSystems) || in_array("system:{$system->id}", $permissions ?? []);
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
