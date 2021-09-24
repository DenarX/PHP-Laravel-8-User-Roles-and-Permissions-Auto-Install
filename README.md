# Laravel 8 User Roles and Permissions & Auto Instalation

## Manual

https://www.itsolutionstuff.com/post/laravel-8-user-roles-and-permissions-tutorialexample.html

### Install packages

composer create-project --prefer-dist laravel/laravel perm
composer require spatie/laravel-permission
composer require laravelcollective/html

```config/app.php
'providers' => [
	...
	Spatie\Permission\PermissionServiceProvider::class,
],
```

php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan migrate

```app/Models/User.php
use Spatie\Permission\Traits\HasRoles;
use Spatie\Permission\Traits\HasPermissions;
...
use HasApiTokens, HasFactory, Notifiable, HasRoles, HasPermissions;
```

```app/Http/Kernel.php
protected $routeMiddleware = [
    'role' => \Spatie\Permission\Middlewares\RoleMiddleware::class,
    'permission' => \Spatie\Permission\Middlewares\PermissionMiddleware::class,
    'role_or_permission' => \Spatie\Permission\Middlewares\RoleOrPermissionMiddleware::class,
]
```

composer require laravel/ui
php artisan ui bootstrap --auth
npm install && npm run dev

### Routes

```routes/web.php
<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\HomeController;
use App\Http\Controllers\InstallConroller;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
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

Auth::routes();

Route::get('/home', [HomeController::class, 'index'])->name('home');

Route::group(['middleware' => ['auth']], function () {
    Route::resource('roles', RoleController::class);
    Route::resource('users', UserController::class);
});
```

### Controllers

php artisan make:controller UserController

```UserController.php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Arr;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    function __construct()
    {
        $this->middleware('permission:user-list|user-create|user-edit|user-delete', ['only' => ['index', 'store']]);
        $this->middleware('permission:user-create', ['only' => ['create', 'store']]);
        $this->middleware('permission:user-edit', ['only' => ['edit', 'update']]);
        $this->middleware('permission:user-delete', ['only' => ['destroy']]);
    }
    public function index()
    {
        $users = User::orderBy('id', 'DESC')->paginate(5);
        $i = ($users->currentPage(-1) - 1) * $users->perPage();
        return view('users.index', compact('users', 'i'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $roles = Role::pluck('name', 'name')->all();
        return view('users.create', compact('roles'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'name' => 'required',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|same:confirm-password',
            'roles' => 'required'
        ]);

        $input = $request->all();
        $input['password'] = Hash::make($input['password']);

        $user = User::create($input);
        $user->assignRole($request->input('roles'));

        return redirect()->route('users.index')
            ->with('success', 'User created successfully');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $user = User::find($id);
        return view('users.show', compact('user'));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(User $user)
    {
        $roles = Role::pluck('name', 'name',)->all();
        $userRole = $user->roles->pluck('name', 'name')->all();
        $permission = Permission::get();
        $userPermissions = $user->permissions()->getResults()->pluck('id')->all();
        return view('users.edit', compact('user', 'roles', 'userRole', 'permission', 'userPermissions'));
    }
    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $this->validate($request, [
            'name' => 'required',
            'email' => 'required|email|unique:users,email,' . $id,
            'password' => 'same:confirm-password',
            'roles' => 'required'
        ]);

        $input = $request->all();
        if (!empty($input['password'])) {
            $input['password'] = Hash::make($input['password']);
        } else {
            $input = Arr::except($input, array('password'));
        }

        $user = User::find($id);
        $user->update($input);
        DB::table('model_has_roles')->where('model_id', $id)->delete();

        $user->assignRole($request->input('roles'));
        $user->syncPermissions($request->input('permission'));

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        User::find($id)->delete();
        return redirect()->route('users.index')->with('success', 'User deleted successfully');
    }
}

```

php artisan make:controller RoleController

```RoleController.php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    function __construct()
    {
        $this->middleware('permission:role-list|role-create|role-edit|role-delete', ['only' => ['index', 'store']]);
        $this->middleware('permission:role-create', ['only' => ['create', 'store']]);
        $this->middleware('permission:role-edit', ['only' => ['edit', 'update']]);
        $this->middleware('permission:role-delete', ['only' => ['destroy']]);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $roles = Role::orderBy('id', 'DESC')->paginate(5);
        $i = ($roles->currentPage(-1) - 1) * $roles->perPage();
        return view('roles.index', compact('roles', 'i'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $permission = Permission::get();
        return view('roles.create', compact('permission'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|unique:roles,name',
            'permission' => 'required',
        ]);

        $role = Role::create(['name' => $request->input('name')]);
        $role->syncPermissions($request->input('permission'));

        return redirect()->route('roles.index')
            ->with('success', 'Role created successfully');
    }
    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $role = Role::find($id);
        $rolePermissions = Permission::join("role_has_permissions", "role_has_permissions.permission_id", "=", "permissions.id")
            ->where("role_has_permissions.role_id", $id)
            ->get();

        return view('roles.show', compact('role', 'rolePermissions'));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(Role $role)
    {
        $permission = Permission::get();
        $rolePermissions = $role->permissions()->getResults()->pluck('id')->all();
        return view('roles.edit', compact('role', 'permission', 'rolePermissions'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $this->validate($request, [
            'name' => 'required',
            'permission' => 'required',
        ]);

        $role = Role::find($id);
        $role->name = $request->input('name');
        $role->save();

        $role->syncPermissions($request->input('permission'));

        return redirect()->route('roles.index')
            ->with('success', 'Role updated successfully');
    }
    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        DB::table("roles")->where('id', $id)->delete();
        return redirect()->route('roles.index')->with('success', 'Role deleted successfully');
    }
}

```

### Added custom functions to bootstrap app

```bootstrap\app.php
function testSql($query)
{
    $args = $query->getBindings();

    return preg_replace_callback(
        '/\?/',
        function ($match) use (&$args) {
            $val = array_shift($args);
            return is_int($val) ? (int) $val : "'$val'";
        },
        $query->toSql()
    );
}
function setEnvironmentValue(array $values)
{
    $envFile = app()->environmentFilePath();
    $str = file_get_contents($envFile);

    if (count($values) > 0) {
        foreach ($values as $envKey => $envValue) {

            $str .= "\n"; // In case the searched variable is in the last line without \n
            $keyPosition = strpos($str, "{$envKey}=");
            $endOfLinePosition = strpos($str, "\n", $keyPosition);
            $oldLine = substr($str, $keyPosition, $endOfLinePosition - $keyPosition);

            // If key does not exist, add it
            if (!$keyPosition || !$endOfLinePosition || !$oldLine) {
                $str .= "{$envKey}={$envValue}\n";
            } else {
                $str = str_replace($oldLine, "{$envKey}={$envValue}", $str);
            }
            $_ENV[$envKey] = $envValue;
            putenv("$envKey=$envValue");
        }
    }

    $str = substr($str, 0, -1);
    if (!file_put_contents($envFile, $str)) return false;
    return true;
}
```

### Create Seeder

php artisan make:seeder InitTableSeeder

```InitTableSeeder.php
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class InitTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints(); //DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        User::truncate();
        Role::truncate();
        DB::table('model_has_permissions')->truncate();
        DB::table('model_has_roles')->truncate();
        DB::table('role_has_permissions')->truncate();
        Permission::truncate();
        Schema::enableForeignKeyConstraints(); //DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        // Reset cached roles and permissions
        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
        // Create permissions
        $permissions = [
            'user-list',
            'user-create',
            'user-edit',
            'user-delete',
            'role-list',
            'role-create',
            'role-edit',
            'role-delete',
        ];
        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles
        $role = Role::create(['name' => 'Super Admin']);
        $role->syncPermissions($permissions);
        Role::create(['name' => 'Admin'])->givePermissionTo(array_diff($permissions, ['role-delete', 'user-delete']));
        Role::create(['name' => 'User'])->givePermissionTo(['user-list', 'role-list']);
        Role::create(['name' => 'Guest']);

        // Create Super Admin
        $user = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@gmail.com',
            'password' => bcrypt('123456')
        ]);
        $user->assignRole([$role->id]);
    }
}
```

```DatabaseSeeder.php
public function run()
    {
        // \App\Models\User::factory(10)->create();
        if (!env('APP_INSTALLED')) {
            $this->call([
                InitTableSeeder::class,
            ]);
            setEnvironmentValue(['APP_INSTALLED' => 'true']);
        } else {
            dd('Application have been installed, to reinstall remove APP_INSTALLED from .env');
        }
    }
```

### Create InstallConroller

php artisan make:controller InstallConroller

```InstallConroller.php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class InstallConroller extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function firstrun()
    {
        return view('firstrun');
    }
    public function install(Request $request)
    {
        $r = $this->validate($request, [
            'host' => 'required',
            'username' => 'required',
            'password' => 'required',
            'database' => 'required'
        ]);
        $env = [
            'DB_HOST' => $r['host'],
            'DB_USERNAME' => $r['username'],
            'DB_PASSWORD' => $r['password'],
            'DB_DATABASE' => $r['database'],
        ];
        setEnvironmentValue($env);
        return redirect('/install');
    }
}
```

### Create views

copy views to

resources\views\firstrun.blade.php

resources\views\layouts\app.blade.php
resources\views\layouts\header.blade.php
resources\views\layouts\footer.blade.php

resources\views\users\create.blade.php
resources\views\users\edit.blade.php
resources\views\users\index.blade.php
resources\views\users\show.blade.php

resources\views\roles\create.blade.php
resources\views\roles\edit.blade.php
resources\views\roles\index.blade.php
resources\views\roles\show.blade.php

npm run dev