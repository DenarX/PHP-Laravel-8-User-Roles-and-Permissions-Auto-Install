<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\HomeController;
use App\Http\Controllers\InstallConroller;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

if (env('APP_INSTALLED')) {
    Route::get('/', function () {
        return view('welcome');
    });
    Auth::routes();
    Route::get('/home', [HomeController::class, 'index'])->name('home');
    Route::group(['middleware' => ['auth']], function () {
        Route::resource('roles', RoleController::class);
        Route::resource('users', UserController::class);
        Route::resource('products', ProductController::class);
    });
} else {
    $envFile = app()->environmentFilePath();
    if (!file_exists($envFile)) {
        if (!file_exists($envFile . '.example')) {
            abort(502, 'File ".env.example" not found');
        }
        if (!@copy($envFile . '.example', $envFile)) {
            abort(503, 'File ".env.example" not found');
        }
        Artisan::call('key:generate');
    }
    Route::get('/install', function () {
        Artisan::call('migrate --seed');
        return redirect('/');
    });
    Route::post('/', [InstallConroller::class, 'install'])->name('install');
    Route::get('/', [InstallConroller::class, 'firstrun']);
    Route::fallback(function () {
        return redirect('/');
    });
}
