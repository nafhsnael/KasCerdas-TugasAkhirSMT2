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
        const token = window.localStorage.getItem('token')
        const res = await fetch('/api/admin/monitoring/dashboard', {
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

          {/* Row 2: Grafik */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Grafik Pemasukan vs Pengeluaran (30 Hari Terakhir)</h2>
            <div className="flex h-48 items-end gap-2 overflow-x-auto pb-2">
              {transactionsTrend.map((t, idx) => {
                const maxVal = Math.max(...transactionsTrend.map(x => Math.max(x.income, x.expense)), 1)
                const incomeHeight = (t.income / maxVal) * 100
                const expenseHeight = (t.expense / maxVal) * 100
                return (
                  <div key={idx} className="group relative flex min-w-[24px] flex-col items-center gap-1">
                    <div className="flex h-32 w-full items-end gap-[2px]">
                      <div className="w-1/2 rounded-t-sm bg-emerald-400" style={{ height: `${incomeHeight}%` }}></div>
                      <div className="w-1/2 rounded-t-sm bg-rose-400" style={{ height: `${expenseHeight}%` }}></div>
                    </div>
                    <div className="w-full truncate text-center text-[10px] text-slate-400">
                      {new Date(t.date).getDate()}
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full z-10 mb-2 hidden whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block">
                      <div>{t.date}</div>
                      <div className="text-emerald-400">Pemasukan: Rp {Number(t.income).toLocaleString('id-ID')}</div>
                      <div className="text-rose-400">Pengeluaran: Rp {Number(t.expense).toLocaleString('id-ID')}</div>
                    </div>
                  </div>
                )
              })}
              {transactionsTrend.length === 0 && (
                <div className="my-auto w-full text-center text-sm text-slate-500">Belum ada data transaksi bulan ini.</div>
              )}
            </div>
            {/* Legend */}
            {transactionsTrend.length > 0 && (
              <div className="mt-4 flex items-center justify-center gap-4 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-sm bg-emerald-400"></div> Pemasukan</div>
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-sm bg-rose-400"></div> Pengeluaran</div>
              </div>
            )}
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

