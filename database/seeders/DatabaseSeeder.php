<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // \App\Models\User::factory(10)->create();
        if (!env('APP_INSTALLED')) {
            $this->call([InitTableSeeder::class]);
            setEnvironmentValue(['APP_INSTALLED' => 'true']);
        } else {
            dd('Application have been installed, to reinstall remove APP_INSTALLED from .env');
        }
    }
}
