import { useEffect, useMemo, useState } from 'react'

function AdminReportsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)

  const token = useMemo(() => {
    try {
      return window.localStorage.getItem('token')
    } catch {
      return null
    }
  }, [])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/monitoring', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message || 'Gagal mengambil laporan global')
      setSummary(json?.data || json)
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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Laporan Global (Admin)</h1>
        <p className="mt-1 text-sm text-slate-500">Ringkasan statistik seluruh sistem.</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Memuat...</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-medium text-slate-500">Total Admin</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{summary?.totalAdmin ?? 0}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-medium text-slate-500">Total Active Users</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{summary?.totalActiveUsers ?? 0}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-medium text-slate-500">Total UMKM</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{summary?.totalUmkm ?? 0}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-medium text-slate-500">Total Masyarakat</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{summary?.totalMasyarakat ?? 0}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReportsPage

