<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfilController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\DiagnosticsController;

use App\Http\Controllers\Api\Admin\UserManagementController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\MonitoringController;
use App\Http\Controllers\Api\Admin\MaintenanceController;
use App\Http\Controllers\Api\Admin\SystemConfigController;

// Public auth routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes (Requires Sanctum & CheckMaintenance)
Route::middleware(['auth:sanctum', 'maintenance'])->group(function () {
    // Auth & Profile
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    Route::get('/user/profil', [ProfilController::class, 'show']);
    Route::put('/user/profil', [ProfilController::class, 'update']);

    // Wallet, Transactions, Budgets
    Route::get('/wallet/me', [WalletController::class, 'me']);
    Route::post('/wallets', [WalletController::class, 'createOrUpdate']);

    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::get('/transactions/summary', [TransactionController::class, 'summary']);
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::put('/transactions/{transaction}', [TransactionController::class, 'update']);
    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy']);

    Route::get('/budgets', [BudgetController::class, 'index']);
    Route::post('/budgets', [BudgetController::class, 'store']);

    // DEBUG ENDPOINTS (Remove in production!)
    Route::prefix('debug')->group(function () {
        Route::get('/user-data', [DiagnosticsController::class, 'checkUserData']);
        Route::get('/all-users', [DiagnosticsController::class, 'checkAllUsers']);
        Route::get('/transaction-issues', [DiagnosticsController::class, 'checkTransactionIssues']);
    });

    // Admin routes (Requires admin role)
    Route::middleware('is_admin')->prefix('admin')->group(function () {
        // User Management
        Route::get('/users', [UserManagementController::class, 'index']);
        Route::get('/users/{id}', [UserManagementController::class, 'show']);
        Route::put('/users/{id}', [UserManagementController::class, 'update']);
        Route::delete('/users/{id}', [UserManagementController::class, 'destroy']);

        // Category Management
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // Monitoring
        Route::prefix('monitoring')->group(function () {
            Route::get('/', [MonitoringController::class, 'index']);
            Route::get('/logs', [MonitoringController::class, 'logs']);
            Route::get('/transactions', [MonitoringController::class, 'transactions']);
            Route::get('/dashboard', [MonitoringController::class, 'dashboard']);
        });

        // Maintenance Control
        Route::prefix('maintenance')->group(function () {
            Route::get('/', [MaintenanceController::class, 'index']);
            Route::post('/', [MaintenanceController::class, 'store']);
            Route::delete('/', [MaintenanceController::class, 'destroy']);
        });

        // System Configuration
        Route::prefix('config')->group(function () {
            Route::get('/', [SystemConfigController::class, 'index']);
            Route::get('/{key}', [SystemConfigController::class, 'show']);
            Route::put('/{key}', [SystemConfigController::class, 'update']);
            Route::delete('/{key}', [SystemConfigController::class, 'destroy']);
            Route::post('/batch-update', [SystemConfigController::class, 'batchUpdate']);
        });
    });
});
