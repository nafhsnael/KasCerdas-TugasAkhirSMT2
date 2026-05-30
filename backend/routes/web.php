<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Minimal named login route to satisfy auth redirects in development
Route::get('/login', function () {
    return view('welcome');
})->name('login');
