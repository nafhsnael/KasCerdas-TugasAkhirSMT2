import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext'; // Pastikan ini mengarah ke root context

// Pages
import LoginPage from '../LoginPage'; // Pastikan ini mengarah ke root LoginPage
import DashboardPage from './pages/Dashboard/DashboardPage';
import UsersPage from './pages/Users/UsersPage';
import ReportsPage from './pages/Reports/ReportsPage';
import MaintenancePage from './pages/Maintenance/MaintenancePage';
import DatabasePage from './pages/Database/DatabasePage';

// Components
import AdminRoute from './AdminRoute';
import AdminLayout from './components/Layout/AdminLayout';

function App() {
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
            {/* Pastikan index langsung ke dashboard admin */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="database" element={<DatabasePage />} />
          </Route>

          {/* Fallback: Jika tidak ditemukan, lempar ke login admin */}
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;