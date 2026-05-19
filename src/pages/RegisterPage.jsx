import { useState } from 'react'

function RegisterPage({ onSwitch, onAuthenticate }) {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (password !== confirmPassword) {
      alert('Password dan konfirmasi password tidak cocok')
      return
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        username,
        password,
        password_confirmation: confirmPassword,
      }),
    })

    const json = await res.json()
    if (!res.ok || !json.success) {
      alert(json?.message || 'Registrasi gagal')
      return
    }

    onAuthenticate({
      token: json.data.token,
      username: json.data.user.username,
      email: json.data.user.email,
      role: json.data.user.role,
      user_type: json.data.user.user_type,
    }, true)
  }

  return (
    <div className="mx-auto max-w-4xl rounded-[32px] bg-white px-8 py-10 shadow-2xl shadow-slate-300 sm:px-10">      
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-[#38ADA9]">Buat akun baru</p>
          <h2 className="text-3xl font-semibold text-slate-900">Daftar untuk mulai mencatat keuangan</h2>
          <p className="max-w-md text-slate-500">
            Registrasi cepat untuk mengelola transaksi, melihat laporan, dan memantau budget.
          </p>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                placeholder="nama@contoh.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                placeholder="masukkan username"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Konfirmasi Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                placeholder="••••••••"
              />
            </div>
            <button className="w-full rounded-3xl bg-[#38ADA9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#38ADA9]">
              Daftar
            </button>
            <p className="text-center text-sm text-slate-500">
              Sudah punya akun?{' '}
              <button type="button" className="font-semibold text-[#38ADA9]" onClick={onSwitch}>
                Masuk
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
