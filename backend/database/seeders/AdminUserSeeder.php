<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin User
        User::updateOrCreate(
            ['email' => 'admin@kascerdas.com'],
            [
                'name' => 'Admin KasCerdas',
                'username' => 'admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'user_type' => null,
                'is_active' => true,
            ]
        );
    }
}
