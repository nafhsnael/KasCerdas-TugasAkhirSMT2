import { useEffect, useState } from 'react'

function AdminMaintenancePage() {
  const backendUrl = 'https://backend-kascerdas-production.up.railway.app'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEnabled, setIsEnabled] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const token = (() => {
    try {
      return window.localStorage.getItem('token')
    } catch {
      return null
    }
  })()

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${backendUrl}/api/admin/maintenance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message || 'Gagal mengambil status maintenance')
      const data = json?.data || json
      setIsEnabled(Boolean(data?.maintenance_active ?? data?.enabled ?? data?.is_enabled ?? data?.status ?? false))
    } catch (e) {
      setError(e.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const enable = async () => {
    setError('')
    setActionLoading(true)
    try {
      const res = await fetch(`${backendUrl}/api/admin/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ enabled: true }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message || 'Gagal mengaktifkan maintenance')
      await load()
    } catch (e) {
      setError(e.message || 'Terjadi kesalahan')
    } finally {
      setActionLoading(false)
    }
  }

  const disable = async () => {
    setError('')
    setActionLoading(true)
    try {
      const res = await fetch(`${backendUrl}/api/admin/maintenance`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message || 'Gagal menonaktifkan maintenance')
      await load()
    } catch (e) {
      setError(e.message || 'Terjadi kesalahan')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mode Maintenance</h1>
        <p className="mt-1 text-sm text-slate-500">Aktifkan mode maintenance agar user non-admin tidak bisa menggunakan aplikasi.</p>
      </div>

      {loading ? (
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#38ADA9] border-t-transparent"></span>
            Memuat status maintenance...
          </div>
        </div>
      ) : error ? (
        <div className="rounded-[32px] border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">{error}</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Status Card */}
          <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isEnabled ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                {isEnabled ? (
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                )}
              </div>
              <div className="text-sm font-semibold text-slate-900">Status Saat Ini</div>
            </div>
            <div className={`text-3xl font-bold ${isEnabled ? 'text-amber-600' : 'text-[#38ADA9]'}`}>
              {isEnabled ? 'AKTIF' : 'NONAKTIF'}
            </div>
            <div className="mt-2 text-sm text-slate-500">
              {isEnabled ? 'Aplikasi dalam mode maintenance. Pengguna biasa tidak dapat mengakses sistem.' : 'Aplikasi berjalan normal. Semua pengguna dapat mengakses sistem.'}
            </div>
            {/* Indicator dot */}
            <div className="mt-4 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isEnabled ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              <span className="text-xs text-slate-400 font-medium">{isEnabled ? 'Maintenance Mode' : 'Sistem Online'}</span>
            </div>
          </div>

          {/* Control Card */}
          <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-slate-900">Kontrol</div>
            </div>
            <p className="text-sm text-slate-500 mb-5">Tekan tombol di bawah untuk mengubah status mode maintenance.</p>
            <div className="flex gap-3">
              <button
                disabled={isEnabled || actionLoading}
                onClick={enable}
                className="flex-1 rounded-2xl bg-[#38ADA9] px-5 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-40 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
              >
                {actionLoading && !isEnabled ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Memproses...
                  </span>
                ) : 'Aktifkan'}
              </button>
              <button
                disabled={!isEnabled || actionLoading}
                onClick={disable}
                className="flex-1 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-700 border border-slate-200 shadow-sm disabled:opacity-40 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
              >
                {actionLoading && isEnabled ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent"></span>
                    Memproses...
                  </span>
                ) : 'Nonaktifkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="rounded-[32px] border border-slate-100 bg-slate-50/50 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-slate-700">Catatan Penting</p>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Mode maintenance akan mencegah semua pengguna non-admin mengakses API dan halaman utama aplikasi.
              Admin tetap dapat login dan menggunakan panel admin selama mode ini aktif.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminMaintenancePage
