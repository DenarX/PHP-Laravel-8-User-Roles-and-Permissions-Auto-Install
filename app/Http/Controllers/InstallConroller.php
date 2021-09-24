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
