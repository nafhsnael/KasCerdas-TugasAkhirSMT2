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

  const totalUsers = data?.stats?.totalUsers ?? data?.totalUsers ?? 0
  const totalTransactions = data?.stats?.totalTransactions ?? data?.totalTransactions ?? 0
  const totalRevenue = data?.stats?.totalIncome ?? data?.totalIncome ?? 0
  const totalExpense = data?.stats?.totalExpense ?? data?.totalExpense ?? 0

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Admin</h1>
        <p className="mt-1 text-sm text-slate-500">Ringkasan sistem dan performa keuangan aplikasi.</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Memuat...</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Users" value={totalUsers} description="Pengguna terdaftar" />
          <StatCard
            label="Transaksi"
            value={totalTransactions}
            description="Semua kategori (ringkasan)"
          />
          <StatCard
            label="Total Pemasukan"
            value={`Rp ${Number(totalRevenue).toLocaleString('id-ID')}`}
            description="Akumulasi pemasukan"
          />
          <StatCard
            label="Total Pengeluaran"
            value={`Rp ${Number(totalExpense).toLocaleString('id-ID')}`}
            description="Akumulasi pengeluaran"
          />
        </div>
      )}

      {/* Placeholder chart area: backend sudah punya trend, tapi UI minimal dulu */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-sm font-semibold text-slate-900">Trend (Mini)</div>
        <div className="mt-2 text-sm text-slate-500">
          Grafik trend bisa ditambahkan mengikuti response {`/api/admin/monitoring/dashboard`}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage

