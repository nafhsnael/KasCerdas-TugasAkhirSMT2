import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user, isAdmin, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    console.log("Current User Data:", user); // Tambahkan log ini
    console.log("Is Admin Status:", isAdmin); // Tambahkan log ini

    if (user) {
      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        // Jika masuk sini, berarti role di database BUKAN 'admin'
        alert(`Akses Ditolak: Role anda adalah ${user.role}. Gunakan akun admin.`);
      }
    }
  }, [user, isAdmin, navigate]);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (error) {
      console.error(error);
      alert("Login Gagal: Cek username/password. Pastikan anda menggunakan akun admin.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-teal-600">Admin KasCerdas</h2>
        <div className="mb-4">
          <input type="text" placeholder="Username Admin" className="w-full p-2 border rounded" 
            value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="mb-6">
          <input type="password" placeholder="Password" className="w-full p-2 border rounded" 
            value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="w-full bg-teal-600 text-white p-2 rounded hover:bg-teal-700 transition">Login Admin</button>
      </form>
    </div>
  );
};

export default LoginPage;