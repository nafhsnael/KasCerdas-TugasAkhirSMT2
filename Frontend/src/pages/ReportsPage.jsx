import { useEffect, useMemo, useState } from 'react'
import StatCard from '../components/StatCard'
import { debtAPI, savingAPI } from '../utils/api'

function ReportsPage({ transactions, debts, savings, onAddSavings, onAddDebt }) {
  const [activeTab, setActiveTab] = useState('daily')
  const [isAddingSaving, setIsAddingSaving] = useState(false)
  const [isAddingDebt, setIsAddingDebt] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', amount: '' })
  const [debtForm, setDebtForm] = useState({ creditor: '', amount: '', dueDate: '' })
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    if (!saveMessage) return
    const timer = setTimeout(() => setSaveMessage(''), 3000)
    return () => clearTimeout(timer)
  }, [saveMessage])

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const currentDate = now.getDate()

  const filterByDate = (dateValue, comparator) => {
    const date = new Date(dateValue)
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
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    )
  )

  const annualTransactions = transactions.filter((transaction) =>
    filterByDate(transaction.date, (date) => date.getFullYear() === currentYear)
  )

  const sumAmount = (items) => items.reduce((sum, item) => sum + Number(item.amount || 0), 0)

  const dailyIncome = sumAmount(dailyTransactions.filter((t) => t.type === 'income'))
  const dailyExpense = sumAmount(dailyTransactions.filter((t) => t.type === 'expense'))
  const monthlyIncome = sumAmount(monthlyTransactions.filter((t) => t.type === 'income'))
  const monthlyExpense = sumAmount(monthlyTransactions.filter((t) => t.type === 'expense'))
  const annualIncome = sumAmount(annualTransactions.filter((t) => t.type === 'income'))
  const annualExpense = sumAmount(annualTransactions.filter((t) => t.type === 'expense'))

  const dailyBalance = dailyIncome - dailyExpense
  const monthlyBalance = monthlyIncome - monthlyExpense
  const annualBalance = annualIncome - annualExpense

  const categoryExpenses = useMemo(() => {
    const categories = {}
    annualTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categories[t.category] = (categories[t.category] || 0) + t.amount
      })
    return Object.entries(categories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [annualTransactions])

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
      if (!mapped.has(key)) {
        mapped.set(key, transactionSaving)
      }
    })

    return Array.from(mapped.values())
  }, [savings, transactionSavings])

  const totalDebt = debts.reduce((sum, debt) => sum + Number(debt.amount || 0), 0)
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
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#38ADA9] text-[#38ADA9]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'daily' && (
        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-[#38ADA9]/10 to-transparent p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Laporan Hari Ini</h2>
            <p className="text-sm text-slate-500 mb-4">{now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-2xl font-bold text-[#38ADA9]">Total {dailyTransactions.length} transaksi</p>
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <StatCard label="Pemasukan Hari Ini" value={`Rp ${dailyIncome.toLocaleString('id-ID')}`} description={`${dailyTransactions.filter((t) => t.type === 'income').length} transaksi pemasukan`} />
            <StatCard label="Pengeluaran Hari Ini" value={`Rp ${dailyExpense.toLocaleString('id-ID')}`} description={`${dailyTransactions.filter((t) => t.type === 'expense').length} transaksi pengeluaran`} />
            <StatCard label="Saldo Hari Ini" value={`Rp ${dailyBalance.toLocaleString('id-ID')}`} description={dailyBalance >= 0 ? 'Surplus ✓' : 'Defisit ✗'} />
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
        </div>
      )}

      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-[#38ADA9]/10 to-transparent p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Laporan Bulanan</h2>
            <p className="text-sm text-slate-500 mb-4">{now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
            <p className="text-2xl font-bold text-[#38ADA9]">Total {monthlyTransactions.length} transaksi</p>
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <StatCard label="Total Pemasukan" value={`Rp ${monthlyIncome.toLocaleString('id-ID')}`} description={`${monthlyTransactions.filter((t) => t.type === 'income').length} transaksi pemasukan`} />
            <StatCard label="Total Pengeluaran" value={`Rp ${monthlyExpense.toLocaleString('id-ID')}`} description={`${monthlyTransactions.filter((t) => t.type === 'expense').length} transaksi pengeluaran`} />
            <StatCard label="Saldo Bulanan" value={`Rp ${monthlyBalance.toLocaleString('id-ID')}`} description={monthlyBalance >= 0 ? 'Surplus ?' : 'Defisit ?'} />
          </div>
          {categoryExpenses.length > 0 && (
            <div className="rounded-[32px] border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Kategori Pengeluaran Terbesar</h3>
              <div className="space-y-3">
                {categoryExpenses.slice(0, 5).map((item) => (
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
        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-[#38ADA9]/10 to-transparent p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Laporan Tahunan</h2>
            <p className="text-sm text-slate-500 mb-4">{currentYear}</p>
            <p className="text-2xl font-bold text-[#38ADA9]">Total {annualTransactions.length} transaksi</p>
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <StatCard label="Pemasukan Tahunan" value={`Rp ${annualIncome.toLocaleString('id-ID')}`} description={`${annualTransactions.filter((t) => t.type === 'income').length} transaksi pemasukan`} />
            <StatCard label="Pengeluaran Tahunan" value={`Rp ${annualExpense.toLocaleString('id-ID')}`} description={`${annualTransactions.filter((t) => t.type === 'expense').length} transaksi pengeluaran`} />
            <StatCard label="Saldo Tahunan" value={`Rp ${annualBalance.toLocaleString('id-ID')}`} description={annualBalance >= 0 ? 'Surplus ?' : 'Defisit ?'} />
          </div>
          {categoryExpenses.length > 0 && (
            <div className="rounded-[32px] border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Pengeluaran Tahunan Berdasarkan Kategori</h3>
              <div className="grid gap-3 lg:grid-cols-2">
                {categoryExpenses.map((item) => (
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
        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-[#38ADA9]/10 to-transparent p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Rekap Hutang</h2>
                <p className="text-sm text-slate-500 mb-4">Lacak seluruh hutang yang masih aktif.</p>
                <p className="text-2xl font-bold text-[#38ADA9]">Total Hutang: Rp {totalDebt.toLocaleString('id-ID')}</p>
              </div>
              {!isAddingDebt && (
                <button
                  type="button"
                  onClick={() => setIsAddingDebt(true)}
                  className="rounded-3xl bg-[#38ADA9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2c8a7d] whitespace-nowrap"
                >
                  + Tambah Daftar Hutang Baru
                </button>
              )}
            </div>
          </div>

          {isAddingDebt && (
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Tambah Daftar Hutang Baru</h3>
              <form
                className="grid gap-5 lg:grid-cols-3"
                onSubmit={async (e) => {
                  e.preventDefault()
                  const creditor = String(debtForm.creditor || '').trim()
                  const amount = Number(debtForm.amount)
                  const dueDate = debtForm.dueDate

                  if (!creditor) {
                    alert('Judul hutang wajib diisi')
                    return
                  }
                  if (!amount || Number.isNaN(amount) || amount <= 0) {
                    alert('Jumlah hutang harus lebih dari 0')
                    return
                  }
                  if (!dueDate) {
                    alert('Jatuh tempo wajib diisi')
                    return
                  }

                  try {
                    if (onAddDebt) {
                      await onAddDebt({ creditor, amount, dueDate, note: '' })
                    } else {
                      await debtAPI.create({
                        wallet_id: savings?.[0]?.wallet_id || null,
                        creditor_name: creditor,
                        amount,
                        due_date: dueDate,
                        note: '',
                        status: 'active',
                      })
                    }
                    setIsAddingDebt(false)
                    setDebtForm({ creditor: '', amount: '', dueDate: '' })
                    setSaveMessage('Daftar hutang baru berhasil ditambahkan!')
                  } catch (error) {
                    alert(error?.message || 'Gagal menambahkan daftar hutang baru')
                  }
                }}
              >
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Judul Hutang</label>
                  <input
                    type="text"
                    value={debtForm.creditor}
                    onChange={(e) => setDebtForm((prev) => ({ ...prev, creditor: e.target.value }))}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                    placeholder="Contoh: Hutang ke Bambang"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Jumlah (Rp)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={debtForm.amount}
                    onChange={(e) => setDebtForm((prev) => ({ ...prev, amount: e.target.value }))}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                    placeholder="0"
                    min={1}
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
                <div className="lg:col-span-3 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="rounded-3xl bg-[#38ADA9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2c8a7d]"
                  >
                    Simpan Daftar Hutang
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingDebt(false)
                      setDebtForm({ creditor: '', amount: '', dueDate: '' })
                    }}
                    className="rounded-3xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-300"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="rounded-[32px] border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Daftar Hutang</h3>
            <div className="grid gap-4 lg:grid-cols-2">
              {debts.map((debt) => (
                <div key={debt.id} className="rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-semibold text-slate-900">{debt.creditor}</p>
                      {debt.note && <p className="text-sm text-slate-500 mt-1">{debt.note}</p>}
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 uppercase tracking-[0.12em]">{debt.status || 'active'}</span>
                  </div>
                  <div className="mt-5 space-y-3 text-sm text-slate-600">
                    <p>
                      <span className="block text-slate-400">Jumlah</span>
                      <span className="font-semibold text-slate-900">Rp {Number(debt.amount || 0).toLocaleString('id-ID')}</span>
                    </p>
                    <p>
                      <span className="block text-slate-400">Jatuh tempo</span>
                      <span className="font-semibold text-slate-900">{debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('id-ID') : '-'}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'savings' && (
        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-[#38ADA9]/10 to-transparent p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Target Tabungan</h2>
                <p className="text-sm text-slate-500 mb-4">Pantau pencapaian target tabungan Anda.</p>
                <p className="text-2xl font-bold text-[#38ADA9]">{allSavings.length} target tabungan aktif</p>
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

          {saveMessage && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              {saveMessage}
            </div>
          )}

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
                    if (onAddSavings) {
                      await onAddSavings({
                        name,
                        target,
                        current: 0,
                        deadline: new Date().toISOString().slice(0, 10),
                        note: '',
                        category: 'Tabungan',
                      })
                    } else {
                      await savingAPI.create({
                        ...(savings?.[0]?.wallet_id ? { wallet_id: savings[0].wallet_id } : {}),
                        name,
                        target_amount: target,
                        current_amount: 0,
                        target_date: new Date().toISOString().slice(0, 10),
                        category: 'Tabungan',
                        note: '',
                      })
                      window.location.reload()
                      return
                    }

                    setIsAddingSaving(false)
                    setAddForm({ name: '', amount: '' })
                    setSaveMessage('Target tabungan berhasil ditambahkan!')
                  } catch (error) {
                    alert(error?.message || 'Gagal menambah target tabungan')
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
                    type="number"
                    inputMode="numeric"
                    value={addForm.amount}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, amount: e.target.value }))}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                    placeholder="0"
                    required
                    min={1}
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

          <div className="grid gap-4 lg:grid-cols-2">
            {savingTargets.map((saving) => (
              <div key={saving.id} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportsPage
