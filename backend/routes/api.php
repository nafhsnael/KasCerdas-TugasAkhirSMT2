<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfilController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\DebtController;
use App\Http\Controllers\Api\SavingController;
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
    Route::get('/budgets/{budget}', [BudgetController::class, 'show']);
    Route::put('/budgets/{budget}', [BudgetController::class, 'update']);
    Route::delete('/budgets/{budget}', [BudgetController::class, 'destroy']);

    // Debts Management
    Route::get('/debts', [DebtController::class, 'index']);
    Route::post('/debts', [DebtController::class, 'store']);
    Route::get('/debts/{debt}', [DebtController::class, 'show']);
    Route::put('/debts/{debt}', [DebtController::class, 'update']);
    Route::delete('/debts/{debt}', [DebtController::class, 'destroy']);

    // Savings Management
    Route::get('/savings', [SavingController::class, 'index']);
    Route::post('/savings', [SavingController::class, 'store']);
    Route::get('/savings/{saving}', [SavingController::class, 'show']);
    Route::put('/savings/{saving}', [SavingController::class, 'update']);
    Route::delete('/savings/{saving}', [SavingController::class, 'destroy']);
    Route::post('/savings/{saving}/deposit', [SavingController::class, 'deposit']);
    Route::post('/savings/{saving}/withdraw', [SavingController::class, 'withdraw']);


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

        // System Monitoring
        Route::prefix('monitoring')->group(function () {
            Route::get('/', [MonitoringController::class, 'index']);
            Route::get('/logs', [MonitoringController::class, 'logs']);
            Route::get('/transactions', [MonitoringController::class, 'transactions']);
            Route::get('/dashboard', [MonitoringController::class, 'dashboard']);
            Route::get('/database/tables', [MonitoringController::class, 'getTables']);
            Route::get('/database/tables/{table}', [MonitoringController::class, 'getTableData']);
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
