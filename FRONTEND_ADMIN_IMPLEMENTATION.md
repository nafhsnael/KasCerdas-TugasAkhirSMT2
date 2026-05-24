# 🎨 Frontend Admin Implementation Guide

> Panduan lengkap implementasi Admin Dashboard di Frontend (React + TypeScript)

---

## 📊 Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      USER JOURNEY                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. LANDING PAGE (Public)                                    │
│     └─> User membaca info tentang KasCerdas                 │
│     └─> Button: Login / Register                             │
│                                                               │
│  2. LOGIN PAGE (Public)                                      │
│     └─> Masuk dengan email + password                        │
│     └─> Server validate + return token                       │
│                                                               │
│  3a. ROLE CHECK                                              │
│     ├─> Jika role = 'user' → redirect to User Dashboard     │
│     └─> Jika role = 'admin' → redirect to Admin Dashboard   │
│                                                               │
│  3b. USER DASHBOARD (Private)                                │
│     ├─> User hanya lihat data milik sendiri                 │
│     ├─> Transaction list, Wallet, Budget, Reports           │
│     └─> User Profile, Logout                                │
│                                                               │
│  3c. ADMIN DASHBOARD (Private + Admin-only)                  │
│     ├─> User Management (CRUD all users)                    │
│     ├─> Transaction Monitoring (all users transactions)     │
│     ├─> System Control (maintenance mode, config)           │
│     ├─> Activity Logs                                        │
│     └─> Dashboard Stats & Analytics                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Frontend Folder Structure

```
src/
├── pages/
│   ├── LandingPage.tsx              ← PUBLIC - Landing page
│   ├── LoginPage.tsx                ← PUBLIC - Login form
│   │
│   ├── Admin/                       ← ADMIN ONLY (Protected)
│   │   ├── AdminDashboard.tsx       ← Admin home
│   │   ├── UserManagement.tsx       ← User CRUD
│   │   ├── TransactionMonitoring.tsx ← Monitoring transaksi
│   │   ├── SystemControl.tsx        ← Maintenance & config
│   │   └── ActivityLogs.tsx         ← Activity log viewer
│   │
│   └── User/                        ← USER ONLY (Protected)
│       ├── DashboardPage.tsx        ← User dashboard (existing)
│       ├── TransactionsPage.tsx     ← User transactions
│       └── ... (existing pages)
│
├── components/
│   ├── ProtectedRoute.tsx           ← Route protection wrapper
│   ├── AdminRoute.tsx               ← Admin-only route wrapper (NEW)
│   │
│   ├── Common/
│   │   ├── Navbar.tsx               ← Navigation bar
│   │   ├── Sidebar.tsx              ← Sidebar menu
│   │   └── Footer.tsx               ← Footer
│   │
│   ├── Admin/                       ← Admin components (NEW)
│   │   ├── UserTable.tsx            ← User management table
│   │   ├── UserModal.tsx            ← Edit/add user modal
│   │   ├── TransactionTable.tsx     ← Transaction monitoring table
│   │   ├── MaintenanceToggle.tsx    ← Maintenance mode toggle
│   │   ├── SystemConfigForm.tsx     ← Config settings form
│   │   ├── StatCard.tsx             ← Stats card widget
│   │   └── ActivityLogTable.tsx     ← Activity log viewer
│   │
│   └── User/                        ← User components (existing)
│       ├── TransactionCard.tsx
│       ├── WalletCard.tsx
│       └── ... (existing)
│
├── hooks/
│   ├── useAuth.ts                   ← Auth logic (existing)
│   ├── useAdmin.ts                  ← Admin-specific hooks (NEW)
│   └── useProtectedRoute.ts         ← Route protection logic
│
├── services/
│   ├── api.ts                       ← API client (existing)
│   ├── authService.ts               ← Auth API calls (existing)
│   └── adminService.ts              ← Admin API calls (NEW)
│
├── types/
│   ├── auth.ts                      ← Auth types (existing)
│   ├── admin.ts                     ← Admin types (NEW)
│   └── ... (existing)
│
├── context/
│   └── AuthContext.tsx              ← Auth context (existing)
│
├── App.tsx                          ← Main app with routing
└── main.tsx
```

---

## 🎯 Routing Setup (App.tsx)

```tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages - Public
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

// Pages - User Dashboard (Protected)
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import ... // other user pages

// Pages - Admin Dashboard (Protected + Admin-only)
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import TransactionMonitoring from './pages/Admin/TransactionMonitoring';
import SystemControl from './pages/Admin/SystemControl';
import ActivityLogs from './pages/Admin/ActivityLogs';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ========== PUBLIC ROUTES ========== */}
          {/* Landing page (no auth required) */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Login (redirect if already authenticated) */}
          <Route path="/login" element={<LoginPage />} />

          {/* ========== USER PROTECTED ROUTES ========== */}
          {/* User dashboard (requires auth, not admin) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
          
          {/* ... other user routes */}

          {/* ========== ADMIN PROTECTED ROUTES ========== */}
          {/* Admin dashboard (requires auth + admin role) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/transactions"
            element={
              <AdminRoute>
                <TransactionMonitoring />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/system-control"
            element={
              <AdminRoute>
                <SystemControl />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/logs"
            element={
              <AdminRoute>
                <ActivityLogs />
              </AdminRoute>
            }
          />

          {/* ========== FALLBACK ========== */}
          {/* Jika route tidak ditemukan, redirect ke landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

---

## 🔐 ProtectedRoute Component

Wrapper untuk user routes yang memerlukan authentication:

```tsx
// components/ProtectedRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  // Sedang loading token dari localStorage
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Tidak ada user (belum login)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User sudah login, boleh akses halaman
  return <>{children}</>;
};

export default ProtectedRoute;
```

---

## 🛡️ AdminRoute Component

Wrapper khusus untuk admin routes - hanya user dengan role='admin' yang bisa akses:

```tsx
// components/AdminRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading, isAdmin } = useAuth();

  // Sedang loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Tidak ada user (belum login)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User login tapi bukan admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            Anda tidak memiliki akses ke halaman admin. Hanya admin yang dapat mengakses area ini.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Kembali ke Dashboard
          </a>
        </div>
      </div>
    );
  }

  // User adalah admin, boleh akses
  return <>{children}</>;
};

export default AdminRoute;
```

---

## 🔑 Enhanced useAuth Hook

```tsx
// hooks/useAuth.ts

import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  user_type?: 'umkm' | 'masyarakat_umum' | 'mahasiswa' | null;
  is_active: boolean;
}

interface UseAuthReturn {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize dari localStorage saat mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      
      const { token, user } = response.data.data;
      
      // Save to state
      setToken(token);
      setUser(user);

      // Save to localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }, []);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user && !!token;

  return {
    user,
    token,
    isLoading,
    isAdmin,
    isAuthenticated,
    login,
    logout,
    setUser,
  };
};
```

---

## 🌐 Landing Page Flow

```tsx
// pages/LandingPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  // Jika sudah login, redirect ke dashboard sesuai role
  React.useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, isAdmin, navigate]);

  // Jika belum login, tampilkan landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 bg-white shadow">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">₹</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">KasCerdas</h1>
        </div>
        
        <div className="space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Daftar
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Kelola Keuangan Anda dengan Mudah
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              KasCerdas membantu Anda mengelola keuangan pribadi dan bisnis dengan dashboard 
              yang user-friendly dan powerful.
            </p>
            
            <div className="space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Mulai Sekarang
              </button>
              <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50">
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 h-96">
            {/* Dashboard preview screenshot */}
            <div className="bg-gray-200 h-full rounded animate-pulse"></div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Dashboard Intuitif</h3>
            <p className="text-gray-600">
              Visualisasi data keuangan Anda dengan grafik dan statistik yang mudah dipahami.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-semibold mb-2">Multi Wallet</h3>
            <p className="text-gray-600">
              Kelola beberapa dompet atau rekening dalam satu aplikasi.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold mb-2">Aman & Terpercaya</h3>
            <p className="text-gray-600">
              Data Anda dilindungi dengan enkripsi tingkat enterprise.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-6 mt-16">
        <p>&copy; 2026 KasCerdas. Semua hak dilindungi.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
```

---

## 🔐 Login Page Flow

```tsx
// pages/LoginPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, user, isAdmin, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect jika sudah login
  useEffect(() => {
    if (!isLoading && user) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      // Redirect akan terjadi otomatis via useEffect di atas
    } catch (err: any) {
      setError(err.message || 'Login gagal. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">₹</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">KasCerdas</h1>
          </div>

          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Masuk Akun</h2>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Sedang Masuk...' : 'Masuk'}
            </button>
          </form>

          {/* Test Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200 text-sm text-gray-600">
            <p className="font-semibold mb-2">Test Credentials:</p>
            <p><strong>Admin:</strong> superadmin@example.com / password123</p>
            <p><strong>User:</strong> john@umkm.com / password123</p>
          </div>

          {/* Link ke Landing */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Belum punya akun?{' '}
            <a href="/" className="text-blue-600 font-semibold hover:underline">
              Kembali ke Halaman Utama
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
```

---

## 🎯 User Flow Summary

### ✅ User Baru / Belum Login

```
1. Masuk ke website (/)
   ↓
2. Lihat Landing Page
   ↓
3. Klik "Masuk" atau "Daftar"
   ↓
4. Masuk ke Login Page (/login)
   ↓
5. Input email & password
   ↓
6. Login berhasil → token disimpan
   ↓
7a. Jika role='user' → Redirect ke /dashboard (User Dashboard)
7b. Jika role='admin' → Redirect ke /admin (Admin Dashboard)
```

### ✅ User Sudah Login

```
1. Masuk ke website (/)
   ↓
2. useAuth hook detect user sudah login
   ↓
3a. Jika user (role='user') → Redirect ke /dashboard
3b. Jika admin (role='admin') → Redirect ke /admin
   
(Tidak perlu kembali ke landing page)
```

### ✅ Admin Akses User Route

```
1. Admin coba akses /dashboard (user page)
   ↓
2. ProtectedRoute: Checked ✓ (sudah login)
   ↓
3. Halaman ditampilkan (sama seperti user)
   
(Admin bisa lihat data user, tapi bukan "admin-exclusive")
```

### ✅ User Coba Akses Admin Route

```
1. User coba akses /admin (admin page)
   ↓
2. AdminRoute: Checked
   - ✓ Is authenticated
   - ✗ Is NOT admin
   ↓
3. Tampilkan "Access Denied" page
   ↓
4. Button untuk kembali ke /dashboard
```

---

## 📁 Implementation Checklist

- [ ] Setup routing structure di `App.tsx`
- [ ] Buat `ProtectedRoute` component
- [ ] Buat `AdminRoute` component
- [ ] Update `useAuth` hook dengan `isAdmin` flag
- [ ] Buat `LandingPage` dengan redirect logic
- [ ] Update `LoginPage` dengan redirect logic
- [ ] Buat Admin Dashboard (`/admin`)
- [ ] Buat User Management page (`/admin/users`)
- [ ] Buat Transaction Monitoring page (`/admin/transactions`)
- [ ] Buat System Control page (`/admin/system-control`)
- [ ] Buat Activity Logs page (`/admin/logs`)
- [ ] Create `adminService.ts` untuk API calls
- [ ] Create `useAdmin` hook untuk admin-specific logic
- [ ] Test full flow: Landing → Login → Dashboard (user & admin)
- [ ] Test access control (non-admin can't access /admin)

---

## 🔗 Next Steps

1. **Implement Routing** - Update `App.tsx` dengan routes di atas
2. **Create Components** - ProtectedRoute & AdminRoute
3. **Create Pages** - Landing, Login dengan redirect logic
4. **Create Admin Pages** - Dashboard, User Mgmt, Monitoring, etc
5. **Create Admin Service** - API integration layer
6. **Test Flow** - Ensure landing → login → dashboard flow works

