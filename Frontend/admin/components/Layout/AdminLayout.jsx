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

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
        onLogout={logout} 
      />
      <div className="flex-1 ml-64 p-4 md:p-6 lg:p-8 pt-10 sm:pt-12 lg:pt-14 w-full max-w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
