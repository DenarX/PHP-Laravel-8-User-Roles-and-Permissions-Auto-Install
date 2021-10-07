<?php

namespace Database\Seeders;

use App\Models\Product;
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
        Product::truncate();
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
            'product-list',
            'product-create',
            'product-edit',
            'product-delete',
        ];
        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create Products
        $r = Product::factory(8)->create();
        $r->each(function ($product, $key) {
            Permission::create(['name' => "productId-$product->id"]);
        });

        // Create roles
        $role = Role::create(['name' => 'Super Admin']);
        $role->syncPermissions($permissions);
        Role::create(['name' => 'Admin'])->givePermissionTo(array_diff($permissions, ['role-delete', 'user-delete']));
        Role::create(['name' => 'User'])->givePermissionTo(array_diff($permissions, ['user-create', 'user-edit', 'role-create', 'role-edit', 'role-delete', 'user-delete']));
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
