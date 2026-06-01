import { useEffect, useMemo, useState } from 'react'

function formatRupiah(n) {
  return `Rp ${Number(n || 0).toLocaleString('id-ID')}`
}

function formatDate(dateString) {
  if (!dateString) return '-'
  try {
    const d = new Date(dateString)
    return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return dateString
  }
}

function AdminReportsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)

  // Users listing state for filter dropdown
  const [users, setUsers] = useState([])
  
  // Transactions state
  const [transactions, setTransactions] = useState([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [transactionType, setTransactionType] = useState('')
  const [transactionSearch, setTransactionSearch] = useState('')
  const [transactionPage, setTransactionPage] = useState(1)
  const [transactionTotalPages, setTransactionTotalPages] = useState(1)
  const [transactionSummary, setTransactionSummary] = useState(null)

  // Temporary inputs to apply filter only on button click or form submit
  const [filterUserId, setFilterUserId] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterSearch, setFilterSearch] = useState('')

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

  const loadUsersList = async () => {
    try {
      const res = await fetch('/api/admin/users?per_page=1000', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok) {
        const data = json?.data || json
        setUsers(data?.users || data?.items || data?.data || data || [])
      }
    } catch (e) {
      console.error('Gagal mengambil daftar pengguna:', e)
    }
  }

  const loadTransactionsList = async (page = 1) => {
    setLoadingTransactions(true)
    try {
      const params = new URLSearchParams()
      params.append('page', String(page))
      params.append('per_page', '10')
      if (selectedUserId) params.append('user_id', selectedUserId)
      if (transactionType) params.append('type', transactionType)
      if (transactionSearch) params.append('search', transactionSearch)

      const res = await fetch(`/api/admin/monitoring/transactions?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message || 'Gagal mengambil daftar transaksi')
      
      const resData = json?.data || {}
      setTransactions(resData.data || [])
      setTransactionPage(resData.current_page || 1)
      setTransactionTotalPages(resData.last_page || 1)
      setTransactionSummary(json?.summary || null)
    } catch (e) {
      console.error('Gagal mengambil daftar transaksi:', e)
    } finally {
      setLoadingTransactions(false)
    }
  }

  useEffect(() => {
    load()
    loadUsersList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load transactions whenever filter states change, or page changes
  useEffect(() => {
    loadTransactionsList(transactionPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId, transactionType, transactionPage])

  const handleApplyFilter = (e) => {
    if (e) e.preventDefault()
    setSelectedUserId(filterUserId)
    setTransactionType(filterType)
    setTransactionSearch(filterSearch)
    setTransactionPage(1) // Reset to first page
    // Trigger load directly if they are already the same to ensure update
    if (selectedUserId === filterUserId && transactionType === filterType && transactionSearch === filterSearch) {
      loadTransactionsList(1)
    }
  }

  const handleResetFilter = () => {
    setFilterUserId('')
    setFilterType('')
    setFilterSearch('')
    setSelectedUserId('')
    setTransactionType('')
    setTransactionSearch('')
    setTransactionPage(1)
  }

  return (
    <div className="space-y-6">
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
            <div className="mt-2 text-2xl font-semibold text-slate-900">{summary?.users_overview?.total_admin ?? 0}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-medium text-slate-500">Total Active Users</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{summary?.users_overview?.total_active ?? 0}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-medium text-slate-500">Total UMKM</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{summary?.users_overview?.by_type?.umkm ?? 0}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-medium text-slate-500">Total Masyarakat</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{summary?.users_overview?.by_type?.masyarakat_umum ?? 0}</div>
          </div>
        </div>
      )}

      <div className="border-t border-slate-200 my-6"></div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">Rincian Transaksi Pengguna</h2>
        <p className="mt-1 text-sm text-slate-500">Pantau dan filter riwayat transaksi keuangan dari setiap pengguna terdaftar.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
        <form onSubmit={handleApplyFilter} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Pilih Pengguna</label>
            <select
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]/20 transition"
            >
              <option value="">Semua Pengguna</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) - {u.user_type ? u.user_type.toUpperCase() : u.role.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Tipe Transaksi</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]/20 transition"
            >
              <option value="">Semua Tipe</option>
              <option value="income">Pemasukan (Income)</option>
              <option value="expense">Pengeluaran (Expense)</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Pencarian Deskripsi</label>
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Cari judul..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]/20 transition"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-[#38ADA9] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2e8b87] shadow-sm transition"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleResetFilter}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Reset
            </button>
          </div>
        </form>

        {transactionSummary && (
          <div className="grid gap-4 sm:grid-cols-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Pemasukan Filtered</div>
              <div className="mt-1 text-lg font-bold text-emerald-600">
                {formatRupiah(transactionSummary.total_income)}
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Pengeluaran Filtered</div>
              <div className="mt-1 text-lg font-bold text-rose-600">
                {formatRupiah(transactionSummary.total_expense)}
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Net Saldo Filtered</div>
              <div className={`mt-1 text-lg font-bold ${transactionSummary.net_balance >= 0 ? 'text-[#38ADA9]' : 'text-rose-700'}`}>
                {formatRupiah(transactionSummary.net_balance)}
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Pengguna</th>
                  <th className="p-4">Judul / Detail</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4 text-center">Tipe</th>
                  <th className="p-4 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {loadingTransactions ? (
                  <tr>
                    <td className="p-8 text-center text-slate-400" colSpan={6}>
                      <div className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#38ADA9] border-t-transparent"></span>
                        Sedang mengambil transaksi...
                      </div>
                    </td>
                  </tr>
                ) : transactions.length > 0 ? (
                  transactions.map((t) => (
                    <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                      <td className="p-4 text-slate-500 whitespace-nowrap">{formatDate(t.date)}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{t.user?.name || 'Unknown User'}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[150px]">{t.user?.email || '-'}</div>
                        <div className="mt-0.5">
                          <span className="inline-flex rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500">
                            {t.user?.user_type || t.user?.role || 'user'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-800">{t.title}</div>
                        {t.note && <div className="text-xs text-slate-400 italic mt-0.5">{t.note}</div>}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {t.category || 'Umum'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ${
                          t.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </td>
                      <td className={`p-4 text-right font-bold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-950'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-8 text-center text-slate-400 italic" colSpan={6}>
                      Tidak ada transaksi ditemukan untuk filter ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {transactionTotalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={transactionPage <= 1 || loadingTransactions}
              onClick={() => setTransactionPage((prev) => Math.max(prev - 1, 1))}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
            >
              Sebelumnya
            </button>
            <span className="text-xs font-medium text-slate-500">
              Halaman {transactionPage} dari {transactionTotalPages}
            </span>
            <button
              type="button"
              disabled={transactionPage >= transactionTotalPages || loadingTransactions}
              onClick={() => setTransactionPage((prev) => Math.min(prev + 1, transactionTotalPages))}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminReportsPage
