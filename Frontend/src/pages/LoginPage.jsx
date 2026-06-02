import { useState } from 'react'

function LoginPage({ onSwitch, onAuthenticate }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const backendUrl = 'https://backend-kascerdas-production.up.railway.app'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        const firstError = json?.errors ? Object.values(json.errors).flat()[0] : null
        alert(firstError || json?.message || 'Login gagal')
        return
      }

      onAuthenticate({
        token: json.data.token,
        username: json.data.user.username,
        email: json.data.user.email,
        user_type: json.data.user.user_type,
        name: json.data.user.name,
        role: json.data.user.role,
        is_active: json.data.user.is_active,
        avatar: json.data.user.avatar,
      })
    } catch (error) {
      alert('Tidak bisa terhubung ke server. Pastikan backend Laravel sudah jalan.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${backendUrl}/auth/google/redirect?flow=login`
  }

  return (
    <div className="mx-auto max-w-4xl rounded-[32px] bg-white px-8 py-10 shadow-2xl shadow-slate-300 sm:px-10">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-[#38ADA9]">
            Selamat datang
          </p>

          <h2 className="text-3xl font-semibold text-slate-900">
            Login ke akun keuanganmu
          </h2>

          <p className="max-w-md text-slate-500">
            Masuk untuk mengelola transaksi, budget, dan melihat laporan keuangan harian.
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Username / Email
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                placeholder="masukkan username atau email"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-3xl bg-[#38ADA9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2f9692] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200"></div>
              <span className="text-xs font-medium text-slate-400">atau</span>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-lg">
                G
              </span>
              Masuk dengan Google
            </button>

            <p className="text-center text-sm text-slate-500">
              Belum punya akun?{' '}
              <button
                type="button"
                className="font-semibold text-[#38ADA9] hover:underline"
                onClick={onSwitch}
              >
                Daftar sekarang
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage