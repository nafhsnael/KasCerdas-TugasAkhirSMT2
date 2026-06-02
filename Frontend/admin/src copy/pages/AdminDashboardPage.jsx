import { useEffect, useState } from 'react'

function StatCard({ label, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
      {description ? <div className="mt-1 text-sm text-slate-500">{description}</div> : null}
    </div>
  )
}

function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        setLoading(true)
        setError('')
        const backendUrl = 'https://backend-kascerdas-production.up.railway.app'
        const token = window.localStorage.getItem('token')
        const res = await fetch(`${backendUrl}/api/admin/monitoring/dashboard`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json?.message || 'Gagal mengambil dashboard admin')
        if (mounted) setData(json?.data || json)
      } catch (e) {
        if (mounted) setError(e.message || 'Terjadi kesalahan')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [])

  const totalUsers = data?.stats?.total_users ?? 0
  const activeUsers = data?.stats?.active_users ?? 0
  const totalTransactions = data?.stats?.total_transactions ?? 0
  const transactionsToday = data?.stats?.transactions_today ?? 0

  const transactionsTrend = data?.transactions_trend ?? []
  const topCategories = data?.top_categories ?? []
  const latestUsers = data?.latest_users ?? []
  const latestTransactions = data?.latest_transactions ?? []
  const systemStatus = data?.system_status ?? {}

  return (
    <div className="space-y-4 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Admin</h1>
        <p className="mt-1 text-sm text-slate-500">Ringkasan sistem dan performa keuangan aplikasi.</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Memuat...</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
      ) : (
        <div className="space-y-4">
          {/* Row 1: Stat Cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total User" value={totalUsers} description="Pengguna terdaftar" />
            <StatCard label="User Aktif" value={activeUsers} description="Akun aktif" />
            <StatCard label="Total Transaksi" value={totalTransactions} description="Semua riwayat" />
            <StatCard label="Transaksi Hari Ini" value={transactionsToday} description="Masuk hari ini" />
          </div>


          {/* Row 3: User Terbaru & Transaksi Terbaru */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">User Terbaru</h2>
              <div className="space-y-3">
                {latestUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">{new Date(u.created_at).toLocaleDateString('id-ID')}</div>
                      <div className="text-[10px] uppercase text-[#38ADA9]">{u.user_type || u.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Transaksi Terbaru</h2>
              <div className="space-y-3">
                {latestTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{t.title}</div>
                      <div className="text-xs text-slate-500">{t.user?.name}</div>
                    </div>
                    <div className={`text-sm font-medium ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'income' ? '+' : '-'}Rp {Number(t.amount).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 4: Top Kategori & Status Sistem */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Top Kategori (Berdasarkan Nominal)</h2>
              <div className="space-y-3">
                {topCategories.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                    <div className="text-sm font-medium text-slate-900">{c.category || 'Lainnya'}</div>
                    <div className="text-sm font-medium text-slate-700">
                      Rp {Number(c.total).toLocaleString('id-ID')}
                      <span className="ml-2 text-xs text-slate-400">({c.count}x)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Status Sistem</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                  <div className="text-sm font-medium text-slate-700">Maintenance Mode</div>
                  <div className={`rounded-full px-2 py-1 text-xs font-semibold ${systemStatus.maintenance_active ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {systemStatus.maintenance_active ? 'Aktif' : 'Nonaktif'}
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                  <div className="text-sm font-medium text-slate-700">Error Logs Hari Ini</div>
                  <div className={`text-sm font-bold ${systemStatus.error_logs_today > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {systemStatus.error_logs_today || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboardPage

