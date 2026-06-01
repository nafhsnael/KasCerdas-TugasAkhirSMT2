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
