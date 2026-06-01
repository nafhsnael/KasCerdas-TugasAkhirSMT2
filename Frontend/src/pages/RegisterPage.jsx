import { useState } from 'react'

function RegisterPage({ onSwitch, onAuthenticate, showCustomAlert }) {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (password !== confirmPassword) {
      if (typeof showCustomAlert === 'function') {
        showCustomAlert('Password dan konfirmasi password tidak cocok', 'error')
      } else {
        alert('Password dan konfirmasi password tidak cocok')
      }
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
          password,
          password_confirmation: confirmPassword,
        }),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        const firstError = json?.errors ? Object.values(json.errors).flat()[0] : null
        const errorText = firstError || json?.message || '';
        const lowercaseError = errorText.toLowerCase();

        const isAlreadyRegistered = 
          lowercaseError.includes('sudah terdaftar') ||
          lowercaseError.includes('already') ||
          lowercaseError.includes('taken') ||
          lowercaseError.includes('sudah digunakan') ||
          lowercaseError.includes('sudah ada') ||
          lowercaseError.includes('sebelumnya') ||
          lowercaseError.includes('registered') ||
          (json?.errors && (
            (json.errors.email && json.errors.email.some(msg => {
              const m = msg.toLowerCase();
              return m.includes('taken') || m.includes('ada') || m.includes('digunakan') || m.includes('sebelumnya') || m.includes('terdaftar');
            })) ||
            (json.errors.username && json.errors.username.some(msg => {
              const m = msg.toLowerCase();
              return m.includes('taken') || m.includes('ada') || m.includes('digunakan') || m.includes('sebelumnya') || m.includes('terdaftar');
            }))
          ));

        if (isAlreadyRegistered) {
          const msg = 'Akun ini sudah terdaftar. Silakan masuk menggunakan akun Anda.';
          if (typeof showCustomAlert === 'function') {
            showCustomAlert(msg, 'info', () => {
              if (typeof onSwitch === 'function') {
                onSwitch();
              }
            });
          } else {
            alert(msg);
            if (typeof onSwitch === 'function') {
              onSwitch();
            }
          }
          return;
        }

        if (typeof showCustomAlert === 'function') {
          showCustomAlert(errorText || 'Registrasi gagal', 'error')
        } else {
          alert(errorText || 'Registrasi gagal')
        }
        return
      }

      onAuthenticate(
        {
          token: json.data.token,
          username: json.data.user.username,
          email: json.data.user.email,
          name: json.data.user.name,
          role: json.data.user.role,
          user_type: json.data.user.user_type,
          is_active: json.data.user.is_active,
          avatar: json.data.user.avatar,
        },
        true
      )
    } catch (error) {
      if (typeof showCustomAlert === 'function') {
        showCustomAlert('Tidak bisa terhubung ke server. Pastikan backend Laravel sudah jalan.', 'error')
      } else {
        alert('Tidak bisa terhubung ke server. Pastikan backend Laravel sudah jalan.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleRegister = () => {
    window.location.href = `${backendUrl}/auth/google/redirect?flow=register`
  }

  return (
    <div className="mx-auto max-w-4xl rounded-[32px] bg-white px-8 py-10 shadow-2xl shadow-slate-300 sm:px-10">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-[#38ADA9]">
            Buat akun baru
          </p>

          <h2 className="text-3xl font-semibold text-slate-900">
            Daftar untuk mulai mencatat keuangan
          </h2>

          <p className="max-w-md text-slate-500">
            Registrasi cepat untuk mengelola transaksi, melihat laporan, dan memantau budget.
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                placeholder="nama@contoh.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                placeholder="masukkan username"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Konfirmasi Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-3xl bg-[#38ADA9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2f9692] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Memproses...' : 'Daftar'}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200"></div>
              <span className="text-xs font-medium text-slate-400">atau</span>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleRegister}
              className="flex w-full items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-lg">
                G
              </span>
              Daftar dengan Google
            </button>

            <p className="text-center text-sm text-slate-500">
              Sudah punya akun?{' '}
              <button
                type="button"
                className="font-semibold text-[#38ADA9] hover:underline"
                onClick={onSwitch}
              >
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