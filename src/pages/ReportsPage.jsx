import { useState, useMemo } from 'react'
import StatCard from '../components/StatCard'

function ReportsPage({ transactions }) {
  const [activeTab, setActiveTab] = useState('daily')

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const currentDate = now.getDate()

  // Daily Report
  const dailyTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date)
    return (
      date.getDate() === currentDate &&
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    )
  })

  const dailyIncome = dailyTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const dailyExpense = dailyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const dailyBalance = dailyIncome - dailyExpense

  // Monthly Report
  const monthlyTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyExpense = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyBalance = monthlyIncome - monthlyExpense

  // Annual Report
  const annualTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date)
    return date.getFullYear() === currentYear
  })

  const annualIncome = annualTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const annualExpense = annualTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const annualBalance = annualIncome - annualExpense

  // Expense by category (for annual insights)
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

  // Debt Summary (hardcoded for demo)
  const debtSummary = {
    activeDebts: 2,
    details: [
      { creditor: 'Keluarga', amount: 3000000, dueDate: '2026-06-30', status: 'ongoing' },
      { creditor: 'Teman', amount: 800000, dueDate: '2026-05-15', status: 'ongoing' },
    ],
  }

  const totalDebt = debtSummary.details.reduce((sum, d) => sum + d.amount, 0)

  // Savings Target
  const savingsTarget = {
    current: 21000000,
    target: 32000000,
    deadline: '2026-12-31',
    monthlyRequired: ((32000000 - 21000000) / 8), // Assuming 8 months left
  }

  const savingsProgress = Math.round((savingsTarget.current / savingsTarget.target) * 100)

  const tabs = [
    { id: 'daily', label: 'Harian' },
    { id: 'monthly', label: 'Bulanan' },
    { id: 'annual', label: 'Tahunan' },
    { id: 'debt', label: 'Rekap Hutang' },
    { id: 'savings', label: 'Target Tabungan' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Manajemen Keuangan</p>
        <h1 className="text-3xl font-semibold text-slate-900">Laporan</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Lihat ringkasan keuangan Anda secara detail dalam berbagai periode waktu
        </p>
      </section>

      {/* Tabs */}
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

      {/* Daily Report */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-[#38ADA9]/10 to-transparent p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Laporan Hari Ini</h2>
            <p className="text-sm text-slate-500 mb-4">{now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-2xl font-bold text-[#38ADA9]">Total {dailyTransactions.length} transaksi</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <StatCard
              label="Pemasukan Hari Ini"
              value={`Rp ${dailyIncome.toLocaleString('id-ID')}`}
              description={`${dailyTransactions.filter((t) => t.type === 'income').length} transaksi pemasukan`}
            />
            <StatCard
              label="Pengeluaran Hari Ini"
              value={`Rp ${dailyExpense.toLocaleString('id-ID')}`}
              description={`${dailyTransactions.filter((t) => t.type === 'expense').length} transaksi pengeluaran`}
            />
            <StatCard
              label="Saldo Hari Ini"
              value={`Rp ${dailyBalance.toLocaleString('id-ID')}`}
              description={dailyBalance >= 0 ? 'Surplus ✓' : 'Defisit ✗'}
            />
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

      {/* Monthly Report */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-[#38ADA9]/10 to-transparent p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Laporan Bulanan</h2>
            <p className="text-sm text-slate-500 mb-4">{now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
            <p className="text-2xl font-bold text-[#38ADA9]">Total {monthlyTransactions.length} transaksi</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <StatCard
              label="Total Pemasukan"
              value={`Rp ${monthlyIncome.toLocaleString('id-ID')}`}
              description={`${monthlyTransactions.filter((t) => t.type === 'income').length} transaksi pemasukan`}
            />
            <StatCard
              label="Total Pengeluaran"
              value={`Rp ${monthlyExpense.toLocaleString('id-ID')}`}
              description={`${monthlyTransactions.filter((t) => t.type === 'expense').length} transaksi pengeluaran`}
            />
            <StatCard
              label="Saldo Bulanan"
              value={`Rp ${monthlyBalance.toLocaleString('id-ID')}`}
              description={monthlyBalance >= 0 ? 'Surplus ✓' : 'Defisit ✗'}
            />
          </div>

          {monthlyTransactions.length > 0 && (
            <div className="rounded-[32px] border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Top 5 Pengeluaran Bulan Ini</h3>
              <div className="space-y-3">
                {monthlyTransactions
                  .filter((t) => t.type === 'expense')
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 5)
                  .map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{t.title}</p>
                        <p className="text-sm text-slate-500">{t.category}</p>
                      </div>
                      <p className="font-semibold text-slate-900">Rp {t.amount.toLocaleString('id-ID')}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Annual Report */}
      {activeTab === 'annual' && (
        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-[#38ADA9]/10 to-transparent p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Laporan Tahunan</h2>
            <p className="text-sm text-slate-500 mb-4">Tahun {currentYear}</p>
            <p className="text-2xl font-bold text-[#38ADA9]">Total {annualTransactions.length} transaksi</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <StatCard
              label="Total Pemasukan Tahunan"
              value={`Rp ${annualIncome.toLocaleString('id-ID')}`}
              description={`${annualTransactions.filter((t) => t.type === 'income').length} transaksi pemasukan`}
            />
            <StatCard
              label="Total Pengeluaran Tahunan"
              value={`Rp ${annualExpense.toLocaleString('id-ID')}`}
              description={`${annualTransactions.filter((t) => t.type === 'expense').length} transaksi pengeluaran`}
            />
            <StatCard
              label="Saldo Tahunan"
              value={`Rp ${annualBalance.toLocaleString('id-ID')}`}
              description={annualBalance >= 0 ? 'Surplus ✓' : 'Defisit ✗'}
            />
          </div>

          {categoryExpenses.length > 0 && (
            <div className="rounded-[32px] border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Pengeluaran per Kategori</h3>
              <div className="space-y-4">
                {categoryExpenses.map((item) => {
                  const percentage = Math.round((item.amount / annualExpense) * 100)
                  return (
                    <div key={item.category}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-slate-900">{item.category}</p>
                        <span className="text-sm text-slate-500">{percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 bg-[#38ADA9] rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-sm text-slate-500 mt-1">Rp {item.amount.toLocaleString('id-ID')}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Debt Summary */}
      {activeTab === 'debt' && (
        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-rose-500/10 to-transparent p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Rekap Hutang</h2>
            <p className="text-sm text-slate-500 mb-4">Status hutang aktif Anda</p>
            <p className="text-2xl font-bold text-rose-600">{debtSummary.activeDebts} Hutang Aktif</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <StatCard
              label="Total Hutang"
              value={`Rp ${totalDebt.toLocaleString('id-ID')}`}
              description="Jumlah keseluruhan hutang"
            />
            <StatCard
              label="Rata-rata Hutang"
              value={`Rp ${(totalDebt / debtSummary.activeDebts).toLocaleString('id-ID')}`}
              description="Per kreditur"
            />
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Daftar Hutang</h3>
            <div className="space-y-3">
              {debtSummary.details.map((debt, idx) => {
                const dueDate = new Date(debt.dueDate)
                const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
                const isOverdue = daysUntilDue < 0

                return (
                  <div key={idx} className="p-4 border border-slate-200 rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-slate-900">{debt.creditor}</p>
                        <p className="text-sm text-slate-500">Hutang kepada {debt.creditor}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isOverdue ? 'Jatuh Tempo' : `${daysUntilDue} hari`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-slate-900">Rp {debt.amount.toLocaleString('id-ID')}</p>
                      <p className="text-sm text-slate-500">{dueDate.toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Savings Target */}
      {activeTab === 'savings' && (
        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-emerald-500/10 to-transparent p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Target Tabungan</h2>
            <p className="text-sm text-slate-500 mb-4">Deadline: {new Date(savingsTarget.deadline).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-2xl font-bold text-emerald-600">{savingsProgress}% Tercapai</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <StatCard
              label="Tabungan Saat Ini"
              value={`Rp ${savingsTarget.current.toLocaleString('id-ID')}`}
              description="Saldo tabungan Anda"
            />
            <StatCard
              label="Target Akhir Tahun"
              value={`Rp ${savingsTarget.target.toLocaleString('id-ID')}`}
              description="Target yang ingin dicapai"
            />
            <StatCard
              label="Masih Diperlukan"
              value={`Rp ${(savingsTarget.target - savingsTarget.current).toLocaleString('id-ID')}`}
              description="Untuk mencapai target"
            />
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Progress Target Tabungan</h3>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600">Target {savingsProgress}%</span>
                <span className="text-sm text-slate-500">{savingsProgress}/100</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                <div
                  className="h-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${savingsProgress}%` }}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-emerald-50 rounded-xl">
                <p className="text-sm text-slate-600 mb-1">Target per Bulan</p>
                <p className="text-xl font-bold text-emerald-600">
                  Rp {savingsTarget.monthlyRequired.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-slate-600 mb-1">Sisa Waktu</p>
                <p className="text-xl font-bold text-blue-600">
                  {Math.ceil((new Date(savingsTarget.deadline) - now) / (1000 * 60 * 60 * 24))} hari
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportsPage
