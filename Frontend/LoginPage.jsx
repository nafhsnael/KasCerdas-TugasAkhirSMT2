// LoginPage - Detail antarmuka admin termasuk bayangan kotak dan jarak antar elemen
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100 animate-fade-in-up">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-[#38ADA9] font-semibold mb-1">
            Panel Administrator
          </p>
          <h2 className="text-2xl font-bold text-slate-900">
            KasCerdas Admin
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Masuk untuk mengelola sistem dan data pengguna
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Username Admin / Email
            </label>
            <input
              type="text"
              placeholder="masukkan username admin"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]/20 transition-all duration-200 text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]/20 transition-all duration-200 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-3xl bg-[#38ADA9] py-3 font-semibold text-white shadow-lg shadow-teal-600/10 hover:bg-[#2f9692] hover:scale-105 active:scale-95 transition-all duration-300 text-sm"
          >
            Login Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;