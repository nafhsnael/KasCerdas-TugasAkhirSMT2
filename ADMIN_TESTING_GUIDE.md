# 🧪 Testing & Seeding Guide - Admin Role

> Panduan practical untuk testing admin role menggunakan Laravel Tinker, Seeder, dan manual testing

---

## 🌱 Option 1: Seeding Data untuk Testing

### Buat Admin User dengan Seeder

```bash
cd backend
php artisan make:seeder AdminUserSeeder
```

**File: `database/seeders/AdminUserSeeder.php`**

```php
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Super Admin
        User::create([
            'name' => 'Super Admin',
            'username' => 'superadmin',
            'email' => 'superadmin@example.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'user_type' => null,
            'is_active' => true,
        ]);

        // Create Regular Admin
        User::create([
            'name' => 'Admin User',
            'username' => 'admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'user_type' => null,
            'is_active' => true,
        ]);

        // Create Test Users (various types)
        User::create([
            'name' => 'John UMKM',
            'username' => 'john_umkm',
            'email' => 'john@umkm.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'user_type' => 'umkm',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Jane Masyarakat',
            'username' => 'jane_masyarakat',
            'email' => 'jane@masyarakat.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'user_type' => 'masyarakat_umum',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Bob Mahasiswa',
            'username' => 'bob_mahasiswa',
            'email' => 'bob@mahasiswa.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'user_type' => 'mahasiswa',
            'is_active' => true,
        ]);

        $this->command->info('Admin users seeded successfully!');
    }
}
```

**Run Seeder:**
```bash
php artisan db:seed --class=AdminUserSeeder
```

---

## 🔐 Option 2: Using Laravel Tinker

Launch Tinker:
```bash
php artisan tinker
```

### Create Admin User

```php
# Create a new admin user
$admin = App\Models\User::create([
    'name' => 'Super Admin',
    'username' => 'superadmin',
    'email' => 'superadmin@example.com',
    'password' => Hash::make('password123'),
    'role' => 'admin',
    'user_type' => null,
    'is_active' => true,
]);

$admin->id;  // Check the ID
```

### Get Login Token

```php
# Get the token for API testing
$admin = App\Models\User::where('email', 'superadmin@example.com')->first();
$token = $admin->createToken('admin-token')->plainTextToken;
echo $token;  # Copy this for API testing
```

### Test isAdmin() Method

```php
$admin = App\Models\User::where('role', 'admin')->first();
$admin->isAdmin();  # Should return true

$user = App\Models\User::where('role', 'user')->first();
$user->isAdmin();   # Should return false
```

### Create Test Data

```php
# Create multiple users quickly
$users = App\Models\User::factory(10)->create(['role' => 'user']);

# Create users with specific type
App\Models\User::factory(5)->create([
    'role' => 'user',
    'user_type' => 'umkm'
]);

# List all admins
App\Models\User::where('role', 'admin')->get();

# Count users by type
App\Models\User::where('role', 'user')
    ->select('user_type', \Illuminate\Support\Facades\DB::raw('count(*) as total'))
    ->groupBy('user_type')
    ->get();
```

### Test Activity Logging

```php
# Create activity log
App\Models\ActivityLog::create([
    'user_id' => 1,
    'action' => 'Test Activity',
    'ip_address' => '127.0.0.1',
    'level' => 'info',
]);

# Get recent logs
App\Models\ActivityLog::latest()->limit(5)->get();
```

---

## 🧪 Option 3: Manual API Testing

### 1. Setup Postman Collection

**Create new collection "KasCerdas Admin"**

### 2. Step-by-Step Testing

#### Step 1: Login
**POST** `http://localhost:8000/api/auth/login`

Body:
```json
{
  "email": "superadmin@example.com",
  "password": "password123"
}
```

**Save token from response** → Use in `Authorization` header

#### Step 2: Test User List
**GET** `http://localhost:8000/api/admin/users`

Headers:
```
Authorization: Bearer YOUR_TOKEN
```

Expected: List of all users

#### Step 3: Test User Detail
**GET** `http://localhost:8000/api/admin/users/5`

Expected: User detail with relations

#### Step 4: Test User Update
**PUT** `http://localhost:8000/api/admin/users/5`

Body:
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "user",
  "user_type": "umkm",
  "is_active": true
}
```

#### Step 5: Test Monitoring
**GET** `http://localhost:8000/api/admin/monitoring`

Expected: System statistics

#### Step 6: Test Transactions
**GET** `http://localhost:8000/api/admin/monitoring/transactions`

Query params:
```
?type=income&start_date=2026-05-01&end_date=2026-05-31
```

#### Step 7: Test Config
**GET** `http://localhost:8000/api/admin/config`

Expected: All system configurations

#### Step 8: Update Config
**PUT** `http://localhost:8000/api/admin/config/app_name`

Body:
```json
{
  "value": "KasCerdas v2.0"
}
```

---

## 📊 Test Scenarios

### Scenario 1: Admin Full Access

```bash
# Login as admin
TOKEN=$(curl -s -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@example.com","password":"password123"}' | jq -r '.data.token')

# Test all admin endpoints
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8000/api/admin/users"
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8000/api/admin/monitoring"
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8000/api/admin/config"
```

### Scenario 2: Non-Admin Denied Access

```bash
# Login as regular user
TOKEN=$(curl -s -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@umkm.com","password":"password123"}' | jq -r '.data.token')

# Try to access admin endpoint - should get 403
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8000/api/admin/users"

# Expected response:
# {
#   "success": false,
#   "message": "Forbidden. Admin access required."
# }
```

### Scenario 3: Admin Activity Logging

```bash
# Update a user as admin
curl -X PUT "http://localhost:8000/api/admin/users/5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated","email":"updated@example.com","role":"user","user_type":"umkm","is_active":true}'

# Check activity logs
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8000/api/admin/monitoring/logs"

# Should see: "Admin Update User" action logged
```

---

## 🎯 Assertion Checks

### Check Admin User Created
```bash
# Via Tinker
php artisan tinker
> App\Models\User::where('role', 'admin')->count()
2  # Should return number of admins
```

### Check Middleware Works
```bash
# No token - should fail
curl -X GET "http://localhost:8000/api/admin/users"
# Response: 401 Unauthenticated

# Wrong role - should fail
curl -X GET "http://localhost:8000/api/admin/users" \
  -H "Authorization: Bearer NON_ADMIN_TOKEN"
# Response: 403 Forbidden

# Correct role - should work
curl -X GET "http://localhost:8000/api/admin/users" \
  -H "Authorization: Bearer ADMIN_TOKEN"
# Response: 200 with user list
```

### Check Activity Logging
```php
# In Tinker
App\Models\ActivityLog::latest()->first();
# Should show recent admin action logs
```

---

## 🔍 Debugging Commands

### Check Database Content
```php
# In Tinker - Count users by role
App\Models\User::groupBy('role')
    ->selectRaw('role, count(*) as count')
    ->pluck('count', 'role');

# Check all admins
App\Models\User::where('role', 'admin')->get();

# Check activity logs
App\Models\ActivityLog::latest()->limit(10)->get();
```

### Clear Cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Check Routes
```bash
php artisan route:list --path=admin

# Output should show all admin routes like:
# /api/admin/users
# /api/admin/users/{id}
# /api/admin/monitoring
# /api/admin/config
# etc.
```

---

## 📋 Complete Testing Workflow

```bash
# 1. Ensure migrations ran
php artisan migrate --step

# 2. Seed admin users
php artisan db:seed --class=AdminUserSeeder

# 3. Clear cache
php artisan cache:clear

# 4. Get admin token
ADMIN_TOKEN=$(curl -s -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@example.com","password":"password123"}' | jq -r '.data.token')

# 5. Test endpoints
echo "Testing /admin/users..."
curl -H "Authorization: Bearer $ADMIN_TOKEN" "http://localhost:8000/api/admin/users" | jq '.'

echo "Testing /admin/monitoring..."
curl -H "Authorization: Bearer $ADMIN_TOKEN" "http://localhost:8000/api/admin/monitoring" | jq '.'

echo "Testing /admin/config..."
curl -H "Authorization: Bearer $ADMIN_TOKEN" "http://localhost:8000/api/admin/config" | jq '.'

echo "All tests completed!"
```

---

## ✅ Quick Verification Checklist

Run this to verify everything is working:

```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🧪 Running Admin Role Verification Tests..."
echo ""

# Test 1: Migrations
echo "Test 1: Checking migrations..."
if php artisan migrate:status | grep -q "system_configs"; then
  echo -e "${GREEN}✓ System configs table exists${NC}"
else
  echo -e "${RED}✗ System configs table missing${NC}"
fi

# Test 2: Admin User
echo "Test 2: Checking admin user..."
if php artisan tinker --execute "echo App\Models\User::where('role', 'admin')->count();" | grep -q "[1-9]"; then
  echo -e "${GREEN}✓ Admin user exists${NC}"
else
  echo -e "${RED}✗ No admin user found${NC}"
fi

# Test 3: Routes
echo "Test 3: Checking admin routes..."
if php artisan route:list | grep -q "/api/admin"; then
  echo -e "${GREEN}✓ Admin routes registered${NC}"
else
  echo -e "${RED}✗ Admin routes not found${NC}"
fi

# Test 4: Controllers
echo "Test 4: Checking controllers..."
if [ -f "app/Http/Controllers/Api/Admin/SystemConfigController.php" ]; then
  echo -e "${GREEN}✓ SystemConfigController exists${NC}"
else
  echo -e "${RED}✗ SystemConfigController missing${NC}"
fi

echo ""
echo "✅ Verification complete!"
```

---

## 🚀 Ready to Test

Backend Admin Role implementation sudah complete!

**Next Steps:**
1. ✅ Run migrations
2. ✅ Seed test users
3. ✅ Test API endpoints
4. 🎨 Build Frontend (React + TypeScript)

