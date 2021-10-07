<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Spatie\Permission\Models\Permission;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;
    function getPermissions($permission = [])
    {
        foreach (Permission::get() as $value) {
            $p = explode('-', $value->name);
            $value->name = 'productId' == $p[0] ? "#$p[1] " . Product::find($p[1])->name : $p[1];
            $permission[$p[0]][] = $value;
        }
        return $permission;
    }
    function getProductsByPermission($products = [])
    {
        $perm = auth()->user()->getAllPermissions()->pluck('name')->all();
        foreach ($perm as $key => $v) {
            $p = explode('-', $v);
            if ($p[0] == 'productId' && $p[1])  $products[] = $p[1];
        }
        return $products;
    }
}
