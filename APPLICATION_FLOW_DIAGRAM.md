# 🚀 Application Flow & User Journey

> Penjelasan detail alur user journey dari Landing sampai Dashboard

---

## 📊 Complete Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    🌐 USER ENTERS WEBSITE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Step 1: User visits website
│          URL: http://localhost:3000
│          ↓
│  Step 2: App.tsx checks routing
│          ↓
│  Step 3: Route "/" (root) = LandingPage
│          ↓
│  Step 4: LandingPage checks auth status
│          ├─> useAuth hook loads from localStorage
│          ├─> Check if user already logged in
│          │
│          YES (user exists) → Redirect to Dashboard
│          ├─> if role='user' → /dashboard (User Dashboard)
│          └─> if role='admin' → /admin (Admin Dashboard)
│
│          NO (no user) → Show Landing Page
│          ├─> Display app info, features
│          ├─> Show Login/Register buttons
│          └─> User can navigate to /login
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Detailed User Flows

### Flow 1: Belum Login (First Time Visitor)

```
START
  │
  ├─> Visit "/" (Landing Page)
  │   ├─> useAuth check: No user in localStorage
  │   ├─> Show landing page with features
  │   ├─> Show "Login" button
  │   └─> User clicks "Login" → Go to /login
  │
  ├─> Visit "/login" (Login Page)
  │   ├─> useAuth check: No user in localStorage
  │   ├─> Show login form
  │   ├─> User input email & password
  │   ├─> Submit form → authService.login()
  │   │
  │   Login Success:
  │   ├─> Receive token + user object
  │   ├─> Save to localStorage
  │   ├─> useAuth hook detects change
  │   ├─> LoginPage useEffect triggers
  │   └─> Redirect based on role:
  │       ├─> user → /dashboard (User Dashboard)
  │       └─> admin → /admin (Admin Dashboard)
  │
  │   Login Failed:
  │   ├─> Show error message
  │   └─> User can retry
  │
  └─> END (User logged in & redirected)
```

### Flow 2: Sudah Login (Returning Visitor)

```
START
  │
  ├─> Visit "/" (Landing Page)
  │   ├─> useAuth check: User exists in localStorage
  │   ├─> useEffect detects user is logged in
  │   └─> Redirect immediately:
  │       ├─> if user.role='user' → /dashboard (no landing page shown)
  │       └─> if user.role='admin' → /admin (no landing page shown)
  │
  └─> END (User goes directly to their dashboard)
```

### Flow 3: Admin Access User Route

```
START
  │
  ├─> Admin visits "/dashboard" (user page)
  │   ├─> ProtectedRoute checks:
  │   │   ├─> Is user logged in? YES ✓
  │   │   └─> Allow access (admin is technically a logged-in user)
  │   │
  │   ├─> Dashboard page loads
  │   ├─> Admin sees user-level data
  │   └─> Admin can:
  │       ├─> View their own wallet
  │       ├─> View their own transactions
  │       └─> It's like being a regular user but with admin powers
  │
  └─> END (Admin can use user features too)
```

### Flow 4: User Try Access Admin Route (BLOCKED)

```
START
  │
  ├─> User visits "/admin" (admin page)
  │   ├─> AdminRoute checks:
  │   │   ├─> Is user logged in? YES ✓
  │   │   ├─> Is user admin? NO ✗
  │   │   └─> ACCESS DENIED
  │   │
  │   ├─> Show "Access Denied" page
  │   │   ├─> Explain: Only admins can access
  │   │   └─> Button: Back to /dashboard
  │   │
  │   └─> User clicks button → /dashboard
  │
  └─> END (User stays on user-level pages)
```

### Flow 5: Unauthenticated Try Access Protected Route

```
START
  │
  ├─> User visits "/dashboard" (protected route)
  │   ├─> ProtectedRoute checks:
  │   │   ├─> Is user logged in? NO ✗
  │   │   └─> REDIRECT TO LOGIN
  │   │
  │   ├─> User redirected to /login
  │   └─> User sees login form
  │       └─> User must login first
  │
  └─> END (User forced to login)
```

---

## 🗺️ Route Map

### Public Routes (No Auth Required)
```
GET  /                → LandingPage
GET  /login           → LoginPage
POST /api/auth/login  → Backend login endpoint
```

### User Routes (Auth Required)
```
GET  /dashboard        → User Dashboard (protected)
GET  /transactions     → User Transactions (protected)
GET  /budgets         → User Budgets (protected)
GET  /profile         → User Profile (protected)
etc...
```

### Admin Routes (Auth + Admin Role Required)
```
GET  /admin                    → Admin Dashboard (protected + admin-only)
GET  /admin/users             → User Management (protected + admin-only)
GET  /admin/transactions      → Transaction Monitoring (protected + admin-only)
GET  /admin/system-control    → System Control (protected + admin-only)
GET  /admin/logs              → Activity Logs (protected + admin-only)
```

---

## 💾 Data Flow (LocalStorage)

### Saat Login Berhasil:
```javascript
// Response dari /api/auth/login
{
  success: true,
  data: {
    token: "xxx...xxx",  // Sanctum token
    user: {
      id: 1,
      name: "Super Admin",
      email: "superadmin@example.com",
      role: "admin",        // ← KUNCI: ini yang determine akses
      user_type: null,
      is_active: true
    }
  }
}

// Disimpan di localStorage:
localStorage.setItem('auth_token', "xxx...xxx");
localStorage.setItem('user', JSON.stringify({
  id: 1,
  name: "Super Admin",
  role: "admin",
  ...
}));
```

### Saat Logout:
```javascript
// Clear localStorage
localStorage.removeItem('auth_token');
localStorage.removeItem('user');

// User redirected to /login
```

---

## 🔐 AuthContext/useAuth Hook Logic

```typescript
// Pseudo-code of useAuth flow

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // INITIALIZATION (on mount)
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      // Restore user from localStorage
      setUser(JSON.parse(storedUser));
    }
    // Otherwise user stays null

    setIsLoading(false);
  }, []);

  const login = (email, password) => {
    // Call backend API
    const response = await api.post('/auth/login', { email, password });
    
    // Save token & user
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // Update state
    setUser(response.user);
    
    // Component will re-render with new user
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // Update state
    setUser(null);
    
    // Component will re-render without user
  };

  return {
    user,              // null or {id, name, email, role, ...}
    isLoading,         // true while initializing
    isAdmin: user?.role === 'admin',  // Computed value
    login,
    logout
  };
};
```

---

## 📱 Component Rendering Logic

### LandingPage Component Flow

```tsx
const LandingPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Effect: Redirect jika sudah login
  useEffect(() => {
    if (user) {  // user exists (not null)
      if (isAdmin) {
        navigate('/admin', { replace: true });  // Go to admin dashboard
      } else {
        navigate('/dashboard', { replace: true }); // Go to user dashboard
      }
    }
  }, [user, isAdmin]);

  // If user is null, show landing page
  return (
    <div>
      <h1>Welcome to KasCerdas</h1>
      <button onClick={() => navigate('/login')}>Login</button>
    </div>
  );
};
```

### LoginPage Component Flow

```tsx
const LoginPage = () => {
  const { login, user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Effect: Redirect jika sudah login
  useEffect(() => {
    if (!isLoading && user) {  // user exists (logged in)
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // useEffect above akan trigger redirect
    } catch (error) {
      // Show error
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
};
```

### ProtectedRoute Component Flow

```tsx
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!user) {  // No user = not logged in
    return <Navigate to="/login" />;  // Redirect to login
  }

  return <>{children}</>;  // User exists, show page
};
```

### AdminRoute Component Flow

```tsx
const AdminRoute = ({ children }) => {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!user) {  // Not logged in
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {  // Logged in but not admin
    return <div>Access Denied</div>;
  }

  return <>{children}</>;  // Is admin, show page
};
```

---

## 🔀 Decision Tree

```
┌─ User visits /
│
├─ useAuth checks localStorage
│  ├─ token exists? → user exists → is user set?
│  │  ├─ YES → Show Landing (then useEffect redirects)
│  │  └─ NO → Show Landing
│  │
│  ├─ NO token → user = null
│  │  └─ Show Landing
│
├─ LandingPage useEffect runs
│  ├─ user is null?
│  │  └─ NO redirect, show landing page
│  │
│  ├─ user exists?
│  │  ├─ role = admin? → navigate('/admin')
│  │  └─ role = user? → navigate('/dashboard')
│
└─ END: User either sees Landing or redirected to Dashboard

────────────────────────────────────────────────

┌─ User visits /login
│
├─ LoginPage renders
│
├─ LoginPage useEffect runs
│  ├─ isLoading = true? → Show loading
│  └─ user exists? → Redirect (same as landing page)
│
├─ User fills form & submits
│
├─ login() function calls
│  ├─ POST /api/auth/login
│  ├─ Receive token + user
│  ├─ Save to localStorage
│  ├─ setUser(user) → state update
│
├─ Re-render with new user
│
├─ LoginPage useEffect runs again
│  ├─ user exists now? → YES
│  ├─ role = admin? → navigate('/admin')
│  ├─ role = user? → navigate('/dashboard')
│
└─ END: User redirected to their dashboard

────────────────────────────────────────────────

┌─ User visits /admin
│
├─ AdminRoute checks
│  ├─ isLoading = true? → Show loading
│  ├─ user = null? → Navigate to /login (not logged in)
│  ├─ isAdmin = false? → Show "Access Denied"
│  └─ isAdmin = true? → Show <AdminDashboard />
│
└─ END: Either login page, access denied, or admin dashboard
```

---

## ⚙️ Key State Management

### AuthContext / useAuth Hook State

| State | Type | Initial | Usage |
|-------|------|---------|-------|
| `user` | User \| null | null | Current logged-in user |
| `token` | string \| null | null | JWT token for API |
| `isLoading` | boolean | true | Loading indicator |
| `isAdmin` | boolean | false | Computed from user.role |
| `isAuthenticated` | boolean | false | Computed from user != null |

### Component Local State

| Component | State | Purpose |
|-----------|-------|---------|
| LoginPage | email, password, error, isSubmitting | Form handling |
| UserTable | page, search | Pagination & filtering |
| TransactionTable | filters, page | Filter & pagination |

---

## 🧪 Testing the Flow

### Test 1: Fresh User (No Login)
```
1. Open http://localhost:3000
2. Should see Landing Page
3. Click "Login"
4. Should go to /login
5. Input credentials
6. Login success → Redirect to /dashboard or /admin
```

### Test 2: Returning User
```
1. Open DevTools → Application → LocalStorage
2. Should see: auth_token & user
3. Open http://localhost:3000
4. Should automatically redirect (skip landing page)
5. Go directly to dashboard
```

### Test 3: User Access Admin Route
```
1. Login as regular user
2. Open browser console
3. Type: window.location.href = '/admin'
4. Should see "Access Denied" page
5. Can't access /admin
```

### Test 4: Admin Can Access User Route
```
1. Login as admin
2. Navigate to /dashboard (user page)
3. Should load normally
4. Admin can use user features too
```

---

## 📋 Summary

| Scenario | Landing Page | What Happens |
|----------|--------------|--------------|
| No login | SHOW | User clicks Login → Go to /login |
| Has login (user) | SKIP | Redirect to /dashboard |
| Has login (admin) | SKIP | Redirect to /admin |
| Try /admin (user) | N/A | Access Denied page |
| Try /dashboard (admin) | N/A | Page loads (admin can use too) |
| Try /dashboard (no login) | N/A | Redirect to /login |

---

**Next Steps:**
1. ✅ Understand this flow
2. ⏳ Implement routing in App.tsx
3. ⏳ Create ProtectedRoute & AdminRoute
4. ⏳ Create LandingPage & LoginPage dengan redirect logic
5. ⏳ Create Admin pages & components
6. ⏳ Test the entire flow

