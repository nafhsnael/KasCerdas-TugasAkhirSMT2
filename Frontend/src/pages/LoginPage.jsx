import { useState } from 'react'
import CustomModal from '../components/CustomModal'

function LoginPage({ onSwitch, onAuthenticate }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
  })

  const showAlert = (message, title = 'Pemberitahuan') => {
    setModalConfig({
      isOpen: true,
      title,
      message,
    })
  }

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
        showAlert(firstError || json?.message || 'Login gagal', 'Gagal Masuk')
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
      showAlert('Tidak bisa terhubung ke server. Pastikan backend Laravel sudah jalan.', 'Koneksi Gagal')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${backendUrl}/auth/google/redirect?flow=login`
  }

  return (
    <div className="mx-auto max-w-4xl rounded-[32px] bg-white px-8 py-10 shadow-xl shadow-slate-200/50 border border-slate-100 sm:px-10 animate-fade-in-up">
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
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9] transition-all duration-200"
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
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9] transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-3xl bg-[#38ADA9] px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#2f9692] hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 shadow-lg shadow-teal-600/10"
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
              className="flex w-full items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:bg-slate-50 hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
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

      <CustomModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}

export default LoginPage