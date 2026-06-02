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
        // Admin User
        User::updateOrCreate(
            ['email' => 'admin@kascerdas.com'],
            [
                'name' => 'System Admin',
                'username' => 'admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'user_type' => null,
                'is_active' => true,
            ]
        );

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
