import StatCard from '../components/StatCard'
import BudgetCard from '../components/BudgetCard'

function DashboardMasyarakatPage({ walletSummary, transactions, budgets, walletInfo, userProfile, onQuickAction }) {
  const recentTransactions = transactions.slice(0, 4)
  const totalPoints = 4250
  const carbonSaved = 125

  const quickActions = [
    { label: 'Makan', icon: '🍜' },
    { label: 'Transport', icon: '🚌' },
    { label: 'Hiburan', icon: '🎉' },
    { label: 'Belanja', icon: '🛍️' },
    { label: 'Tagihan', icon: '📄' },
  ]

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const monthTransactions = (transactions || []).filter((t) => {
    const d = new Date(t.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  // Debug singkat: pastikan budgets tersedia & tidak undefined
  // eslint-disable-next-line no-console
  console.log('[DashboardMasyarakatPage] budgets:', budgets)


  // saldo pemasukan/pengeluaran = dihitung per bulan
  const saldoPemasukanBulanIni = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

  const saldoPengeluaranBulanIni = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-gradient-to-r from-[#2e8b87] via-[#38ADA9] to-[#4fb7b2] p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-100/80">Selamat Datang</p>
            <h1 className="mt-2 text-3xl font-semibold">{userProfile?.nama || 'Pengguna'}</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-100/90">
              Pantau saldo eco-wallet, pencapaian keberlanjutan, dan transaksi terbaru dalam satu tampilan bersih.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/20 bg-white/10 p-4 text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-100/80">Saldo E-Wallet</p>
            <p className="mt-2 text-3xl font-semibold">
              Rp {walletSummary.current.toLocaleString('id-ID')}
            </p>
            <p className="text-sm text-slate-100/80">Saldo e-wallet saat ini</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[32px] bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Saldo Pemasukan</p>
              <h2 className="mt-4 text-4xl font-semibold text-slate-900">
                Rp {saldoPemasukanBulanIni.toLocaleString('id-ID')}
              </h2>
<p className="mt-3 text-sm text-slate-500">Total pemasukan per bulan</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-slate-900">
              <span className="text-2xl">💚</span>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Saldo Pengeluaran</p>
          <h2 className="mt-4 text-4xl font-semibold text-slate-900">
            Rp {saldoPengeluaranBulanIni.toLocaleString('id-ID')}
          </h2>
<p className="mt-3 text-sm text-slate-500">Total pengeluaran per bulan</p>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Poin Eco</p>
          <h2 className="mt-4 text-4xl font-semibold text-slate-900">
            {totalPoints.toLocaleString('id-ID')} Poin
          </h2>
          <div className="mt-4 rounded-full bg-slate-100 h-3 overflow-hidden">
            <div className="h-3 rounded-full bg-[#38ADA9]" style={{ width: '85%' }} />
          </div>
          <p className="mt-3 text-sm text-slate-500">Progress Voucher Emas 4.250 / 5.000</p>
        </div>
      </section>

      {/* Budget Reminder (persis seperti Dashboard Mahasiswa) */}
      <section className="mt-1">
        {(() => {
          const totalBudget = (budgets || []).reduce((sum, b) => sum + (Number(b?.limit) || 0), 0)
          const totalBudgetUsage = (budgets || []).reduce((sum, b) => sum + (Number(b?.usage) || 0), 0)
          const budgetUsageRatioLocal = totalBudget > 0 ? totalBudgetUsage / totalBudget : 0

          const budgetByCategory = (budgets || []).reduce((acc, b) => {
            const category = b?.category || 'Kategori'
            const limit = Number(b?.limit) || 0
            if (!acc[category]) acc[category] = { limit: 0, usage: 0 }
            acc[category].limit += limit
            acc[category].usage += Number(b?.usage) || 0
            return acc
          }, {})

          const topBudgetCategory = Object.entries(budgetByCategory)
            .map(([category, v]) => ({
              category,
              ratio: v.limit > 0 ? v.usage / v.limit : 0,
            }))
            .sort((a, b) => b.ratio - a.ratio)[0]

          const status =
            totalBudget <= 0
              ? { key: 'none', label: 'Belum ada budget', desc: 'Tambahkan budget agar ada pengingat otomatis.', color: 'slate' }
              : budgetUsageRatioLocal <= 0.8
                ? { key: 'safe', label: 'Pengeluaran masih aman', desc: 'Pengeluaran bulan ini masih terkendali.', color: 'emerald' }
                : budgetUsageRatioLocal <= 1
                  ? {
                    key: 'near',
                    label: 'Pengeluaran mendekati batas',
                    desc: `Kategori '${topBudgetCategory?.category || '—'}' mulai mendekati batas budget.`,
                    color: 'amber',
                  }
                  : {
                    key: 'exceed',
                    label: 'Budget terlampaui',
                    desc: `Pengeluaran melebihi budget pada kategori '${topBudgetCategory?.category || '—'}'.`,
                    color: 'rose',
                  }

          const badgeClass =
            status.color === 'emerald'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : status.color === 'amber'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : status.color === 'rose'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200'

          const icon =
            status.key === 'safe' ? '✅' : status.key === 'near' ? '⚠️' : status.key === 'exceed' ? '⛔' : 'ℹ️'

          const badgeText = totalBudget > 0 ? `${Math.round(budgetUsageRatioLocal * 100)}%` : '-'

          return (
            <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-[#f8fafc] to-[#eef2ff] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-slate-200 text-[16px]">
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] uppercase tracking-[0.24em] text-slate-500">Budget Reminder</p>
                    <h3 className="mt-1 text-[15px] font-semibold text-slate-900 leading-tight">{status.label}</h3>
                    <p className="mt-1 text-[11px] text-slate-600 leading-tight line-clamp-2 w-full">{status.desc}</p>
                  </div>
                </div>

                <div className={`shrink-0 rounded-2xl border px-3 py-1 text-[12px] font-semibold ${badgeClass}`}>
                  {badgeText}
                </div>
              </div>
            </div>
          )
        })()}

        {budgets && budgets.length > 0 ? (
          <div className="mt-4 space-y-4">
            {budgets.map((b) => (
              <BudgetCard key={b.id} category={b.category} usage={b.usage || 0} limit={b.limit || 0}>
                <span className="text-xs font-semibold text-slate-600">{b.usage > b.limit ? '⚠️' : '✅'}</span>
              </BudgetCard>
            ))}
          </div>
        ) : null}
      </section>


      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Aksi Cepat</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Mulai dengan cepat</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => onQuickAction?.(action.label)}
              className="group flex items-center gap-3 rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-[#38ADA9] hover:bg-[#f5fffd]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e6f6f3] text-2xl text-[#2e8b87]">
                {action.icon}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{action.label}</p>
                <p className="text-sm text-slate-500">Lihat detail</p>
              </div>
            </button>
          ))}
        </div>
      </section>


    </div>
  )
}

export default DashboardMasyarakatPage


