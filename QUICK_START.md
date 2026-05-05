# Quick Start Guide - Aplikasi Manajemen Keuangan Pribadi

## 🚀 Instalasi & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Development Server
```bash
npm run dev
```
Aplikasi akan tersedia di: `http://localhost:5173/`

### 3. Build untuk Production
```bash
npm run build
```

---

## 📁 Struktur Project

```
src/
├── App.jsx                 # Main component dengan routing
├── main.jsx               # Entry point
├── index.css              # Global styles
├── components/            # Reusable components
│   ├── BudgetCard.jsx    # Budget display card
│   ├── Sidebar.jsx       # Navigation sidebar
│   ├── StatCard.jsx      # Statistics card
│   ├── TopBar.jsx        # Top navigation
│   └── TransactionCard.jsx # Transaction display
├── pages/                 # Page components
│   ├── AnalysisPage.jsx  # Financial analysis
│   ├── BudgetPage.jsx    # ⭐ Budget management (NEW)
│   ├── DashboardPage.jsx # Main dashboard
│   ├── DompetPage.jsx    # Wallet selection
│   ├── InitialBalancePage.jsx # Initial balance setup
│   ├── LoginPage.jsx     # Login form
│   ├── ProfilePage.jsx   # User profile
│   ├── RegisterPage.jsx  # Registration form
│   ├── ReportsPage.jsx   # ⭐ Financial reports (NEW)
│   ├── TransactionsPage.jsx # Transaction list
│   └── UserTypePage.jsx  # User type selection
└── utils/
    └── data.js           # Mock data
```

---

## 🎯 Fitur Utama

### ✅ Dashboard
- Ringkasan wallet
- Transaksi terbaru
- Quick budget overview

### ✅ Transaksi
- Input transaksi baru
- Histori transaksi
- Filter berdasarkan tipe

### ✅ Analisis
- Statistik transaksi bulan ini
- Pengeluaran terbesar
- Saldo bulanan

### ✅ **Laporan (NEW)**
- 📅 Laporan Harian
- 📊 Laporan Bulanan
- 📈 Laporan Tahunan
- 💳 Rekap Hutang
- 🎯 Target Tabungan

### ✅ **Budget (NEW)**
- 💰 Set budget per kategori
- 📊 Monitor penggunaan budget
- ⚠️ Alert jika terlampaui
- ✏️ Edit/Delete budget
- 📈 Progress visualization

### ✅ Profil
- Edit data pengguna
- Logout

---

## 🎨 Design System

### Warna Tema
- Primary: `#38ADA9` (Teal)
- Secondary: `#2e8b87` (Dark Teal)
- Highlight: `#F6B93B` (Gold)
- Neutral: Gray scale (Tailwind)

### Typography
- Font Family: System default (via Tailwind)
- Responsive: Mobile-first approach

### Components
- Border Radius: 12-32px (rounded-lg hingga rounded-[32px])
- Padding: Tailwind spacing (4-6 units)
- Shadows: Subtle shadows (shadow-sm)

---

## 🔐 Autentikasi (Demo)

### Credentials untuk Testing
```
Username: nafhsnael
Password: password
```

**Note:** Sistem autentikasi adalah mock untuk demo. Data tersimpan di state React (tidak persisten).

---

## 📋 File Baru yang Ditambahkan

### Pages
1. **ReportsPage.jsx** (266 lines)
   - 5 tab reports dengan statistik lengkap
   - Real-time calculation dari transactions
   - Responsive design

2. **BudgetPage.jsx** (200+ lines)
   - CRUD operations untuk budget
   - Real-time usage calculation
   - Summary cards dan visual progress

### Modified Files
1. **App.jsx**
   - Added imports untuk ReportsPage dan BudgetPage
   - Activated routing untuk 'reports' dan 'budget'
   - Passed transactions data ke kedua pages
   - Added useEffect untuk debug logging

2. **Sidebar.jsx**
   - Added menu items untuk Laporan dan Budget
   - Added icons untuk semua menu items

---

## 📊 Cara Kerja

### Navigation Flow
```
Login → Dashboard → [Select Menu]
                  → Transaksi
                  → Analisis
                  → Laporan (5 tabs)
                  → Budget (dengan CRUD)
                  → Profil
```

### Data Flow
```
User Input → App.jsx State → Component → Render
   ↓
Transactions Array → ReportsPage/BudgetPage → Calculations → Display
```

---

## 🔧 Development Tips

### Hot Module Replacement (HMR)
- Auto-reload saat file berubah
- Preserve state dalam banyak kasus

### Debugging
- Console.log di App.jsx untuk track currentPage
- Browser DevTools untuk inspect state React
- Network tab untuk API calls

### Styling
- Tailwind CSS di semua components
- Custom color via theme (jika perlu update)
- Mobile-first responsive design

---

## ⚡ Performance Tips

### Optimizations
- `useMemo` untuk expensive calculations
- Functional components dengan hooks
- No unnecessary re-renders
- Efficient array filtering dan mapping

### Scalability
- Folder structure siap untuk pertumbuhan
- Easy to add new pages
- Reusable components
- Modular CSS dengan Tailwind

---

## 🐛 Troubleshooting

### Port 5173 sudah terpakai
```bash
npm run dev -- --port 5174
```

### Clear cache
```bash
npm run dev
# Ctrl+C untuk stop
# npm install (jika diperlukan)
```

### Build error
```bash
npm run build  # Check for syntax errors
# Fix dan coba lagi
```

---

## 📚 Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run preview         # Preview build

# Production
npm run build           # Build untuk production
npm run build --watch  # Build dengan watch mode

# Maintenance
npm install            # Install dependencies
npm update             # Update packages
npm audit             # Check security issues
```

---

## 🎓 Learning Resources

### Dokumentasi
- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- Vite: https://vitejs.dev

### Project Files Reference
- Check `FEATURES_DOCUMENTATION.md` untuk detail lengkap fitur
- Check component files untuk contoh implementasi

---

## 📝 Notes

### Fitur yang Bisa Dikembangkan Lebih Lanjut
1. Real database integration (Firebase/PostgreSQL)
2. Charts dan visualisasi data (Chart.js/Recharts)
3. Export reports (PDF/Excel)
4. Push notifications
5. Dark mode theme
6. Multi-language support
7. Advanced filtering
8. Budget alerts

### Known Limitations
- Data hanya tersimpan dalam React state (non-persistent)
- No backend API calls
- Demo authentication (no real login security)

---

## 👨‍💻 Contributor

**Created:** May 5, 2026
**Status:** Production Ready
**Version:** 1.0.0

---

**Selamat menggunakan Aplikasi Manajemen Keuangan Pribadi! 🎉**
