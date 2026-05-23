# 📚 BACKEND TRANSACTION API - DOKUMENTASI LENGKAP

**Status:** ✅ Implementasi Selesai  
**Tanggal:** 23 Mei 2026  
**Tech Stack:** PHP Laravel 11, MySQL

---

## 📋 DAFTAR ISI
1. [Database Schema](#database-schema)
2. [Model & Relations](#model--relations)
3. [API Endpoints](#api-endpoints)
4. [Request/Response Format](#requestresponse-format)
5. [Contoh Implementasi](#contoh-implementasi)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

---

## 🗄️ DATABASE SCHEMA

### Table: `transactions`

```sql
CREATE TABLE transactions (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    wallet_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    note VARCHAR(1000) NULLABLE,
    description_detail TEXT NULLABLE,
    type ENUM('income', 'expense') NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    date DATE NOT NULL,
    invoice VARCHAR(50) NULLABLE UNIQUE,
    receipt_url VARCHAR(500) NULLABLE,
    metadata JSON NULLABLE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, date),
    INDEX idx_invoice (invoice)
);
```

### Field Descriptions

| Field | Type | Deskripsi | Notes |
|-------|------|-----------|-------|
| `id` | BIGINT | Primary key | Auto increment |
| `user_id` | BIGINT | User yang membuat transaksi | FK ke users |
| `wallet_id` | BIGINT | Wallet yang digunakan | FK ke wallets |
| `title` | VARCHAR(150) | Judul/nama transaksi | Required |
| `category` | VARCHAR(100) | Kategori transaksi | Required, e.g., "Makan", "Transport" |
| `note` | VARCHAR(1000) | Catatan singkat | Optional |
| `description_detail` | TEXT | Deskripsi detail | Optional, hingga 5000 karakter |
| `type` | ENUM | 'income' atau 'expense' | Required |
| `amount` | DECIMAL(18,2) | Nominal transaksi | Positif, >0 |
| `date` | DATE | Tanggal transaksi | Required, format YYYY-MM-DD |
| `invoice` | VARCHAR(50) | Nomor invoice | Unique, auto-generated: INV-YYYY-NNNN |
| `receipt_url` | VARCHAR(500) | Path ke file bukti | Optional, disimpan di storage/receipts |
| `metadata` | JSON | Data tambahan per role | Optional, flexible object |
| `created_at` | TIMESTAMP | Waktu pembuatan | Automatic |
| `updated_at` | TIMESTAMP | Waktu update terakhir | Automatic |

---

## 🔗 MODEL & RELATIONS

### Transaction Model

**File:** `backend/app/Models/Transaction.php`

```php
// Relasi One-to-Many
$transaction->user();      // Milik user mana
$transaction->wallet();    // Terikat ke wallet mana
$transaction->activityLogs(); // History perubahan

// Helper Methods
$transaction->isIncome();          // Check jika transaksi income
$transaction->isExpense();         // Check jika transaksi expense
$transaction->getSignedAmountAttribute(); // Ambil amount dengan sign
```

### Query Scopes (Helper Queries)

```php
// Filter by user
Transaction::byUser($userId)->get();

// Filter by wallet
Transaction::byWallet($walletId)->get();

// Filter by type
Transaction::income()->get();      // Hanya income
Transaction::expense()->get();     // Hanya expense

// Filter by category
Transaction::byCategory('Makan')->get();

// Filter by date range
Transaction::betweenDates('2026-05-01', '2026-05-31')->get();

// Sort by latest
Transaction::orderByLatest()->get();

// Kombinasi
Transaction::byUser(1)
    ->between_dates('2026-05-01', '2026-05-31')
    ->expense()
    ->orderByLatest()
    ->get();
```

---

## 🔌 API ENDPOINTS

### 1. LIST TRANSACTIONS (Get All)

**Endpoint:** `GET /api/transactions`

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Query Parameters:**
```
from          | date       | Start date (YYYY-MM-DD) - Optional
to            | date       | End date (YYYY-MM-DD) - Optional
category      | string     | Filter by category - Optional
type          | string     | 'income' atau 'expense' - Optional
wallet_id     | integer    | Filter by wallet - Optional
search        | string     | Search title/note/invoice - Optional
limit         | integer    | Items per page (default: 20, max: 100) - Optional
page          | integer    | Page number (default: 1) - Optional
```

**Response (Success 200):**
```json
{
    "success": true,
    "message": "Transaksi berhasil diambil",
    "data": [
        {
            "id": 1,
            "user_id": 1,
            "wallet_id": 1,
            "title": "Makan Siang",
            "category": "Makan",
            "note": "Makan di warung near kampus",
            "type": "expense",
            "amount": 25000,
            "date": "2026-05-23",
            "invoice": "INV-2026-0001",
            "receipt_url": "receipts/xxx.jpg",
            "metadata": null,
            "created_at": "2026-05-23T10:30:00Z",
            "updated_at": "2026-05-23T10:30:00Z"
        }
    ],
    "meta": {
        "total": 50,
        "per_page": 20,
        "current_page": 1,
        "last_page": 3
    }
}
```

---

### 2. GET SINGLE TRANSACTION

**Endpoint:** `GET /api/transactions/{id}`

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Response (Success 200):**
```json
{
    "success": true,
    "message": "Detail transaksi berhasil diambil",
    "data": {
        "id": 1,
        "user_id": 1,
        "wallet_id": 1,
        "title": "Makan Siang",
        "category": "Makan",
        "note": "Makan di warung near kampus",
        "description_detail": "Tempat: Warung Mak Citra, Waktu: 12:30",
        "type": "expense",
        "amount": 25000,
        "date": "2026-05-23",
        "invoice": "INV-2026-0001",
        "receipt_url": "receipts/xxx.jpg",
        "metadata": {
            "location": "Warung Mak Citra",
            "persons": 2
        },
        "created_at": "2026-05-23T10:30:00Z",
        "updated_at": "2026-05-23T10:30:00Z",
        "user": { "id": 1, "name": "John Doe", ... },
        "wallet": { "id": 1, "name": "Cash", "balance": 500000, ... },
        "activity_logs": [
            {
                "id": 1,
                "action": "CREATE",
                "data": { "title": "Makan Siang", "amount": 25000, ... },
                "created_at": "2026-05-23T10:30:00Z"
            }
        ]
    }
}
```

---

### 3. CREATE TRANSACTION

**Endpoint:** `POST /api/transactions`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
Accept: application/json
```

**Request Body:**
```json
{
    "wallet_id": 1,
    "title": "Makan Siang",
    "category": "Makan",
    "note": "Makan di warung",
    "description_detail": "Tempat: Warung Mak Citra",
    "type": "expense",
    "amount": 25000,
    "date": "2026-05-23",
    "receipt": <file>  // Optional: PDF/JPG/PNG, max 5MB
}
```

**Validasi:**
```
wallet_id          | Required | Harus ada & milik user
title              | Required | Max 150 chars
category           | Required | Max 100 chars
note               | Optional | Max 1000 chars
description_detail | Optional | Max 5000 chars
type               | Required | 'income' atau 'expense'
amount             | Required | Numeric, min 0.01
date               | Required | Valid date, format YYYY-MM-DD
receipt            | Optional | File: pdf,jpg,jpeg,png; max 5MB
```

**Response (Success 201):**
```json
{
    "success": true,
    "message": "Transaksi berhasil dibuat",
    "data": {
        "id": 1,
        "user_id": 1,
        "wallet_id": 1,
        "title": "Makan Siang",
        "category": "Makan",
        "type": "expense",
        "amount": 25000,
        "date": "2026-05-23",
        "invoice": "INV-2026-0001",
        "receipt_url": "receipts/xxx.jpg",
        "created_at": "2026-05-23T10:30:00Z",
        "updated_at": "2026-05-23T10:30:00Z"
    }
}
```

**Side Effects:**
- ✅ Wallet balance akan otomatis update
- ✅ Activity log akan tercatat
- ✅ Invoice number auto-generated

---

### 4. UPDATE TRANSACTION

**Endpoint:** `PUT /api/transactions/{id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
Accept: application/json
```

**Request Body:** (Semua field optional, hanya update yang perlu berubah)
```json
{
    "wallet_id": 1,
    "title": "Makan Siang (Updated)",
    "category": "Makan",
    "type": "expense",
    "amount": 30000,
    "date": "2026-05-23",
    "receipt": <file>
}
```

**Response (Success 200):**
```json
{
    "success": true,
    "message": "Transaksi berhasil diperbarui",
    "data": {
        "id": 1,
        "title": "Makan Siang (Updated)",
        "amount": 30000,
        ...
    }
}
```

**Side Effects:**
- ✅ Wallet balance akan di-reconcile (kurangi amount lama, tambah amount baru)
- ✅ Jika wallet berubah: balance di wallet lama dikurangi, wallet baru ditambah
- ✅ Activity log akan mencatat perubahan

---

### 5. DELETE TRANSACTION

**Endpoint:** `DELETE /api/transactions/{id}`

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Response (Success 200):**
```json
{
    "success": true,
    "message": "Transaksi berhasil dihapus"
}
```

**Side Effects:**
- ✅ Wallet balance akan di-reverse (dikurangi jika expense, ditambah jika income)
- ✅ Receipt file akan dihapus dari storage
- ✅ Activity log akan mencatat penghapusan

---

### 6. GET SUMMARY (Income/Expense Overview)

**Endpoint:** `GET /api/transactions/summary`

**Query Parameters:**
```
from          | date    | Start date - Optional
to            | date    | End date - Optional
wallet_id     | integer | Filter by wallet - Optional
```

**Response (Success 200):**
```json
{
    "success": true,
    "message": "Summary transaksi berhasil diambil",
    "data": {
        "total_income": 5000000,
        "total_expense": 2500000,
        "balance": 2500000,
        "transaction_count": 45,
        "top_categories": [
            {
                "category": "Makan",
                "total_expense": 800000,
                "total_income": 0,
                "count": 25
            },
            {
                "category": "Transport",
                "total_expense": 600000,
                "total_income": 0,
                "count": 12
            }
        ]
    }
}
```

---

## 📤 REQUEST/RESPONSE FORMAT

### Standard Response Format

**Success Response (2xx):**
```json
{
    "success": true,
    "message": "...",
    "data": { ... },
    "meta": { ... }  // Optional
}
```

**Error Response (4xx/5xx):**
```json
{
    "success": false,
    "message": "Error message",
    "errors": {
        "field_name": ["Error message 1", "Error message 2"]
    }
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid data |
| 403 | Forbidden - Unauthorized |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

## 💡 CONTOH IMPLEMENTASI

### Frontend Usage (React/Vue)

**Create Transaction:**
```javascript
const createTransaction = async (data) => {
    const formData = new FormData();
    formData.append('wallet_id', data.wallet_id);
    formData.append('title', data.title);
    formData.append('category', data.category);
    formData.append('type', data.type);
    formData.append('amount', data.amount);
    formData.append('date', data.date);
    formData.append('note', data.note);
    
    if (data.receipt) {
        formData.append('receipt', data.receipt);
    }
    
    const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData
    });
    
    return await response.json();
};
```

**Get Transactions with Filter:**
```javascript
const getTransactions = async (filters) => {
    const params = new URLSearchParams();
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.category) params.append('category', filters.category);
    if (filters.type) params.append('type', filters.type);
    
    const response = await fetch(`/api/transactions?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    
    return await response.json();
};
```

**Update Transaction:**
```javascript
const updateTransaction = async (id, data) => {
    const formData = new FormData();
    
    // Hanya append field yang berubah
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
        }
    });
    
    const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData
    });
    
    return await response.json();
};
```

---

## ⚠️ ERROR HANDLING

### Validation Errors

**Request:**
```json
{
    "title": "",
    "amount": -5000,
    "type": "invalid_type"
}
```

**Response (422):**
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "title": ["The title field is required"],
        "amount": ["The amount must be at least 0.01"],
        "type": ["The type must be 'income' or 'expense'"]
    }
}
```

### Authorization Error

**Response (403):**
```json
{
    "success": false,
    "message": "Tidak diizinkan mengakses transaksi ini"
}
```

### Not Found Error

**Response (404):**
```json
{
    "success": false,
    "message": "Transaction not found"
}
```

---

## 🎯 BEST PRACTICES

### 1. **Wallet Balance Management**
- ✅ Setiap transaksi baru/update/delete HARUS update wallet balance
- ✅ Balance harus selalu konsisten dengan sum transaksi
- ✅ Use transaction (DB) untuk atomic operations kalau perlu

### 2. **Invoice Number**
- ✅ Auto-generated dengan format: `INV-YYYY-NNNN`
- ✅ Unique per user per tahun
- ✅ Tidak perlu user input manual

### 3. **Receipt File Upload**
- ✅ Disimpan di `storage/receipts/` (bukan public folder untuk security)
- ✅ Support: PDF, JPG, JPEG, PNG
- ✅ Max size: 5MB
- ✅ File lama dihapus saat update
- ✅ File dihapus saat transaksi dihapus

### 4. **Date Handling**
- ✅ Always use YYYY-MM-DD format
- ✅ Date bisa backdate (transaksi kemarin)
- ✅ Date tidak perlu validasi range (user bisa input kemarin/tahun lalu)

### 5. **Category Management**
- ⚠️ Category bisa input freetext (tidak perlu ada di enum)
- ⚠️ Pertimbangkan: Setup kategori predefined di database categories table

### 6. **Pagination**
- ✅ Default: 20 items per page
- ✅ Max: 100 items per page
- ✅ Return pagination meta (total, current_page, last_page)

### 7. **Activity Logging**
- ✅ Setiap CREATE/UPDATE/DELETE dicatat di activity_logs
- ✅ Store: user_id, action, model_type, data, ip_address
- ✅ Berguna untuk audit trail

### 8. **Authorization**
- ✅ User hanya bisa akses transaksi milik mereka sendiri
- ✅ Check: `transaction->user_id === auth()->id()`
- ✅ Return 403 jika unauthorized

### 9. **Performance**
- ✅ Use indexing untuk user_id, date combination
- ✅ Use indexing untuk invoice
- ✅ Paginate results (jangan limit 10000)
- ✅ Use `select()` untuk pilih field yang perlu

### 10. **Metadata Field**
- ✅ Gunakan untuk data tambahan per role/kategori
- ✅ Contoh untuk Mahasiswa: `{"semester": 2, "scholarship": "yes"}`
- ✅ Contoh untuk UMKM: `{"supplier": "PT ABC", "qty": 100}`
- ✅ Flexible JSON, bisa null

---

## 🔐 SECURITY CHECKLIST

- ✅ Require authentication (Bearer token)
- ✅ Validate all inputs
- ✅ Check authorization sebelum update/delete
- ✅ Validate file uploads (size, type)
- ✅ Use soft deletes jika perlu audit (optional)
- ✅ Rate limiting untuk POST/PUT/DELETE
- ✅ Log all modifications (Activity Log)
- ✅ Use HTTPS di production

---

## 📞 SUPPORT & TROUBLESHOOTING

### Q: Mengapa wallet balance tidak update?
**A:** Pastikan method `updateWalletBalance()` dipanggil. Check di Controller.

### Q: Bagaimana jika user hapus transaksi tapi wallet balance masih berkurang?
**A:** System automatically reverse balance saat delete. Jika issue, jalankan reconciliation query.

### Q: Bisa bulk upload transaksi?
**A:** Belum implement. Bisa tambahkan di future jika perlu.

### Q: Bagaimana handle currency?
**A:** Semua amount dalam IDR (Rp). Hardcoded, tidak ada conversion.

### Q: Apakah ada soft delete untuk transaksi?
**A:** Tidak implement. Deletes permanent, tapi tersimpan di activity_logs.

---

## 📞 NEXT STEPS

1. ✅ Test semua endpoints dengan Postman
2. ✅ Integrate ke Frontend FE
3. ⏳ Implement receipt file download endpoint
4. ⏳ Add bulk transaction import
5. ⏳ Add transaction approval workflow (jika perlu)

---

**Created:** 23 May 2026  
**Last Updated:** 23 May 2026  
**Maintained by:** Backend Team
