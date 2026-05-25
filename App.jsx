import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Pages
import LoginPage from './LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import UsersPage from './pages/Users/UsersPage';
import ReportsPage from './pages/Reports/ReportsPage';
import MaintenancePage from './pages/Maintenance/MaintenancePage';
import ProfilePage from './pages/Profile/ProfilePage';

// Components
import AdminRoute from './AdminRoute';
import AdminLayout from './components/Layout/AdminLayout';

function App() {
  const { user, isAdmin, isAuthenticated } = useAuth(); // Pastikan mengambil status admin

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Route Login Khusus Admin */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Grup Route Admin dengan Proteksi dan Layout Sidebar */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Perbaikan Fallback agar tidak bentrok dengan user dashboard */}
          <Route path="*" element={
            isAuthenticated 
              ? (isAdmin ? <Navigate to="/admin/dashboard" /> : <Navigate to="/dashboard" />)
              : <Navigate to="/admin/login" />
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;