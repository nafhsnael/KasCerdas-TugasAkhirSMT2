# 💰 KasCerdas — Web Manajemen Keuangan

KasCerdas adalah aplikasi berbasis web yang dibuat untuk membantu pengguna dalam mengatur dan mencatat keuangan secara lebih terstruktur, praktis, dan efisien.
Aplikasi ini menyediakan fitur pencatatan pemasukan, pengeluaran, pengaturan budget, hingga monitoring kondisi keuangan secara real-time.

Project ini dikembangkan menggunakan **React.js** untuk frontend dan **Laravel** sebagai backend API.

---

# ✨ Fitur Utama

## 👤 User Features

* Login & Register
* Input Saldo Awal
* Tambah Pemasukan
* Tambah Pengeluaran
* Budget Bulanan
* Riwayat Transaksi
* Pilihan Bank / Dompet Digital
* Dashboard Keuangan

## 🛠️ Admin Features

* Dashboard Admin
* Manajemen Data User
* Monitoring Database
* Pengelolaan Data Transaksi

---

# 🛠️ Teknologi yang Digunakan

## Frontend

* React.js
* Vite
* React Hooks
* CSS / Tailwind CSS

## Backend

* Laravel
* PHP
* MySQL

## Tools

* Git & GitHub
* VS Code
* Postman

---

# 📂 Struktur Project

```bash
KasCerdas-TugasAkhirSMT2/
│
├── Frontend/        # Frontend React User & Admin
├── backend/         # Backend Laravel API
├── kas_cerdas.sql   # Database
└── README.md
```

---

# 🚀 Cara Menjalankan Project

## 1️⃣ Clone Repository

```bash
git clone https://github.com/username/nama-repository.git
```

## 2️⃣ Masuk ke Folder Project

```bash
cd nama-repository
```

---

# ⚙️ Setup Backend (Laravel)

## Install Dependency

```bash
cd backend
composer install
```

## Copy Environment File

```bash
cp .env.example .env
```

## Konfigurasi Database

Atur database pada file `.env`

```env
DB_DATABASE=kas_cerdas
DB_USERNAME=root
DB_PASSWORD=
```

## Generate Application Key

```bash
php artisan key:generate
```

## Migrasi Database

```bash
php artisan migrate
```

## Jalankan Backend Server

```bash
php artisan serve
```

Backend berjalan di:

```bash
http://127.0.0.1:8000
```

---

# 💻 Setup Frontend (React + Vite)

## Masuk ke Folder Frontend

```bash
cd Frontend
```

## Install Dependency

```bash
npm install
```

## Jalankan Frontend

```bash
npm run dev
```

Frontend berjalan di:

```bash
http://localhost:5173
```

---

# 👥 Anggota Kelompok

| Nama                          | NIM             |
| ----------------------------- | --------------- |
| Nafhisa Nailah Husnah         | 253140707111072 |
| Serli Maharani Putri Yustina  | 253140707111084 |
| Firyal Zalfaa Aulia           | 253140707111070 |
| Kasiva Imtiyas Zaidah Iftinan | 253140707111085 |

---

# 🎯 Tujuan Project

Project ini dibuat untuk:

* Memenuhi tugas akhir semester
* Mempelajari pengembangan aplikasi berbasis React dan Laravel
* Memahami integrasi frontend dan backend
* Melatih kerja sama tim dalam pengembangan software

---

# 📄 Lisensi

Project ini dibuat untuk keperluan pembelajaran dan tidak diperjualbelikan.
