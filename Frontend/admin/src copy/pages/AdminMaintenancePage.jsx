import { useEffect, useState } from 'react'

function AdminMaintenancePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEnabled, setIsEnabled] = useState(false)

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
      const res = await fetch('/api/admin/maintenance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message || 'Gagal mengambil status maintenance')
      const data = json?.data || json
      setIsEnabled(Boolean(data?.enabled ?? data?.is_enabled ?? data?.status ?? false))
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
    try {
      const res = await fetch('/api/admin/maintenance', {
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
    }
  }

  const disable = async () => {
    setError('')
    try {
      const res = await fetch('/api/admin/maintenance', {
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
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Maintenance</h1>
        <p className="mt-1 text-sm text-slate-500">Aktifkan mode maintenance agar user non-admin tidak bisa menggunakan aplikasi.</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Memuat...</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-semibold text-slate-900">Status Saat Ini</div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {isEnabled ? 'ON' : 'OFF'}
            </div>
            <div className="mt-1 text-sm text-slate-500">
              {isEnabled ? 'Aplikasi dalam mode maintenance' : 'Aplikasi normal'}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-semibold text-slate-900">Kontrol</div>
            <div className="mt-3 flex gap-2">
              <button
                disabled={isEnabled}
                onClick={enable}
                className="rounded-lg bg-[#38ADA9] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Aktifkan
              </button>
              <button
                disabled={!isEnabled}
                onClick={disable}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 disabled:opacity-50"
              >
                Nonaktifkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMaintenancePage

