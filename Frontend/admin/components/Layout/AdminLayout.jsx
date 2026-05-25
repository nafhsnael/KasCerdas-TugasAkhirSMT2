import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../src copy/components/Sidebar';
import { useAuth } from '../../hooks/useAuth';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = location.pathname.split('/').pop() || 'dashboard';

  const handleNavigate = (page) => {
    navigate(`/admin/${page}`);
  };

  const userProfile = {
    nama: user?.name || 'Admin',
    user: user?.username || 'admin',
    profileImage: user?.profile_image || '/logo.png', // Fallback
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
        userProfile={userProfile} 
        onLogout={logout} 
      />
      <div className="flex-1 ml-64 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;

