# ⚡ Quick Start - Admin Role Implementation

> Ringkasan singkat dan checklist implementasi Admin Role di Backend

---

## 📦 File-File yang Telah Dibuat/Diupdate

### ✅ Controllers (Created/Updated)
- [x] `backend/app/Http/Controllers/Api/Admin/UserManagementController.php` - CRUD User
- [x] `backend/app/Http/Controllers/Api/Admin/MonitoringController.php` - **ENHANCED** (tambah transactions & dashboard)
- [x] `backend/app/Http/Controllers/Api/Admin/MaintenanceController.php` - Maintenance Mode
- [x] `backend/app/Http/Controllers/Api/Admin/SystemConfigController.php` - **NEW** System Settings

### ✅ Models (Created/Updated)
- [x] `backend/app/Models/User.php` - Already has `isAdmin()` method
- [x] `backend/app/Models/SystemConfig.php` - **NEW** for system config management

### ✅ Middleware (Already Exist)
- [x] `backend/app/Http/Middleware/IsAdmin.php` - Protects admin routes

### ✅ Migrations (Created/Updated)
- [x] `backend/database/migrations/2026_05_24_000000_create_system_configs_table.php` - **NEW**

### ✅ Routes (Updated)
- [x] `backend/routes/api.php` - Updated with new endpoints

### ✅ Documentation (Created)
- [x] `ADMIN_ROLE_IMPLEMENTATION.md` - Lengkap guide & architecture
- [x] `ADMIN_API_EXAMPLES.md` - Contoh API calls & testing
- [x] `QUICK_ADMIN_START.md` - **This file**

---

## 🚀 Implementation Steps

### Step 1: Jalankan Migration
```bash
cd backend
php artisan migrate
```

**Output yang diharapkan:**
```
Migrating: 2026_05_24_000000_create_system_configs_table
Migrated:  2026_05_24_000000_create_system_configs_table (xxx ms)
```

### Step 2: Pastikan File Controller Sudah Ada
✅ Semua file sudah created/updated di langkah sebelumnya

Cek file-file berikut ada:
```
backend/app/Http/Controllers/Api/Admin/
├── UserManagementController.php          ✅
├── MonitoringController.php              ✅ (enhanced)
├── MaintenanceController.php             ✅
├── SystemConfigController.php            ✅ (new)
└── CategoryController.php                ✅ (existing)
```

### Step 3: Clear Cache (Recommended)
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Step 4: Test Admin Routes

#### 4a. Login sebagai Admin
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

Simpan `token` dari response.

#### 4b. Test Admin Endpoint
```bash
curl -X GET "http://localhost:8000/api/admin/users" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response: User list dengan pagination

---

## 🎯 Available Admin Endpoints

### User Management
```
GET    /api/admin/users                    → List all users
GET    /api/admin/users/{id}               → Get user detail
PUT    /api/admin/users/{id}               → Update user
DELETE /api/admin/users/{id}               → Delete user
```

### Monitoring
```
GET    /api/admin/monitoring               → System statistics
GET    /api/admin/monitoring/logs          → Activity logs
GET    /api/admin/monitoring/transactions  → All transactions
GET    /api/admin/monitoring/dashboard     → Dashboard data
```

### Maintenance
```
GET    /api/admin/maintenance              → Check status
POST   /api/admin/maintenance              → Activate
DELETE /api/admin/maintenance              → Deactivate
```

### System Configuration
```
GET    /api/admin/config                   → Get all settings
GET    /api/admin/config/{key}             → Get single setting
PUT    /api/admin/config/{key}             → Update setting
DELETE /api/admin/config/{key}             → Reset to default
POST   /api/admin/config/batch-update      → Update multiple
```

---

## 🔐 Security Setup

### Middleware Protection
Semua admin routes dilindungi oleh `is_admin` middleware di `bootstrap/app.php`:

```php
$middleware->alias([
    'is_admin' => \App\Http\Middleware\IsAdmin::class,
    'maintenance' => \App\Http\Middleware\CheckMaintenance::class,
]);
```

### Authorization Check
Di `IsAdmin.php` middleware:
```php
if (!$request->user() || !$request->user()->isAdmin()) {
    return response()->json([
        'success' => false,
        'message' => 'Forbidden. Admin access required.'
    ], 403);
}
```

### Activity Logging
Semua aksi admin di-log otomatis di `ActivityLog`:
- User update/delete
- Config changes
- Maintenance mode toggle
- Dst...

---

## 📊 System Features Summary

| Feature | Endpoint | Status |
|---------|----------|--------|
| **View All Users** | GET /admin/users | ✅ Done |
| **Search Users** | GET /admin/users?search=... | ✅ Done |
| **Filter by Role/Type** | GET /admin/users?role=user&user_type=umkm | ✅ Done |
| **View User Detail** | GET /admin/users/{id} | ✅ Done |
| **Edit User** | PUT /admin/users/{id} | ✅ Done |
| **Delete User** | DELETE /admin/users/{id} | ✅ Done |
| **View System Stats** | GET /admin/monitoring | ✅ Done |
| **View Activity Logs** | GET /admin/monitoring/logs | ✅ Done |
| **Monitor All Transactions** | GET /admin/monitoring/transactions | ✅ Done |
| **Dashboard Data** | GET /admin/monitoring/dashboard | ✅ Done |
| **Maintenance Mode** | GET/POST/DELETE /admin/maintenance | ✅ Done |
| **System Config** | GET/PUT/DELETE /admin/config | ✅ Done |

---

## 🧪 Testing Checklist

### Basic Tests
- [ ] Login as admin user
- [ ] Get admin token
- [ ] Access /admin/users endpoint (should work)
- [ ] Access /admin/users as non-admin (should get 403)
- [ ] Access /admin/users with invalid token (should get 401)

### User Management Tests
- [ ] GET /admin/users → list users
- [ ] GET /admin/users?search=john → search works
- [ ] GET /admin/users/{id} → detail with relations
- [ ] PUT /admin/users/{id} → update user
- [ ] DELETE /admin/users/{id} → delete user
- [ ] Try to delete own account → should fail (422)

### Monitoring Tests
- [ ] GET /admin/monitoring → get stats
- [ ] GET /admin/monitoring/logs → get logs
- [ ] GET /admin/monitoring/logs?level=error → filter by level
- [ ] GET /admin/monitoring/transactions → get all transactions
- [ ] GET /admin/monitoring/transactions?user_id=5 → filter by user
- [ ] GET /admin/monitoring/dashboard → get dashboard data

### Maintenance Tests
- [ ] GET /admin/maintenance → check status
- [ ] POST /admin/maintenance → activate
- [ ] DELETE /admin/maintenance → deactivate

### System Config Tests
- [ ] GET /admin/config → get all configs
- [ ] PUT /admin/config/app_name → update single config
- [ ] POST /admin/config/batch-update → batch update
- [ ] DELETE /admin/config/app_name → reset config

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `ADMIN_ROLE_IMPLEMENTATION.md` | Lengkap guide, architecture, code examples |
| `ADMIN_API_EXAMPLES.md` | API endpoints, request/response examples, curl commands |
| `QUICK_ADMIN_START.md` | **This file** - Quick reference & checklist |

---

## 🔧 Troubleshooting

### 403 Forbidden Error
**Penyebab:** User bukan admin atau tidak punya token
```json
{
  "success": false,
  "message": "Forbidden. Admin access required."
}
```

**Solusi:**
- Pastikan login dengan user yang `role = 'admin'`
- Pastikan token valid dan dikirim di header `Authorization: Bearer TOKEN`
- Pastikan middleware `is_admin` aktif

### 501 Method Not Allowed
**Penyebab:** Route tidak terdaftar di `routes/api.php`

**Solusi:**
- Check file `backend/routes/api.php`
- Pastikan import `SystemConfigController` sudah ada
- Run `php artisan route:clear`

### Method Not Found Error
**Penyebab:** Controller atau method tidak ada

**Solusi:**
- Pastikan file controller ada di `/backend/app/Http/Controllers/Api/Admin/`
- Pastikan method name benar (case-sensitive)
- Run `php artisan cache:clear`

---

## 🎓 Next Steps - Frontend

Setelah backend selesai, buat Frontend dengan:
1. Protected route khusus admin
2. Dashboard UI dengan tabel user, transaksi, dan settings
3. Modal untuk edit user
4. Filter/search functionality
5. Export data feature (optional)

→ Lanjut ke **Frontend Implementation Guide** (coming soon)

---

## 📞 API Endpoints Cheat Sheet

```bash
# Auth
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me

# Admin - Users
GET /api/admin/users
GET /api/admin/users/{id}
PUT /api/admin/users/{id}
DELETE /api/admin/users/{id}

# Admin - Monitoring
GET /api/admin/monitoring
GET /api/admin/monitoring/logs
GET /api/admin/monitoring/transactions
GET /api/admin/monitoring/dashboard

# Admin - Maintenance
GET /api/admin/maintenance
POST /api/admin/maintenance
DELETE /api/admin/maintenance

# Admin - Config
GET /api/admin/config
GET /api/admin/config/{key}
PUT /api/admin/config/{key}
DELETE /api/admin/config/{key}
POST /api/admin/config/batch-update
```

---

**Status**: ✅ Backend Admin Role Implementation **COMPLETE**

**Ready for**: 🎨 Frontend Implementation

