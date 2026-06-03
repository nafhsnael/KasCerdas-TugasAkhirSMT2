<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
        ]);

        // Regular User
        User::updateOrCreate(
            ['email' => 'user@kascerdas.com'],
            [
                'name' => 'Demo User',
                'username' => 'demouser',
                'password' => Hash::make('user123'),
                'role' => 'user',
                'user_type' => 'mahasiswa',
                'is_active' => true,
            ]
        );
    }
}
