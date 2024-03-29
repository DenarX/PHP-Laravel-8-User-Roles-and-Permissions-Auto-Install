<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to the "home" route for your application.
     *
     * This is used by Laravel authentication to redirect users after login.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * The controller namespace for the application.
     *
     * When present, controller route declarations will automatically be prefixed with this namespace.
     *
     * @var string|null
     */
    // protected $namespace = 'App\\Http\\Controllers';

    /**
     * Define your route model bindings, pattern filters, etc.
     *
     * @return void
     */
    public function boot()
    {
        if (!env('APP_INSTALLED')) {
            $envFile = app()->environmentFilePath();
            if (!file_exists($envFile)) {
                abort_unless(file_exists($envFile . '.example'), 502, 'File ".env.example" not found');
                abort_unless(@copy($envFile . '.example', $envFile), 503, 'File ".env.example" not found');
                Artisan::call('key:generate');
            }
            Route::get('/install', function () {
                Artisan::call('migrate --seed');
                return redirect('/');
            });
            Route::post('/', function () {
                $r = validator(request()->all(), [
                    'host' => 'required',
                    'username' => 'required',
                    'password' => 'required',
                    'database' => 'required'
                ])->validate();
                $env = [
                    'DB_HOST' => $r['host'],
                    'DB_USERNAME' => $r['username'],
                    'DB_PASSWORD' => $r['password'],
                    'DB_DATABASE' => $r['database'],
                ];
                setEnvironmentValue($env);
                return redirect('/install');
            })->name('install');
            Route::get('/', function () {
                return '
                <html lang="en">
        
                <head>
                    <meta charset="utf-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>First run installation</title>
                    <link rel="dns-prefetch" href="https://fonts.gstatic.com">
                    <link href="https://fonts.googleapis.com/css?family=Raleway:300,400,600" rel="stylesheet" type="text/css">
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.2/dist/css/bootstrap.min.css" rel="stylesheet">
                </head>
        
                <body>
                    <div class="container py-4">
                        <div class="row justify-content-center">
                            <div class="col-sm-11 col-md-9 col-lg-7 col-xl-6 col-xxl-5">
                                <div class="card">
                                    <div class="card-header">First run installation</div>
                                    <div class="card-body">
                                        <legend>Database setup</legend>
                                        <form method="POST" action>
                                            <div class="form-floating mb-3">
                                                <input name="host" type="text" class="form-control" id="host" placeholder="127.0.0.1" required autofocus>
                                                <label for="host">Host</label>
                                            </div>
                                            <div class="form-floating mb-3">
                                                <input name="username" type="text" class="form-control" id="username" placeholder="1@1.com" required autocomplete="username">
                                                <label for="username">User</label>
                                            </div>
                                            <div class="form-floating mb-3">
                                                <input name="password" type="password" class="form-control" id="password" placeholder="password" required autocomplete="password">
                                                <label for="password">Password</label>
                                            </div>
                                            <div class="form-floating mb-3">
                                                <input name="database" type="text" class="form-control form-control-sm" id="database" placeholder="db_name" required>
                                                <label for="database">Database name</label>
                                            </div>
                                            <div class="text-center">
                                                <button type="submit" class="btn btn-primary center">Install</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </body>  
            </html>
                        ';
            });
            Route::fallback(function () {
                return redirect('/');
            });
            return;
        }

        $this->configureRateLimiting();
        $this->routes(function () {
            Route::prefix('api')
                ->middleware('api')
                ->namespace($this->namespace)
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->namespace($this->namespace)
                ->group(base_path('routes/web.php'));
        });
    }

    /**
     * Configure the rate limiters for the application.
     *
     * @return void
     */
    protected function configureRateLimiting()
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by(optional($request->user())->id ?: $request->ip());
        });
    }
}
