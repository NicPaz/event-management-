<?php

namespace App\Providers;

use App\Actions\Guests\NormalizeGuestIdentity;
use App\Models\Event;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
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
        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

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

        RateLimiter::for('guest-identification', function (Request $request): array {
            $routeEvent = $request->route('event');
            $eventId = $routeEvent instanceof Event ? $routeEvent->getKey() : (string) $routeEvent;
            $phone = app(NormalizeGuestIdentity::class)
                ->phone($request->string('phone')->toString()) ?? $request->string('phone')->toString();

            return [
                Limit::perMinute(10)->by('ip:'.$eventId.'|'.$request->ip()),
                Limit::perMinute(5)->by('phone:'.$eventId.'|'.hash('sha256', $phone)),
            ];
        });
    }
}
