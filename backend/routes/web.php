<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

Route::get('/', function () {
    return view('welcome');
});

// Minimal named login route to satisfy auth redirects in development
Route::get('/login', function () {
    return view('welcome');
})->name('login');

// Google OAuth routes
Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);
Route::get('/api/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// Temporary route to seed database / admin user on production
Route::get('/run-seeder', function () {
    try {
        $exitCode = \Illuminate\Support\Facades\Artisan::call('db:seed');
        return response()->json([
            'success' => true,
            'message' => 'Database seeded successfully!',
            'exit_code' => $exitCode,
            'output' => \Illuminate\Support\Facades\Artisan::output(),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Seeding failed: ' . $e->getMessage(),
        ], 500);
    }
});
