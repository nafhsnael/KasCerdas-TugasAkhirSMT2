import { useMemo, useState, useEffect } from 'react'
import StatCard from '../components/StatCard'
import { debtAPI } from '../utils/api'


function ReportsMahasiswaPage({ transactions, debts, savings, onNavigate, onAddSavings, onEditSavings, onDeleteSavings, onAddDebt, onEditDebt, onDeleteDebt, defaultTab = 'daily', setDefaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [isAddingSaving, setIsAddingSaving] = useState(false)
  const [isAddingDebt, setIsAddingDebt] = useState(false)
  const [addForm, setAddForm] = useState({
    name: '',
    amount: '',
  })
  const [debtForm, setDebtForm] = useState({ creditor: '', amount: '', dueDate: '' })
  const [editingSavingId, setEditingSavingId] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    amount: '',
  })

  const [editingDebtId, setEditingDebtId] = useState(null)
  const [editDebtForm, setEditDebtForm] = useState({
    creditor: '',
    amount: '',
    dueDate: '',
    status: 'active'
  })

  const startEditingDebt = (debt) => {
    setEditingDebtId(debt.id)
    setEditDebtForm({
      creditor: debt.creditor || '',
      amount: String(debt.amount || 0),
      dueDate: debt.dueDate ? debt.dueDate.split('T')[0] : '',
      status: debt.status || 'active'
    })
  }

  const cancelEditingDebt = () => {
    setEditingDebtId(null)
    setEditDebtForm({ creditor: '', amount: '', dueDate: '', status: 'active' })
  }

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(Math.max(2026, new Date().getFullYear()))

  const [debtSearchQuery, setDebtSearchQuery] = useState('')
  const [debtFilterMonth, setDebtFilterMonth] = useState('all')
  const [savingSearchQuery, setSavingSearchQuery] = useState('')
  const [savingFilterMonth, setSavingFilterMonth] = useState('all')

  const monthsList = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' }
  ]

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const currentDate = now.getDate()

  const parseDate = (d) => {
    if (!d) return null
    if (d instanceof Date) return new Date(d.getFullYear(), d.getMonth(), d.getDate())
    if (typeof d === 'number') return new Date(d)
    if (typeof d === 'string') {
      const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/)
      if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
      const parsed = new Date(d)
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
    }
    try {
      const parsed = new Date(d)
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
    } catch (e) {
      return null
    }
  }

  const availableYears = useMemo(() => {
    const baseYears = [2026, 2027, 2028, 2029, 2030]
    const years = new Set(baseYears)
    transactions.forEach((t) => {
      const d = parseDate(t.date)
      if (d && d.getFullYear() >= 2026) {
        years.add(d.getFullYear())
      }
    })
    return Array.from(years).sort((a, b) => a - b)
  }, [transactions])

  const filterMonthOptions = useMemo(() => {
    const list = [{ value: 'all', label: 'Semua Bulan' }]
    const years = [2026]
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    years.forEach((yr) => {
      months.forEach((m, idx) => {
        const monthVal = String(idx + 1).padStart(2, '0')
        list.push({
          value: `${yr}-${monthVal}`,
          label: `${m} ${yr}`
        })
      })
    })
    return list
  }, [])

  const filterByDate = (dateValue, comparator) => {
    const date = parseDate(dateValue)
    if (!date) return false
    return comparator(date)
  }

  const dailyTransactions = transactions.filter((transaction) =>
    filterByDate(transaction.date, (date) =>
      date.getDate() === currentDate &&
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    )
  )

  const monthlyTransactions = transactions.filter((transaction) =>
    filterByDate(transaction.date, (date) =>
      (date.getMonth() + 1) === selectedMonth && date.getFullYear() === currentYear
    )
  )

  const annualTransactions = transactions.filter((transaction) =>
    filterByDate(transaction.date, (date) => date.getFullYear() === selectedYear)
  )

  const sumAmount = (items) => items.reduce((sum, item) => sum + item.amount, 0)

  const dailyIncome = sumAmount(dailyTransactions.filter((t) => t.type === 'income'))
  const dailyExpense = sumAmount(dailyTransactions.filter((t) => t.type === 'expense'))
  const monthlyIncome = sumAmount(monthlyTransactions.filter((t) => t.type === 'income'))
  const monthlyExpense = sumAmount(monthlyTransactions.filter((t) => t.type === 'expense'))
  const annualIncome = sumAmount(annualTransactions.filter((t) => t.type === 'income'))
  const annualExpense = sumAmount(annualTransactions.filter((t) => t.type === 'expense'))

  const dailyBalance = dailyIncome - dailyExpense
  const monthlyBalance = monthlyIncome - monthlyExpense
  const annualBalance = annualIncome - annualExpense

  const buildCategoryExpenses = (items) => {
    const categories = {}
    items
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const key = t.category || 'Lainnya'
        categories[key] = (categories[key] || 0) + (Number(t.amount) || 0)
      })
    return Object.entries(categories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }

  const dailyCategoryExpenses = useMemo(() => buildCategoryExpenses(dailyTransactions), [dailyTransactions])
  const monthlyCategoryExpenses = useMemo(() => buildCategoryExpenses(monthlyTransactions), [monthlyTransactions])
  const annualCategoryExpenses = useMemo(() => buildCategoryExpenses(annualTransactions), [annualTransactions])

  const transactionSavings = useMemo(() => {
    const grouped = {}

    transactions
      .filter((transaction) => transaction.category === 'Tabungan' && transaction.type === 'income')
      .forEach((transaction) => {
        const name = String(transaction.title || transaction.category || 'Tabungan').trim()
        const key = name.toLowerCase()

        if (!grouped[key]) {
          grouped[key] = {
            id: `trx-${transaction.id}`,
            name,
            target: 0,
            current: 0,
            deadline: transaction.date || new Date().toISOString(),
            note: transaction.note || 'Transaksi kategori Tabungan',
          }
        }

        grouped[key].target += Number(transaction.amount) || 0
        grouped[key].current += Number(transaction.amount) || 0
      })

    return Object.values(grouped)
  }, [transactions])

  const allSavings = useMemo(() => {
    const mapped = new Map(
      savings.map((saving) => [String(saving.name || '').trim().toLowerCase(), { ...saving }])
    )

    transactionSavings.forEach((transactionSaving) => {
      const key = String(transactionSaving.name || '').trim().toLowerCase()
      const existing = mapped.get(key)
      if (!existing) {
        mapped.set(key, transactionSaving)
      }
    })

    return Array.from(mapped.values())
  }, [savings, transactionSavings])

  const totalDebt = useMemo(() => {
    return debts.reduce((sum, d) => {
      const amount = parseFloat(d.amount) || 0;
      const dibayar = parseFloat(d.paid_amount || d.paidAmount) || 0;
      return sum + Math.max(0, amount - dibayar);
    }, 0);
  }, [debts]);
  const savingTargets = allSavings.map((saving) => {
    const current = Number(saving.current || saving.current_amount || 0)
    const target = Number(saving.target || saving.target_amount || 0)
    return {
      ...saving,
      current,
      target,
      progress: target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0,
      remaining: Math.max(0, target - current),
    }
  })

  const totalAccumulatedSavings = useMemo(() => {
    return savingTargets.reduce((sum, s) => sum + s.current, 0)
  }, [savingTargets])

  const activeDebtsCount = useMemo(() => {
    return debts.filter((d) => {
      const amount = parseFloat(d.amount) || 0
      const dibayar = parseFloat(d.paid_amount || d.paidAmount) || 0
      const sisa = Math.max(0, amount - dibayar)
      return d.status === 'active' || sisa > 0
    }).length
  }, [debts])

  const unreachedSavingsCount = useMemo(() => {
    return savingTargets.filter((s) => s.current < s.target).length
  }, [savingTargets])

  const filteredDebts = useMemo(() => {
    return debts.filter((debt) => {
      const creditor = (debt.creditor || debt.creditor_name || '').toLowerCase()
      const noteStr = (debt.note || '').toLowerCase()
      const matchesSearch = creditor.includes(debtSearchQuery.toLowerCase()) || noteStr.includes(debtSearchQuery.toLowerCase())
      if (debtFilterMonth === 'all') return matchesSearch
      const debtDate = debt.dueDate || debt.due_date
      if (!debtDate) return false
      return debtDate.startsWith(debtFilterMonth)
    })
  }, [debts, debtSearchQuery, debtFilterMonth])

  const filteredSavings = useMemo(() => {
    return savingTargets.filter((saving) => {
      const name = (saving.name || '').toLowerCase()
      const noteStr = (saving.note || '').toLowerCase()
      const matchesSearch = name.includes(savingSearchQuery.toLowerCase()) || noteStr.includes(savingSearchQuery.toLowerCase())
      if (savingFilterMonth === 'all') return matchesSearch
      const savingDate = saving.deadline || saving.target_date || saving.targetDate || saving.date
      if (!savingDate) return false
      return savingDate.startsWith(savingFilterMonth)
    })
  }, [savingTargets, savingSearchQuery, savingFilterMonth])

  const startEditingSaving = (saving) => {
    setEditingSavingId(saving.id)
    setEditForm({
      name: saving.name || '',
      amount: String(saving.target || saving.target_amount || 0),
    })
  }

  const cancelEditingSaving = () => {
    setEditingSavingId(null)
    setEditForm({ name: '', amount: '' })
  }

  const tabs = [
    { id: 'daily', label: 'Harian' },
    { id: 'monthly', label: 'Bulanan' },
    { id: 'annual', label: 'Tahunan' },
    { id: 'debt', label: 'Rekap Hutang' },
    { id: 'savings', label: 'Target Tabungan' },
  ]

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Manajemen Keuangan</p>
        <h1 className="text-3xl font-semibold text-slate-900">Laporan</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Lihat ringkasan keuangan Anda secara detail dalam berbagai periode waktu.
        </p>
      </section>

      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
              ? 'border-[#38ADA9] text-[#38ADA9]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'daily' && (
        <div className="space-y-6 animate-page-fade">
          <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-[#38ADA9]/10 to-transparent p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Laporan Hari Ini</h2>
            <p className="text-sm text-slate-500 mb-4">{now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-2xl font-bold text-[#38ADA9]">Total {dailyTransactions.length} transaksi</p>
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <StatCard label="Pemasukan Hari Ini" value={`Rp ${dailyIncome.toLocaleString('id-ID')}`} description={`${dailyTransactions.filter((t) => t.type === 'income').length} transaksi pemasukan`} />
            <StatCard label="Pengeluaran Hari Ini" value={`Rp ${dailyExpense.toLocaleString('id-ID')}`} description={`${dailyTransactions.filter((t) => t.type === 'expense').length} transaksi pengeluaran`} />
            <StatCard label="Saldo Hari Ini" value={`Rp ${dailyBalance.toLocaleString('id-ID')}`} description={dailyBalance > 0 ? 'Surplus ✓' : dailyBalance < 0 ? 'Defisit ✗' : 'Seimbang -'} />
          </div>
          {dailyTransactions.length > 0 && (
            <div className="rounded-[32px] border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Detail Transaksi Hari Ini</h3>
              <div className="space-y-3">
                {dailyTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{t.title}</p>
                      <p className="text-sm text-slate-500">{t.category}</p>
                    </div>
                    <p className={`font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {t.type === 'income' ? '+' : '-'}Rp {t.amount.toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {dailyCategoryExpenses.length > 0 && (
            <div className="rounded-[32px] border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Kategori Pengeluaran Hari Ini</h3>
              <div className="space-y-3">
                {dailyCategoryExpenses.slice(0, 5).map((item) => (
                  <div key={item.category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-900">{item.category}</span>
                    <span className="text-slate-600">Rp {item.amount.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'monthly' && (
        <div className="space-y-6 animate-page-fade">
          <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-[#38ADA9]/10 to-transparent p-6 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Laporan Bulanan</h2>
                <p className="text-sm text-slate-500 mb-4">{monthsList.find((m) => m.value === selectedMonth)?.label} {currentYear}</p>
                <p className="text-2xl font-bold text-[#38ADA9]">Total {monthlyTransactions.length} transaksi</p>
              </div>
              <div className="relative min-w-[160px] self-start lg:self-center">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-3xl px-6 py-3 pr-12 text-base font-semibold text-gray-700 shadow-md focus:outline-none focus:ring-2 focus:ring-[#38ADA9] hover:border-gray-400 transition cursor-pointer"
                >
                  {monthsList.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <StatCard label="Total Pemasukan" value={`Rp ${monthlyIncome.toLocaleString('id-ID')}`} description={`${monthlyTransactions.filter((t) => t.type === 'income').length} transaksi pemasukan`} />
            <StatCard label="Total Pengeluaran" value={`Rp ${monthlyExpense.toLocaleString('id-ID')}`} description={`${monthlyTransactions.filter((t) => t.type === 'expense').length} transaksi pengeluaran`} />
            <StatCard label="Saldo Bulanan" value={`Rp ${monthlyBalance.toLocaleString('id-ID')}`} description={monthlyBalance > 0 ? 'Surplus ✓' : monthlyBalance < 0 ? 'Defisit ✗' : 'Seimbang -'} />
          </div>
          {monthlyCategoryExpenses.length > 0 && (
            <div className="rounded-[32px] border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Kategori Pengeluaran Terbesar</h3>
              <div className="space-y-3">
                {monthlyCategoryExpenses.slice(0, 5).map((item) => (
                  <div key={item.category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-900">{item.category}</span>
                    <span className="text-slate-600">Rp {item.amount.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'annual' && (
        <div className="space-y-6 animate-page-fade">
          <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-[#38ADA9]/10 to-transparent p-6 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Laporan Tahunan</h2>
                <p className="text-sm text-slate-500 mb-4">{selectedYear}</p>
                <p className="text-2xl font-bold text-[#38ADA9]">Total {annualTransactions.length} transaksi</p>
              </div>
              <div className="relative min-w-[160px] self-start lg:self-center">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-3xl px-6 py-3 pr-12 text-base font-semibold text-gray-700 shadow-md focus:outline-none focus:ring-2 focus:ring-[#38ADA9] hover:border-gray-400 transition cursor-pointer"
                >
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <StatCard label="Pemasukan Tahunan" value={`Rp ${annualIncome.toLocaleString('id-ID')}`} description={`${annualTransactions.filter((t) => t.type === 'income').length} transaksi pemasukan`} />
            <StatCard label="Pengeluaran Tahunan" value={`Rp ${annualExpense.toLocaleString('id-ID')}`} description={`${annualTransactions.filter((t) => t.type === 'expense').length} transaksi pengeluaran`} />
            <StatCard label="Saldo Tahunan" value={`Rp ${annualBalance.toLocaleString('id-ID')}`} description={annualBalance > 0 ? 'Surplus ✓' : annualBalance < 0 ? 'Defisit ✗' : 'Seimbang -'} />
          </div>
          {annualCategoryExpenses.length > 0 && (
            <div className="rounded-[32px] border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Pengeluaran Tahunan Berdasarkan Kategori</h3>
              <div className="grid gap-3 lg:grid-cols-2">
                {annualCategoryExpenses.map((item) => (
                  <div key={item.category} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-medium text-slate-900">{item.category}</p>
                    <p className="mt-2 text-slate-600">Rp {item.amount.toLocaleString('id-ID')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'debt' && (
        <div className="space-y-6 animate-page-fade">
          <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-[#38ADA9]/10 to-transparent p-6 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Rekap Hutang</h2>
                <p className="text-sm text-slate-500 mb-4">Lacak seluruh hutang yang masih aktif.</p>
                <p className="text-2xl font-bold text-[#38ADA9]">Total Hutang: Rp {Math.round(totalDebt).toLocaleString('id-ID')}</p>
                <p className="text-sm text-slate-500 mt-1">{activeDebtsCount} hutang masih Active</p>
              </div>
              {!isAddingDebt && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingDebt(true);
                    setDebtForm({ creditor: '', amount: '', dueDate: '' });
                  }}
                  className="rounded-3xl bg-[#38ADA9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2c8a7d] whitespace-nowrap"
                >
                  + Tambah Daftar Hutang Baru
                </button>
              )}
            </div>
          </div>

          {isAddingDebt && (
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Tambah Daftar Hutang Baru</h3>
              <form className="grid gap-5 lg:grid-cols-3" onSubmit={async (e) => {
                e.preventDefault();
                const creditor = String(debtForm.creditor || '').trim();
                const amount = Number(debtForm.amount);
                const dueDate = debtForm.dueDate;
                if (!creditor) {
                  alert('Judul hutang wajib diisi');
                  return;
                }
                if (!amount || Number.isNaN(amount) || amount <= 0) {
                  alert('Jumlah hutang harus lebih dari 0');
                  return;
                }
                if (!dueDate) {
                  alert('Jatuh tempo wajib diisi');
                  return;
                }
                try {
                  // Directly create a new debt entry via the API.
                  const response = await debtAPI.create({
                    wallet_id: savings?.[0]?.wallet_id || null,
                    creditor_name: creditor,
                    amount,
                    due_date: dueDate,
                    note: '',
                    status: 'active',
                  });
                  if (onAddDebt) {
                    onAddDebt(response?.data || response);
                  }
                  // Close the add‑debt form and reset fields.
                  setIsAddingDebt(false);
                  setDebtForm({ creditor: '', amount: '', dueDate: '' });
                } catch (error) {
                  // Show an alert if the request fails.
                  alert(error?.message || 'Gagal menambahkan daftar hutang baru');
                }
              }}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Judul Hutang</label>
                  <input
                    type="text"
                    value={debtForm.creditor}
                    onChange={(e) => setDebtForm((prev) => ({ ...prev, creditor: e.target.value }))}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                    placeholder="Contoh: Hutang ke Rendi"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Jumlah (Rp)</label>
                  <input
                    type="text"
                    value={debtForm.amount ? Number(String(debtForm.amount).replace(/\D/g, '')).toLocaleString('id-ID') : ''}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, '');
                      setDebtForm((prev) => ({ ...prev, amount: rawValue }));
                    }}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                    placeholder="Contoh: 1.000.000"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Jatuh Tempo</label>
                  <input
                    type="date"
                    value={debtForm.dueDate}
                    onChange={(e) => setDebtForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                    required
                  />
                </div>
                <div className="lg:col-span-3 flex gap-3">
                  <button type="submit" className="flex-1 rounded-3xl bg-[#38ADA9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2c8a7d]">
                    Simpan Daftar Hutang
                  </button>
                  <button type="button" onClick={() => { setIsAddingDebt(false); setDebtForm({ creditor: '', amount: '', dueDate: '' }); }}
                    className="flex-1 rounded-3xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-300">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div>
            <h3 className="font-bold text-slate-900 text-lg mb-3">Daftar Hutang</h3>

            <div className="flex items-center gap-3 mb-5 w-full">
              {/* Bar Pencarian */}
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input 
                  type="text" 
                  value={debtSearchQuery}
                  onChange={(e) => setDebtSearchQuery(e.target.value)}
                  placeholder="Cari Daftar Hutang..." 
                  className="w-full h-12 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#38ADA9]/20 focus:border-[#38ADA9] transition-all duration-200"
                />
              </div>

              {/* Dropdown Filter Bulan */}
              <div className="relative w-48 min-w-[180px]">
                <select 
                  value={debtFilterMonth}
                  onChange={(e) => setDebtFilterMonth(e.target.value)}
                  className="w-full h-12 appearance-none bg-white border border-slate-200 rounded-xl px-4 pr-10 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#38ADA9]/20 focus:border-[#38ADA9] cursor-pointer transition-all duration-200"
                >
                  {filterMonthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            {filteredDebts.length === 0 ? (
              <p className="text-sm text-slate-500">Tidak ada daftar hutang yang ditemukan.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredDebts.map((debt) => {
                  const amount = parseFloat(debt.amount) || 0;
                  const dibayar = parseFloat(debt.paid_amount || debt.paidAmount) || 0;
                  const sisa = Math.max(0, amount - dibayar);
                  const progress = amount > 0 ? Math.min(100, Math.round((dibayar / amount) * 100)) : 0;

                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const dueDateObj = new Date(debt.dueDate);
                  dueDateObj.setHours(0, 0, 0, 0);
                  const isOverdue = dueDateObj < today && sisa > 0;

                  return (
                    <div key={debt.id} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md">
                      {editingDebtId === debt.id ? (
                        <form
                          className="space-y-4"
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const creditor = String(editDebtForm.creditor || '').trim();
                            const amount = parseFloat(editDebtForm.amount);
                            const dueDate = editDebtForm.dueDate;
                            const status = editDebtForm.status;

                            if (!creditor) {
                              alert('Kreditur wajib diisi');
                              return;
                            }
                            if (!amount || Number.isNaN(amount) || amount <= 0) {
                              alert('Jumlah harus lebih dari 0');
                              return;
                            }
                            if (!dueDate) {
                              alert('Tanggal wajib diisi');
                              return;
                            }

                            try {
                              await onEditDebt(debt.id, { creditor, amount, dueDate, status });
                              cancelEditingDebt();
                            } catch (err) {
                              return;
                            }
                          }}
                        >
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-500">Judul Hutang</label>
                            <input
                              type="text"
                              value={editDebtForm.creditor}
                              onChange={(e) => setEditDebtForm((prev) => ({ ...prev, creditor: e.target.value }))}
                              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                              required
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-500">Jumlah Hutang (Rp)</label>
                            <input
                              type="number"
                              value={editDebtForm.amount}
                              onChange={(e) => setEditDebtForm((prev) => ({ ...prev, amount: e.target.value }))}
                              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                              required
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-500">Jatuh Tempo</label>
                            <input
                              type="date"
                              value={editDebtForm.dueDate}
                              onChange={(e) => setEditDebtForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                              required
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-500">Status Pembayaran</label>
                            <select
                              value={editDebtForm.status}
                              onChange={(e) => setEditDebtForm((prev) => ({ ...prev, status: e.target.value }))}
                              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                            >
                              <option value="active">Active</option>
                              <option value="paid">Paid</option>
                            </select>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              type="submit"
                              className="rounded-3xl bg-[#38ADA9] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#2c8a7d]"
                            >
                              Simpan
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditingDebt}
                              className="rounded-3xl bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-300"
                            >
                              Batal
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className="text-xl font-semibold text-slate-900">{debt.creditor}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              {sisa === 0 ? (
                                <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium">Paid</span>
                              ) : (
                                <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-medium">Active</span>
                              )}
                              <span className="text-sm font-semibold text-slate-700">{progress}% terbayar</span>
                            </div>
                          </div>
                          <div className="mt-4 rounded-full bg-slate-100 h-3 overflow-hidden">
                            <div className="h-3 rounded-full bg-[#38ADA9] transition-all duration-500" style={{ width: `${progress}%` }} />
                          </div>
                          <div className="mt-4 text-sm text-slate-600 space-y-2">
                            <p>Dibayar: Rp {Math.round(dibayar).toLocaleString('id-ID')}</p>
                            <p>Jumlah hutang: Rp {Math.round(amount).toLocaleString('id-ID')}</p>
                            <p>Sisa: Rp {Math.round(sisa).toLocaleString('id-ID')}</p>
                            <p className="text-xs text-slate-400 pt-1 flex items-center gap-2 flex-wrap">
                              <span>Jatuh tempo: {new Date(debt.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                              {isOverdue && (
                                <span className="bg-red-200 text-red-900 px-2 py-0.5 rounded text-xs font-semibold">Overdue</span>
                              )}
                            </p>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => startEditingDebt(debt)}
                              className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!window.confirm('Yakin ingin menghapus hutang ini?')) return;
                                try {
                                  await onDeleteDebt(debt.id);
                                } catch (err) {
                                  return;
                                }
                              }}
                              className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                            >
                              Hapus
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'savings' && (
        <div className="space-y-6 animate-page-fade">
          <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-[#38ADA9]/10 to-transparent p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Target Tabungan</h2>
                <p className="text-sm text-slate-500 mb-4">Pantau pencapaian target tabungan Anda.</p>
                <p className="text-2xl font-bold text-[#38ADA9]">Total Tabungan: Rp {totalAccumulatedSavings.toLocaleString('id-ID')}</p>
                <p className="text-sm text-slate-500 mt-1">{unreachedSavingsCount} tabungan belum tercapai 100%</p>
              </div>
              {!isAddingSaving && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingSaving(true)
                    setAddForm({ name: '', amount: '' })
                  }}
                  className="rounded-3xl bg-[#38ADA9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2c8a7d] whitespace-nowrap"
                >
                  + Tambah Tabungan Baru
                </button>
              )}
            </div>
          </div>

          {isAddingSaving && (
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Tambah Target Tabungan</h3>

              <form
                className="grid gap-5 lg:grid-cols-2"
                onSubmit={async (e) => {
                  e.preventDefault()

                  const name = String(addForm.name || '').trim()
                  const target = parseFloat(addForm.amount)

                  if (!name) {
                    alert('Nama tabungan wajib diisi')
                    return
                  }
                  if (!target || Number.isNaN(target) || target <= 0) {
                    alert('Jumlah (Rp) harus lebih dari 0')
                    return
                  }

                  try {
                    await onAddSavings({
                      name,
                      target,
                      current: 0,
                      deadline: new Date().toISOString(),
                      category: 'Tabungan',
                      note: '',
                    })
                    setIsAddingSaving(false)
                    setAddForm({ name: '', amount: '' })
                  } catch (err) {
                    alert(err?.message || 'Gagal menambah target tabungan')
                    return
                  }
                }}
              >
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Nama Tabungan</label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                    placeholder="Contoh: Tabungan Pendidikan"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Jumlah (Rp)</label>
                  <input
                    type="text"
                    value={addForm.amount ? Number(String(addForm.amount).replace(/\D/g, '')).toLocaleString('id-ID') : ''}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, '');
                      setAddForm((prev) => ({ ...prev, amount: rawValue }));
                    }}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                    placeholder="Contoh: 1.000.000"
                    required
                  />
                </div>

                <div className="lg:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 rounded-3xl bg-[#38ADA9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2c8a7d]"
                  >
                    Simpan Target
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingSaving(false)}
                    className="flex-1 rounded-3xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-300"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <h3 className="font-bold text-slate-900 text-lg mb-3">Daftar Target Tabungan</h3>

          <div className="flex items-center gap-3 mb-5 w-full">
            {/* Bar Pencarian */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input 
                type="text" 
                value={savingSearchQuery}
                onChange={(e) => setSavingSearchQuery(e.target.value)}
                placeholder="Cari Target Tabungan..." 
                className="w-full h-12 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#38ADA9]/20 focus:border-[#38ADA9] transition-all duration-200"
              />
            </div>

            {/* Dropdown Filter Bulan */}
            <div className="relative w-48 min-w-[180px]">
              <select 
                value={savingFilterMonth}
                onChange={(e) => setSavingFilterMonth(e.target.value)}
                className="w-full h-12 appearance-none bg-white border border-slate-200 rounded-xl px-4 pr-10 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#38ADA9]/20 focus:border-[#38ADA9] cursor-pointer transition-all duration-200"
              >
                {filterMonthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {filteredSavings.length === 0 ? (
              <div className="lg:col-span-2 text-sm text-slate-500">Tidak ada target tabungan yang ditemukan.</div>
            ) : filteredSavings.map((saving) => (
              <div key={saving.id} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                {editingSavingId === saving.id ? (
                  <form
                    className="space-y-4"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      const name = String(editForm.name || '').trim()
                      const target = parseFloat(editForm.amount)

                      if (!name) {
                        alert('Nama tabungan wajib diisi')
                        return
                      }
                      if (!target || Number.isNaN(target) || target <= 0) {
                        alert('Jumlah target harus lebih dari 0')
                        return
                      }

                      try {
                        await onEditSavings(saving.id, { name, target })
                        cancelEditingSaving()
                      } catch (err) {
                        return
                      }
                    }}
                  >
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Nama Tabungan</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Target (Rp)</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={editForm.amount}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                        required
                        min={1}
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        className="rounded-3xl bg-[#38ADA9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2c8a7d]"
                      >
                        Simpan Perubahan
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditingSaving}
                        className="rounded-3xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-300"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm('Yakin ingin menghapus target tabungan ini?')) return
                          try {
                            await onDeleteSavings(saving.id)
                            cancelEditingSaving()
                          } catch (err) {
                            return
                          }
                        }}
                        className="rounded-3xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                      >
                        Hapus
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">{saving.name}</h3>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{saving.progress}% tercapai</span>
                    </div>
                    <div className="mt-4 rounded-full bg-slate-100 h-3 overflow-hidden">
                      <div className="h-3 rounded-full bg-[#38ADA9]" style={{ width: `${Math.min(saving.progress, 100)}%` }} />
                    </div>
                    <div className="mt-4 text-sm text-slate-600 space-y-2">
                      <p>Tabungan saat ini: Rp {saving.current.toLocaleString('id-ID')}</p>
                      <p>Target: Rp {saving.target.toLocaleString('id-ID')}</p>
                      <p>Sisa: Rp {(saving.target - saving.current).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEditingSaving(saving)}
                        className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm('Yakin ingin menghapus target tabungan ini?')) return
                          try {
                            await onDeleteSavings(saving.id)
                          } catch (err) {
                            return
                          }
                        }}
                        className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        Hapus
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportsMahasiswaPage
