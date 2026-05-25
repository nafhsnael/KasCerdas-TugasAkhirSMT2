import React from 'react';
import { Outlet } from 'react-router-dom';

// Minimal layout untuk nested routes /admin/*
const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  );
};

export default AdminLayout;

