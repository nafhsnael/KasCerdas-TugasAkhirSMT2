# 📚 Admin API Examples & Testing Guide

> Contoh lengkap Admin API calls dengan request/response dan cara testing menggunakan cURL atau Postman

---

## 📋 Daftar API Endpoints Admin

### Base URL
```
http://localhost:8000/api/admin
```

### Authentication
Semua request memerlukan Bearer token dari login user admin:
```
Authorization: Bearer {YOUR_ADMIN_TOKEN}
```

---

## 1️⃣ USER MANAGEMENT

### GET /users - List Semua Users

**Request:**
```bash
curl -X GET "http://localhost:8000/api/admin/users?search=john&role=user&per_page=10" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Query Parameters:**
```
- search: string (search by name, email, username)
- role: string (user | admin)
- user_type: string (umkm | masyarakat_umum | mahasiswa)
- is_active: boolean (true | false)
- per_page: integer (default: 10)
- page: integer (default: 1)
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Daftar user berhasil diambil",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 5,
        "name": "John Doe",
        "email": "john@example.com",
        "username": "johndoe",
        "role": "user",
        "user_type": "umkm",
        "is_active": true,
        "created_at": "2026-05-20T10:30:00Z",
        "updated_at": "2026-05-24T15:45:00Z"
      },
      {
        "id": 6,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "username": "janesmith",
        "role": "user",
        "user_type": "masyarakat_umum",
        "is_active": true,
        "created_at": "2026-05-21T08:20:00Z",
        "updated_at": "2026-05-24T10:00:00Z"
      }
    ],
    "from": 1,
    "to": 2,
    "total": 25,
    "per_page": 10,
    "last_page": 3
  }
}
```

---

### GET /users/{id} - Get Detail User

**Request:**
```bash
curl -X GET "http://localhost:8000/api/admin/users/5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Detail user berhasil diambil",
  "data": {
    "id": 5,
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "role": "user",
    "user_type": "umkm",
    "is_active": true,
    "created_at": "2026-05-20T10:30:00Z",
    "updated_at": "2026-05-24T15:45:00Z",
    "transactions": [
      {
        "id": 101,
        "title": "Penjualan Barang",
        "type": "income",
        "amount": 500000,
        "date": "2026-05-23"
      }
    ],
    "activity_logs": [
      {
        "id": 50,
        "action": "User Login",
        "created_at": "2026-05-24T15:00:00Z"
      }
    ]
  }
}
```

---

### PUT /users/{id} - Update User

**Request:**
```bash
curl -X PUT "http://localhost:8000/api/admin/users/5" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated",
    "email": "john.new@example.com",
    "role": "admin",
    "user_type": null,
    "is_active": true
  }'
```

**Request Body:**
```json
{
  "name": "John Doe Updated",        // required, string, max 255
  "email": "john.new@example.com",   // required, email, unique
  "role": "admin",                   // required, in: user|admin
  "user_type": null,                 // nullable, required_if role=user, in: umkm|masyarakat_umum|mahasiswa
  "is_active": true                  // required, boolean
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "User berhasil diperbarui",
  "data": {
    "id": 5,
    "name": "John Doe Updated",
    "email": "john.new@example.com",
    "role": "admin",
    "user_type": null,
    "is_active": true,
    "updated_at": "2026-05-24T16:00:00Z"
  }
}
```

**Response Error (422):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "email": ["Email sudah digunakan"]
  }
}
```

---

### DELETE /users/{id} - Delete User

**Request:**
```bash
curl -X DELETE "http://localhost:8000/api/admin/users/5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "User berhasil dihapus"
}
```

**Response Error (422):**
```json
{
  "success": false,
  "message": "Tidak dapat menghapus akun sendiri"
}
```

---

## 2️⃣ MONITORING

### GET /monitoring - System Statistics

**Request:**
```bash
curl -X GET "http://localhost:8000/api/admin/monitoring" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Statistik sistem berhasil diambil",
  "data": {
    "users_overview": {
      "by_type": {
        "umkm": 15,
        "masyarakat_umum": 8,
        "mahasiswa": 22
      },
      "total_admin": 2,
      "total_active": 44,
      "new_users_today": 3
    },
    "system_status": {
      "maintenance_active": false,
      "error_logs_today": 2
    },
    "transaction_overview": {
      "total_transactions": 250,
      "total_income": 25000000,
      "total_expense": 15000000,
      "net_balance": 10000000
    }
  }
}
```

---

### GET /monitoring/logs - Activity Logs

**Request:**
```bash
curl -X GET "http://localhost:8000/api/admin/monitoring/logs?level=error&search=login&per_page=15" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters:**
```
- level: string (error | warning | info)
- search: string (search in action & user name/email)
- start_date: date (YYYY-MM-DD)
- end_date: date (YYYY-MM-DD)
- per_page: integer (default: 15)
- page: integer (default: 1)
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Log aktivitas berhasil diambil",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1001,
        "user": {
          "id": 1,
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "action": "Admin Update User",
        "level": "info",
        "ip_address": "192.168.1.100",
        "created_at": "2026-05-24T15:30:00Z"
      },
      {
        "id": 1000,
        "user": {
          "id": 2,
          "name": "Super Admin",
          "email": "super@example.com"
        },
        "action": "User Login",
        "level": "info",
        "ip_address": "192.168.1.101",
        "created_at": "2026-05-24T15:00:00Z"
      }
    ],
    "from": 1,
    "to": 2,
    "total": 45,
    "per_page": 15,
    "last_page": 3
  }
}
```

---

### GET /monitoring/transactions - All Transactions

**Request:**
```bash
curl -X GET "http://localhost:8000/api/admin/monitoring/transactions?user_id=5&type=income&start_date=2026-05-01&end_date=2026-05-31&per_page=15" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters:**
```
- user_id: integer (filter by user)
- type: string (income | expense)
- category: string (filter by category)
- start_date: date (YYYY-MM-DD)
- end_date: date (YYYY-MM-DD)
- search: string (search in title, note, description)
- per_page: integer (default: 15)
- page: integer (default: 1)
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Daftar transaksi semua user berhasil diambil",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 101,
        "user": {
          "id": 5,
          "name": "John Doe",
          "email": "john@example.com",
          "user_type": "umkm"
        },
        "wallet": {
          "id": 10,
          "name": "Dompet Utama"
        },
        "title": "Penjualan Produk",
        "category": "Penjualan",
        "type": "income",
        "amount": 500000,
        "date": "2026-05-23",
        "note": "Penjualan ke Toko A",
        "created_at": "2026-05-23T14:20:00Z"
      },
      {
        "id": 102,
        "user": {
          "id": 6,
          "name": "Jane Smith",
          "email": "jane@example.com",
          "user_type": "masyarakat_umum"
        },
        "wallet": {
          "id": 11,
          "name": "Dompet Tabungan"
        },
        "title": "Beban Listrik",
        "category": "Utilitas",
        "type": "expense",
        "amount": 200000,
        "date": "2026-05-22",
        "note": "Tagihan listrik bulanan",
        "created_at": "2026-05-22T10:15:00Z"
      }
    ],
    "from": 1,
    "to": 2,
    "total": 87,
    "per_page": 15,
    "last_page": 6
  },
  "summary": {
    "total_income": 5000000,
    "total_expense": 2500000,
    "net_balance": 2500000,
    "total_transactions": 87
  }
}
```

---

### GET /monitoring/dashboard - Dashboard Data

**Request:**
```bash
curl -X GET "http://localhost:8000/api/admin/monitoring/dashboard" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Dashboard data berhasil diambil",
  "data": {
    "transactions_trend": [
      {
        "date": "2026-04-24",
        "income": 1500000,
        "expense": 800000
      },
      {
        "date": "2026-04-25",
        "income": 2000000,
        "expense": 1200000
      }
    ],
    "top_categories": [
      {
        "category": "Penjualan",
        "count": 45,
        "total": 15000000
      },
      {
        "category": "Gaji",
        "count": 23,
        "total": 12000000
      }
    ],
    "top_users": [
      {
        "id": 5,
        "name": "John Doe",
        "email": "john@example.com",
        "user_type": "umkm",
        "transactions_count": 42
      },
      {
        "id": 6,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "user_type": "masyarakat_umum",
        "transactions_count": 38
      }
    ]
  }
}
```

---

## 3️⃣ MAINTENANCE

### GET /maintenance - Check Status

**Request:**
```bash
curl -X GET "http://localhost:8000/api/admin/maintenance" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Status maintenance berhasil diambil",
  "data": {
    "maintenance_active": false
  }
}
```

---

### POST /maintenance - Activate Maintenance

**Request:**
```bash
curl -X POST "http://localhost:8000/api/admin/maintenance" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Mode maintenance berhasil diaktifkan",
  "data": {
    "maintenance_active": true
  }
}
```

---

### DELETE /maintenance - Deactivate Maintenance

**Request:**
```bash
curl -X DELETE "http://localhost:8000/api/admin/maintenance" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Mode maintenance berhasil dinonaktifkan",
  "data": {
    "maintenance_active": false
  }
}
```

---

## 4️⃣ SYSTEM CONFIGURATION

### GET /config - Get All Settings

**Request:**
```bash
curl -X GET "http://localhost:8000/api/admin/config" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Konfigurasi sistem berhasil diambil",
  "data": {
    "app_name": "KasCerdas v1.0",
    "max_file_upload_size": 52428800,
    "transaction_limit_per_day": 100,
    "require_email_verification": true,
    "two_factor_enabled": false,
    "api_rate_limit": 100,
    "session_timeout": 3600,
    "notification_email": "admin@example.com",
    "backup_frequency": "daily"
  }
}
```

---

### GET /config/{key} - Get Single Config

**Request:**
```bash
curl -X GET "http://localhost:8000/api/admin/config/app_name" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Konfigurasi berhasil diambil",
  "data": {
    "key": "app_name",
    "value": "KasCerdas v1.0"
  }
}
```

---

### PUT /config/{key} - Update Config

**Request:**
```bash
curl -X PUT "http://localhost:8000/api/admin/config/app_name" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "KasCerdas v2.0"
  }'
```

**Request Body:**
```json
{
  "value": "KasCerdas v2.0"  // required, tipe sesuai dengan config key
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Konfigurasi sistem berhasil diperbarui",
  "data": {
    "key": "app_name",
    "value": "KasCerdas v2.0"
  }
}
```

**Validation Examples:**
```bash
# Update session timeout (numeric)
curl -X PUT "http://localhost:8000/api/admin/config/session_timeout" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value": 7200}'

# Update email notification
curl -X PUT "http://localhost:8000/api/admin/config/notification_email" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value": "newemail@example.com"}'

# Update backup frequency
curl -X PUT "http://localhost:8000/api/admin/config/backup_frequency" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value": "weekly"}'
```

---

### POST /config/batch-update - Batch Update

**Request:**
```bash
curl -X POST "http://localhost:8000/api/admin/config/batch-update" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "configs": {
      "app_name": "KasCerdas v2.0",
      "session_timeout": 7200,
      "api_rate_limit": 200,
      "notification_email": "newemail@example.com"
    }
  }'
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Batch update selesai",
  "data": {
    "updated": {
      "app_name": "KasCerdas v2.0",
      "session_timeout": 7200,
      "api_rate_limit": 200,
      "notification_email": "newemail@example.com"
    },
    "errors": {}
  }
}
```

---

### DELETE /config/{key} - Reset Config

**Request:**
```bash
curl -X DELETE "http://localhost:8000/api/admin/config/app_name" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Konfigurasi berhasil direset ke default",
  "data": {
    "key": "app_name"
  }
}
```

---

## 🧪 Testing dengan Postman

### 1. Import Collection

Buat file `KasCerdas-Admin.postman_collection.json`:

```json
{
  "info": {
    "name": "KasCerdas Admin API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Admin Auth",
      "item": [
        {
          "name": "Login as Admin",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"admin@example.com\",\"password\":\"password123\"}"
            }
          }
        }
      ]
    },
    {
      "name": "User Management",
      "item": [
        {
          "name": "List Users",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/admin/users",
            "header": [
              {"key": "Authorization", "value": "Bearer {{admin_token}}"}
            ]
          }
        }
      ]
    }
  ]
}
```

### 2. Setup Environment Variables

```json
{
  "base_url": "http://localhost:8000/api",
  "admin_token": "YOUR_ADMIN_TOKEN_HERE"
}
```

---

## 🔐 Error Handling

### 403 Forbidden - Not Admin
```json
{
  "success": false,
  "message": "Forbidden. Admin access required.",
  "error_code": "ADMIN_REQUIRED"
}
```

### 401 Unauthorized - Invalid Token
```json
{
  "success": false,
  "message": "Unauthenticated.",
  "error_code": "UNAUTHENTICATED"
}
```

### 422 Validation Error
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "email": ["Email sudah digunakan"],
    "role": ["Role harus user atau admin"]
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User tidak ditemukan"
}
```

---

## 📝 Testing Checklist

- [ ] Admin dapat login
- [ ] Admin token valid
- [ ] GET /users menampilkan semua user
- [ ] Search/filter user berfungsi
- [ ] GET /users/{id} menampilkan detail dengan relations
- [ ] PUT /users/{id} update user berhasil
- [ ] DELETE /users/{id} delete user berhasil
- [ ] GET /monitoring menampilkan statistik
- [ ] GET /monitoring/logs menampilkan activity logs
- [ ] GET /monitoring/transactions menampilkan semua transaksi
- [ ] GET /monitoring/dashboard menampilkan dashboard data
- [ ] Maintenance mode toggle berfungsi
- [ ] System config CRUD berfungsi
- [ ] Batch update config berfungsi
- [ ] Non-admin user tidak bisa akses admin routes (403)
- [ ] Invalid token rejected (401)

