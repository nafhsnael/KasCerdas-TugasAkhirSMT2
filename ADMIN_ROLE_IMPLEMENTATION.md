# 🔐 Admin Role Implementation Guide - KasCerdas

> Panduan lengkap implementasi Admin Role dengan role "Super" di KasCerdas (Laravel Backend + React TypeScript Frontend)

---

## 📋 Daftar Isi
1. [Backend Architecture](#backend-architecture)
2. [Frontend Architecture](#frontend-architecture)
3. [Setup & Implementation](#setup--implementation)
4. [Fitur-Fitur Admin](#fitur-fitur-admin)

---

## Backend Architecture

### 🎯 Struktur Sistem Admin Backend

```
Backend (Laravel)
├── app/
│   ├── Models/
│   │   └── User.php (dengan method isAdmin())
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── AuthController.php (Login/Register)
│   │   │       └── Admin/
│   │   │           ├── UserManagementController.php (CRUD User)
│   │   │           ├── MonitoringController.php (Monitor Transaksi & Logs)
│   │   │           ├── MaintenanceController.php (Maintenance Mode)
│   │   │           ├── SystemConfigController.php (System Settings) ⭐ NEW
│   │   │           └── TransactionReportController.php (Laporan Transaksi) ⭐ NEW
│   │   │
│   │   └── Middleware/
│   │       ├── IsAdmin.php (Proteksi admin routes)
│   │       ├── CheckMaintenance.php (Maintenance mode check)
│   │       └── RoleMiddleware.php (Role-based access)
│   │
│   └── Models/
│       ├── User.php
│       ├── Transaction.php
│       ├── ActivityLog.php
│       └── SystemConfig.php (untuk system settings) ⭐ NEW
│
├── routes/
│   └── api.php (Admin routes dengan middleware 'is_admin')
│
└── database/
    └── migrations/
        └── create_system_configs_table.php ⭐ NEW
```

### 🔑 Key Features

| Feature | Implementasi | Status |
|---------|--------------|--------|
| **Manajemen Pengguna** | CRUD User (All Users) | ✅ Done |
| **Monitor Transaksi** | View All Transactions | ✅ Done (dapat ditingkatkan) |
| **Kontrol Sistem** | Maintenance Mode & Settings | ✅ Done (perlu ditambah settings) |
| **Activity Logging** | Log semua aksi admin | ✅ Done |
| **Role-based Access** | Middleware `is_admin` | ✅ Done |

---

## 📝 Backend Implementation Details

### 1️⃣ User Model (Existing)

```php
<?php
// app/Models/User.php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role',        // 'user' | 'admin'
        'user_type',   // 'umkm' | 'masyarakat_umum' | 'mahasiswa' (null untuk admin)
        'is_active',
    ];

    /**
     * Check if user is admin with "Super" access level
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is active and admin
     */
    public function isActiveAdmin(): bool
    {
        return $this->isAdmin() && $this->is_active;
    }

    // Relations
    public function transactions() {
        return $this->hasMany(Transaction::class);
    }

    public function activityLogs() {
        return $this->hasMany(ActivityLog::class);
    }
}
```

### 2️⃣ IsAdmin Middleware (Existing)

```php
<?php
// app/Http/Middleware/IsAdmin.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Admin access required.',
                'error_code' => 'ADMIN_REQUIRED'
            ], 403);
        }

        return $next($request);
    }
}
```

### 3️⃣ User Management Controller (Existing - Enhanced)

```php
<?php
// app/Http/Controllers/Api/Admin/UserManagementController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    /**
     * GET /api/admin/users
     * List semua pengguna dengan filter
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Search by name, email, username
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        // Filter by user type
        if ($request->filled('user_type')) {
            $query->where('user_type', $request->input('user_type'));
        }

        // Filter by status
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->input('is_active') === 'true');
        }

        $users = $query->orderBy('created_at', 'desc')
                       ->paginate($request->input('per_page', 10));

        return response()->json([
            'success' => true,
            'message' => 'Daftar user berhasil diambil',
            'data' => $users
        ]);
    }

    /**
     * GET /api/admin/users/{id}
     * Ambil detail user
     */
    public function show($id)
    {
        $user = User::with(['transactions', 'activityLogs'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail user berhasil diambil',
            'data' => $user
        ]);
    }

    /**
     * PUT /api/admin/users/{id}
     * Edit data user
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 
                       Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', 'in:user,admin'],
            'user_type' => ['nullable', 'required_if:role,user', 
                           'in:umkm,masyarakat_umum,mahasiswa'],
            'is_active' => ['required', 'boolean'],
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'user_type' => $validated['role'] === 'admin' ? null : $validated['user_type'],
            'is_active' => $validated['is_active'],
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Admin Update User',
            'model_type' => User::class,
            'model_id' => $user->id,
            'ip_address' => $request->ip(),
            'level' => 'info',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil diperbarui',
            'data' => $user
        ]);
    }

    /**
     * DELETE /api/admin/users/{id}
     * Hapus user
     */
    public function destroy(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Prevent deleting the authenticated admin
        if ($user->id === $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus akun sendiri',
            ], 422);
        }

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Admin Delete User',
            'model_type' => User::class,
            'model_id' => $user->id,
            'ip_address' => $request->ip(),
            'level' => 'warning',
        ]);

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dihapus',
        ]);
    }
}
```

### 4️⃣ Monitoring Controller - Enhanced

**GET /api/admin/monitoring**
- Statistik sistem (total user, transaksi, error logs)
- User breakdown by type
- System health status

**GET /api/admin/monitoring/logs**
- Activity logs dari semua user
- Filter by level (error, warning, info)
- Search functionality

**GET /api/admin/monitoring/transactions** ⭐ NEW
- Lihat semua transaksi dari semua user
- Filter by user, date range, type (income/expense)
- Summary statistik transaksi

```php
<?php
// Enhanced MonitoringController methods

public function transactions(Request $request)
{
    $query = Transaction::with(['user', 'wallet'])
        ->select('transactions.*');

    // Filter by user
    if ($request->filled('user_id')) {
        $query->where('user_id', $request->input('user_id'));
    }

    // Filter by date range
    if ($request->filled('start_date')) {
        $query->where('date', '>=', $request->input('start_date'));
    }

    if ($request->filled('end_date')) {
        $query->where('date', '<=', $request->input('end_date'));
    }

    // Filter by type
    if ($request->filled('type')) {
        $query->where('type', $request->input('type'));
    }

    // Filter by category
    if ($request->filled('category')) {
        $query->where('category', $request->input('category'));
    }

    $transactions = $query->orderBy('date', 'desc')
                          ->paginate($request->input('per_page', 15));

    // Calculate summary
    $totalIncome = Transaction::where('type', 'income')
        ->when($request->filled('start_date'), 
               fn($q) => $q->where('date', '>=', $request->input('start_date')))
        ->sum('amount');

    $totalExpense = Transaction::where('type', 'expense')
        ->when($request->filled('start_date'), 
               fn($q) => $q->where('date', '>=', $request->input('start_date')))
        ->sum('amount');

    return response()->json([
        'success' => true,
        'message' => 'Transaksi semua user berhasil diambil',
        'data' => $transactions,
        'summary' => [
            'total_income' => $totalIncome,
            'total_expense' => $totalExpense,
            'net' => $totalIncome - $totalExpense
        ]
    ]);
}
```

### 5️⃣ Maintenance Controller (Existing)

```php
<?php
// app/Http/Controllers/Api/Admin/MaintenanceController.php

/**
 * GET /api/admin/maintenance
 * Cek status maintenance mode
 */
public function index()
{
    $status = Cache::get('maintenance_mode', false);

    return response()->json([
        'success' => true,
        'data' => ['maintenance_active' => $status]
    ]);
}

/**
 * POST /api/admin/maintenance
 * Aktifkan maintenance mode
 */
public function store(Request $request)
{
    Cache::put('maintenance_mode', true);

    ActivityLog::create([
        'user_id' => $request->user()->id,
        'action' => 'Activate Maintenance Mode',
        'ip_address' => $request->ip(),
        'level' => 'warning',
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Maintenance mode activated',
        'data' => ['maintenance_active' => true]
    ]);
}

/**
 * DELETE /api/admin/maintenance
 * Nonaktifkan maintenance mode
 */
public function destroy(Request $request)
{
    Cache::forget('maintenance_mode');

    ActivityLog::create([
        'user_id' => $request->user()->id,
        'action' => 'Deactivate Maintenance Mode',
        'ip_address' => $request->ip(),
        'level' => 'info',
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Maintenance mode deactivated',
        'data' => ['maintenance_active' => false]
    ]);
}
```

### 6️⃣ API Routes (api.php)

```php
<?php
// routes/api.php

Route::middleware(['auth:sanctum', 'maintenance'])->group(function () {
    // ... existing user routes ...

    // Admin routes - Protected by is_admin middleware
    Route::middleware('is_admin')->prefix('admin')->group(function () {
        
        // User Management
        Route::apiResource('users', UserManagementController::class)
            ->only(['index', 'show', 'update', 'destroy']);

        // Monitoring
        Route::prefix('monitoring')->group(function () {
            Route::get('/', [MonitoringController::class, 'index']);
            Route::get('/logs', [MonitoringController::class, 'logs']);
            Route::get('/transactions', [MonitoringController::class, 'transactions']);
        });

        // Maintenance
        Route::prefix('maintenance')->group(function () {
            Route::get('/', [MaintenanceController::class, 'index']);
            Route::post('/', [MaintenanceController::class, 'store']);
            Route::delete('/', [MaintenanceController::class, 'destroy']);
        });

        // System Config (coming next)
        Route::prefix('config')->group(function () {
            Route::get('/', [SystemConfigController::class, 'index']);
            Route::put('/{key}', [SystemConfigController::class, 'update']);
        });
    });
});
```

---

## 🎨 Frontend Architecture

### Structure Overview

```
Frontend (React + TypeScript)
├── src/
│   ├── components/
│   │   ├── Admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── UserManagement/
│   │   │   │   ├── UserTable.tsx
│   │   │   │   ├── UserModal.tsx
│   │   │   │   └── UserForm.tsx
│   │   │   ├── TransactionMonitoring/
│   │   │   │   ├── TransactionTable.tsx
│   │   │   │   └── TransactionFilter.tsx
│   │   │   └── SystemControl/
│   │   │       ├── MaintenanceToggle.tsx
│   │   │       └── SystemSettings.tsx
│   │   └── ProtectedRoute.tsx (Admin-specific)
│   │
│   ├── pages/
│   │   └── AdminPage.tsx
│   │
│   ├── services/
│   │   ├── api.ts
│   │   └── adminService.ts
│   │
│   ├── hooks/
│   │   ├── useAdmin.ts
│   │   └── useAuth.ts
│   │
│   └── types/
│       ├── admin.ts
│       └── auth.ts
```

---

## 🚀 Setup & Implementation

### Backend Setup (Laravel)

#### Step 1: Ensure All Files Exist

✅ Existing:
- `app/Models/User.php` - User model dengan method `isAdmin()`
- `app/Http/Middleware/IsAdmin.php` - Middleware proteksi
- `app/Http/Controllers/Api/Admin/UserManagementController.php`
- `app/Http/Controllers/Api/Admin/MonitoringController.php`
- `app/Http/Controllers/Api/Admin/MaintenanceController.php`

#### Step 2: Create Additional Files (If Needed)

**File baru yang mungkin perlu dibuat:**

1. **SystemConfigController.php** - untuk manage system settings
2. **Migration untuk system_configs table** - untuk menyimpan konfigurasi

---

## 📱 API Endpoints Summary

### Admin Routes (All protected by `is_admin` middleware)

```
┌─ USER MANAGEMENT
│  GET    /api/admin/users               → List all users
│  GET    /api/admin/users/{id}          → Get user detail
│  PUT    /api/admin/users/{id}          → Update user
│  DELETE /api/admin/users/{id}          → Delete user
│
├─ MONITORING
│  GET    /api/admin/monitoring          → System statistics
│  GET    /api/admin/monitoring/logs     → Activity logs
│  GET    /api/admin/monitoring/transactions → All transactions
│
├─ MAINTENANCE
│  GET    /api/admin/maintenance         → Get status
│  POST   /api/admin/maintenance         → Activate
│  DELETE /api/admin/maintenance         → Deactivate
│
└─ SYSTEM CONFIG
   GET    /api/admin/config              → Get all settings
   PUT    /api/admin/config/{key}        → Update setting
```

---

## 🔒 Security Features

✅ **Authentication**: Laravel Sanctum tokens
✅ **Authorization**: `IsAdmin` middleware on all admin routes
✅ **Activity Logging**: Semua aksi admin di-log
✅ **Maintenance Mode**: Admin bisa bypass maintenance
✅ **Self-deletion prevention**: Admin tidak bisa delete dirinya sendiri

---

## 📊 Key Models & Relations

```
User (role: 'admin')
├── transactions (HasMany)
├── activityLogs (HasMany)
└── isAdmin(): bool

Transaction
├── user (BelongsTo)
├── wallet (BelongsTo)
└── activityLogs (HasMany)

ActivityLog
├── user (BelongsTo)
└── model (Polymorphic - User, Transaction, etc)
```

---

## 🎓 Fitur-Fitur Admin Tercakup

### ✅ Manajemen Pengguna
- [x] View semua pengguna dengan pagination
- [x] Search/filter by name, email, username
- [x] View detail user (termasuk transactions & logs)
- [x] Edit data user (name, email, role, user_type, status)
- [x] Delete user (dengan validasi self-deletion)
- [x] Automatic logging of all actions

### ✅ Pantau Transaksi
- [x] View semua transaksi dari all users
- [x] Filter by user, date range, type, category
- [x] Summary statistik (total income, expense, net)
- [x] View activity logs semua user
- [x] Filter logs by level (error, warning, info)

### ✅ Kontrol Sistem
- [x] Maintenance Mode toggle
- [x] Admin bypass maintenance
- [x] Activity logging system
- [ ] System configuration (coming next)

---

**Next Step**: Frontend Implementation dengan Protected Routes & Admin Dashboard UI

