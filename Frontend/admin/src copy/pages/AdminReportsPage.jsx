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

function StatMini({ label, value, color = 'text-[#38ADA9]', icon }) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
          {icon}
        </div>
        <div className="text-sm font-medium text-slate-500">{label}</div>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  )
}

function AdminReportsPage() {
  const backendUrl = 'https://backend-kascerdas-production.up.railway.app'
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
      const res = await fetch(`${backendUrl}/api/admin/monitoring`, {
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
      const res = await fetch(`${backendUrl}/api/admin/users?per_page=1000`, {
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

      const res = await fetch(`${backendUrl}/api/admin/monitoring/transactions?${params.toString()}`, {
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

  // Icons for stat cards
  const iconAdmin = (
    <svg className="w-4.5 h-4.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  )
  const iconUsers = (
    <svg className="w-4.5 h-4.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  )
  const iconUmkm = (
    <svg className="w-4.5 h-4.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
    </svg>
  )
  const iconCommunity = (
    <svg className="w-4.5 h-4.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Laporan Global</h1>
        <p className="mt-1 text-sm text-slate-500">Ringkasan statistik seluruh sistem.</p>
      </div>

      {/* Summary Stats */}
      {loading ? (
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#38ADA9] border-t-transparent"></span>
            Memuat statistik...
          </div>
        </div>
      ) : error ? (
        <div className="rounded-[32px] border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">{error}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatMini label="Total Admin" value={summary?.users_overview?.total_admin ?? 0} icon={iconAdmin} />
          <StatMini label="Total Pengguna Aktif" value={summary?.users_overview?.total_active ?? 0} icon={iconUsers} />
          <StatMini label="Total UMKM" value={summary?.users_overview?.by_type?.umkm ?? 0} icon={iconUmkm} />
          <StatMini label="Total Masyarakat" value={summary?.users_overview?.by_type?.masyarakat_umum ?? 0} icon={iconCommunity} />
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-slate-200"></div>

      {/* Transactions Section */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Rincian Transaksi Pengguna</h2>
        <p className="mt-1 text-sm text-slate-500">Pantau dan filter riwayat transaksi keuangan dari setiap pengguna terdaftar.</p>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        {/* Filter Form */}
        <form onSubmit={handleApplyFilter} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Pilih Pengguna</label>
            <select
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]/20 transition-all duration-200"
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
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]/20 transition-all duration-200"
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
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]/20 transition-all duration-200"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-[#38ADA9] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleResetFilter}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Transaction Summary */}
        {transactionSummary && (
          <div className="grid gap-4 sm:grid-cols-3 bg-slate-50/70 p-5 rounded-[28px] border border-slate-100">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Pemasukan</div>
              <div className="mt-1.5 text-lg font-bold text-emerald-600">
                {formatRupiah(transactionSummary.total_income)}
              </div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Pengeluaran</div>
              <div className="mt-1.5 text-lg font-bold text-rose-600">
                {formatRupiah(transactionSummary.total_expense)}
              </div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Net Saldo</div>
              <div className={`mt-1.5 text-lg font-bold ${transactionSummary.net_balance >= 0 ? 'text-[#38ADA9]' : 'text-rose-700'}`}>
                {formatRupiah(transactionSummary.net_balance)}
              </div>
            </div>
          </div>
        )}

        <div className="w-full rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
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
                    <td className="p-10 text-center text-slate-400" colSpan={6}>
                      <div className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#38ADA9] border-t-transparent"></span>
                        Sedang mengambil transaksi...
                      </div>
                    </td>
                  </tr>
                ) : transactions.length > 0 ? (
                  transactions.map((t) => (
                    <tr key={t.id} className="border-t border-slate-100 hover:bg-[#38ADA9]/5 transition-colors duration-200">
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
                        <span className="inline-flex items-center rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {t.category || 'Umum'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 ${
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
                    <td className="p-10 text-center text-slate-400 italic" colSpan={6}>
                      Tidak ada transaksi ditemukan untuk filter ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {transactionTotalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-5">
            <button
              type="button"
              disabled={transactionPage <= 1 || loadingTransactions}
              onClick={() => setTransactionPage((prev) => Math.max(prev - 1, 1))}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 transition-all duration-300"
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
              className="rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 transition-all duration-300"
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
