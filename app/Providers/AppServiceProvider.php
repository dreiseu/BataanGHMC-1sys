<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (app()->runningInConsole() === false && !request()->isSecure()) {
            config(['session.secure' => false]);
        }

        $this->configureDefaults();

        \Illuminate\Support\Facades\Auth::provider('soap', function ($app, array $config) {
            return new \App\Auth\SoapUserProvider();
        });

        // Log slow queries (> 2 seconds) to find the cause of 30s timeout
        \Illuminate\Support\Facades\DB::listen(function ($query) {
            if ($query->time > 2000) {
                \Illuminate\Support\Facades\Log::warning("Slow query ({$query->time}ms): {$query->sql}", $query->bindings);
            }
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        Carbon::serializeUsing(function ($date) {
            return $date->timezone(config('app.timezone'))->toIso8601String();
        });

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
