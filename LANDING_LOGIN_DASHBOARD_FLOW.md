# ✅ Landing → Login → Dashboard Flow Confirmation

> Penjelasan singkat alur yang BENAR: Pengguna masuk Landing Page dulu, baru Login, baru Dashboard

---

## 🎯 Alur yang BENAR

```
USER JOURNEY (Yang Benar)
├─ 1. USER MASUK WEBSITE
│  └─> URL: http://localhost:3000
│
├─ 2. LANDING PAGE (Halaman pertama yang dilihat)
│  └─> Halaman berisi: Info app, fitur, tombol Login
│
├─ 3. USER KLIK "LOGIN"
│  └─> Navigate ke /login
│
├─ 4. LOGIN PAGE (Form email + password)
│  ├─> User input credentials
│  └─> Click "Masuk"
│
├─ 5. LOGIN SUCCESS (Backend validate & return token)
│  ├─> Token disimpan di localStorage
│  ├─> useAuth hook detect user logged in
│  └─> Component re-render dengan user data
│
├─ 6. AUTO REDIRECT ke Dashboard
│  ├─> Jika user (role='user') → /dashboard (User Dashboard)
│  └─> Jika admin (role='admin') → /admin (Admin Dashboard)
│
└─ 7. DASHBOARD (User lihat data mereka)
```

---

## 💾 Implementation Detail

### Step 1: User Masuk Website

**Browser**: http://localhost:3000
**Route Handler**: App.tsx → Route "/" = LandingPage

```tsx
// App.tsx
<Routes>
  <Route path="/" element={<LandingPage />} />
  ...
</Routes>
```

### Step 2: LandingPage Render

**File**: pages/LandingPage.tsx

```tsx
const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // PENTING: Check apakah user sudah login
  useEffect(() => {
    if (user) {
      // User sudah login, jangan tunjukkan landing page
      // Langsung redirect ke dashboard
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user]);

  // Jika belum login, tampilkan landing page
  return (
    <div>
      <h1>Selamat datang di KasCerdas</h1>
      <p>Kelola keuangan Anda dengan mudah</p>
      
      <button onClick={() => navigate('/login')}>
        Masuk Akun
      </button>
    </div>
  );
};
```

**Yang terjadi:**
- ✅ User pertama kali → user = null → Tampilkan landing page
- ✅ User sudah login → user exists → Auto redirect ke dashboard (skip landing)

### Step 3: User Klik "Masuk"

**Action**: Button di LandingPage navigates ke /login

```tsx
<button onClick={() => navigate('/login')}>
  Masuk Akun
</button>
```

### Step 4: LoginPage Render

**File**: pages/LoginPage.tsx

```tsx
const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Check jika user sudah login
  useEffect(() => {
    if (user) {
      // Jangan tunjukkan login page jika sudah login
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Setelah login success, useEffect di atas akan trigger
      // dan automatic redirect ke dashboard
    } catch (error) {
      // Tampilkan error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Masuk</button>
    </form>
  );
};
```

### Step 5: Login Success & Token Save

**File**: hooks/useAuth.ts

```tsx
const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  
  const { token, user } = response.data.data;
  
  // SIMPAN KE LOCALSTORAGE
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  // UPDATE STATE
  setUser(user);
  setToken(token);
  
  // STATE UPDATE TRIGGER RE-RENDER
  // useEffect di LoginPage akan run lagi
};
```

### Step 6: Auto Redirect

Setelah state update, useEffect di LoginPage akan run:

```tsx
useEffect(() => {
  if (user) {  // user is now set (login success)
    if (user.role === 'admin') {
      navigate('/admin', { replace: true });  // Go to admin dashboard
    } else {
      navigate('/dashboard', { replace: true }); // Go to user dashboard
    }
  }
}, [user]);  // Re-run when user changes
```

### Step 7: Dashboard Page

**User**: /dashboard → User Dashboard
**Admin**: /admin → Admin Dashboard

---

## 🔐 Protecting Pages

### ProtectedRoute (untuk user routes)

```tsx
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  // JIKA TIDAK ADA USER (belum login)
  if (!user) {
    return <Navigate to="/login" replace />;  // Force login
  }

  // JIKA ADA USER (sudah login)
  return <>{children}</>;
};

// Usage di App.tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### AdminRoute (untuk admin-only routes)

```tsx
const AdminRoute = ({ children }) => {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  // JIKA TIDAK LOGIN
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // JIKA LOGIN TAPI BUKAN ADMIN
  if (!isAdmin) {
    return <div className="error">Access Denied - Admin Only</div>;
  }

  // JIKA ADMIN
  return <>{children}</>;
};

// Usage di App.tsx
<Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  }
/>
```

---

## 📊 Complete Routes in App.tsx

```tsx
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ===== PUBLIC ROUTES ===== */}
          {/* Landing page - pertama kali user masuk */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Login page */}
          <Route path="/login" element={<LoginPage />} />

          {/* ===== USER PROTECTED ROUTES ===== */}
          {/* Hanya user yang sudah login */}
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

          {/* ===== ADMIN PROTECTED ROUTES ===== */}
          {/* Hanya admin yang sudah login */}
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

          {/* ===== FALLBACK ===== */}
          {/* Jika route tidak ditemukan, ke landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

---

## 🧪 Test Scenarios

### Test 1: Fresh User (First Time)

```
1. Browser: http://localhost:3000
   Expected: Lihat LandingPage (bukan redirect)
   
2. User belum login
   useAuth check: user = null
   LandingPage useEffect: if (user) → false, tidak redirect
   Result: ✅ Tampilkan landing page
   
3. User klik "Login"
   navigate('/login')
   
4. Browser: http://localhost:3000/login
   Expected: Lihat LoginPage form
   
5. LoginPage useEffect: if (user) → false, tidak redirect
   Result: ✅ Tampilkan login form
   
6. User input email & password
   Click "Masuk"
   
7. login() function:
   POST /api/auth/login → success
   localStorage.setItem() → save token & user
   setUser(user) → state update
   
8. LoginPage re-render
   useEffect: if (user) → true, REDIRECT!
   if (user.role === 'user') → navigate('/dashboard')
   
9. Browser redirect: /login → /dashboard
   Expected: Lihat DashboardPage
   Result: ✅ Auto redirect success
```

### Test 2: Returning User (Sudah Login)

```
1. Browser: http://localhost:3000
   Expected: Lihat DashboardPage (bukan landing)
   
2. User sudah login (localStorage ada token & user)
   useAuth initialization: detect token
   setUser(user) → state update
   
3. LandingPage render
   useEffect: if (user) → true, REDIRECT!
   if (user.role === 'admin') → navigate('/admin')
   
4. Browser redirect: / → /admin
   Expected: Langsung lihat AdminDashboard
   Result: ✅ Auto redirect success (skip landing page)
```

### Test 3: Non-Admin Try Access Admin Route

```
1. User login sebagai regular user
2. Browser: http://localhost:3000/admin
   Expected: Access Denied page
   
3. AdminRoute check:
   isLoading = false ✓
   user exists ✓
   isAdmin = false ✗
   
4. AdminRoute return: <div>Access Denied</div>
   Result: ✅ Blocked dari admin page
   
5. User click "Back to Dashboard"
   navigate('/dashboard')
   
6. Browser: /dashboard
   Result: ✅ Go back to user dashboard
```

---

## ✅ Implementation Checklist

### Setup Phase
- [ ] Create `pages/LandingPage.tsx` with useAuth redirect logic
- [ ] Create `pages/LoginPage.tsx` with useAuth redirect logic
- [ ] Create `components/ProtectedRoute.tsx`
- [ ] Create `components/AdminRoute.tsx`
- [ ] Update `hooks/useAuth.ts` with isAdmin flag
- [ ] Update `App.tsx` with all routes

### Testing Phase
- [ ] Test: Fresh user → Landing Page → Login → Dashboard
- [ ] Test: Returning user → Auto redirect to dashboard
- [ ] Test: Non-admin try admin page → Access denied
- [ ] Test: Admin can access user pages
- [ ] Test: Logout → Back to login page
- [ ] Test: Direct URL access (e.g., /admin) → Proper handling

### Debugging
- [ ] Check localStorage: auth_token & user
- [ ] Check useAuth hook: user state
- [ ] Check Route matching: /login, /dashboard, /admin
- [ ] Check Redirect logic: useEffect in LandingPage & LoginPage

---

## 🎓 Key Concepts

### 1. useAuth Hook is the Authority
```
useAuth hook menyimpan user state
Semua component mendengarkan user state dari useAuth
Jika user berubah → semua component re-render
```

### 2. localStorage is the Persistence
```
Saat user logout di tab A:
localStorage.removeItem('auth_token')
useAuth detect change
Semua tab A component update

Tab B masih punya localStorage?
Tidak, karena localStorage shared across tabs
Tab B juga akan logout
```

### 3. Redirect Logic in useEffect
```
Landing Page:
- useEffect check if user exists
- Jika exist → redirect ke dashboard
- Jika null → show landing

Login Page:
- useEffect check if user exists
- Jika exist → redirect ke dashboard
- Jika null → show login form
```

### 4. ProtectedRoute vs AdminRoute
```
ProtectedRoute:
- Check: Is user logged in?
- Action: if no → redirect to /login
- Allow: both user & admin

AdminRoute:
- Check: Is user logged in AND is admin?
- Action: if no → redirect to /login OR show access denied
- Allow: only admin
```

---

## 🎯 Summary

**ALUR YANG BENAR:**

1. **User masuk website** → Landing Page (jika belum login)
2. **User klik Login** → Login Page dengan form
3. **User submit credentials** → Backend validate
4. **Backend return token** → Save ke localStorage
5. **useAuth detect change** → Component re-render
6. **useEffect check user** → Auto redirect ke dashboard
7. **User see Dashboard** → Sesuai role (admin/user)

**RETURNING USER:**

1. **User masuk website** → Check localStorage
2. **useAuth find token** → Load user from localStorage
3. **LandingPage useEffect** → Detect user exists
4. **Auto redirect** → /admin (if admin) atau /dashboard (if user)
5. **Skip landing page** → Direct ke dashboard

**PROTECTION:**

- ✅ ProtectedRoute: Hanya user yang login bisa akses
- ✅ AdminRoute: Hanya admin yang bisa akses
- ✅ useEffect: Auto redirect jika belum login
- ✅ localStorage: Persist user data across page reload

---

**Status**: ✅ Frontend Flow Structure **COMPLETE**

**Ready to implement**: Follow FRONTEND_ADMIN_IMPLEMENTATION.md

