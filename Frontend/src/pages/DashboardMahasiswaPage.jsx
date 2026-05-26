import TransactionCard from '../components/TransactionCard'
import BudgetCard from '../components/BudgetCard'

function DashboardMahasiswaPage({ walletSummary, transactions, budgets, walletInfo, userProfile, onQuickAction }) {
  const recentTransactions = transactions.slice(0, 4)
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const mahasiswaPemasukanCategories = [
    'Uang Saku/Kiriman',
    'Beasiswa',
    'Penghasilan Kerja Paruh Waktu',
    'Saldo Awal',
    'Initial',
  ]

  const mahasiswaPengeluaranCategories = [
    'UKT',
    'Buku/Alat Tulis',
    'Makan',
    'Kos',
    'Transportasi',
  ]

  const getWalletBalanceAtStartOfMonth = () => {
    const monthStart = new Date(currentYear, currentMonth, 1)

    // Ambil transaksi synthetic 'Saldo Awal' / 'Initial' yang tanggalnya sebelum awal bulan ini,
    // lalu ambil yang paling terbaru.
    // Catatan: di flow aplikasi, saldo awal untuk bulan berikutnya biasanya dibuat sebagai transaksi
    // kategori 'Initial' atau 'Saldo Awal' dengan tanggal di bulan tersebut.
    const initialTx = transactions
      .filter((t) => {
        const d = new Date(t.date)
        return (
          (t.category === 'Saldo Awal' || t.category === 'Initial') &&
          !Number.isNaN(d.getTime()) &&
          d < monthStart
        )
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    return Number(initialTx?.amount || 0)
  }

  // Kalau tidak ada transaksi 'Saldo Awal'/'Initial' sebelum bulan berjalan,
  // fallback ke walletSummary.current agar tampilan tidak bernilai 0.

  const saldoAwalBulanIni = (() => {
    const v = getWalletBalanceAtStartOfMonth()
    return v > 0 ? v : Number(walletSummary?.current || 0)
  })()


  const totalIncome = saldoAwalBulanIni +
    transactions
      .filter((t) => {
        const d = new Date(t.date)
        return (
          t.type === 'income' &&
          mahasiswaPemasukanCategories.includes(t.category) &&
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear
        )
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0)


  const totalExpense = transactions
    .filter((t) => {
      const d = new Date(t.date)
      return (
        t.type === 'expense' &&
        mahasiswaPengeluaranCategories.includes(t.category) &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      )
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  const totalBudgetLimit = budgets.reduce((sum, budget) => sum + (budget.limit || 0), 0)
  const totalBudgetUsage = budgets.reduce((sum, budget) => sum + (budget.usage || 0), 0)
  const budgetUsageRatio = totalBudgetLimit > 0 ? Math.min(1, totalBudgetUsage / totalBudgetLimit) : totalExpense > 0 ? Math.min(1, totalExpense / Math.max(totalIncome, 1)) : 0

  const savingsRatio = totalIncome > 0 ? Math.min(1, walletSummary.current / totalIncome) : 0
  const cashflow = totalIncome - totalExpense
  const cashflowScore = totalIncome > 0 ? Math.round(Math.max(0, Math.min(100, (cashflow / totalIncome) * 50 + 50))) : 0

  const debtTransactions = transactions.filter((t) => {
    const category = (t.category || '').toLowerCase()
    const note = (t.note || '').toLowerCase()
    return /hutang|utang|debt|loan/.test(category) || /hutang|utang|debt|loan/.test(note)
  })
  const totalDebt = debtTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
  const debtRatio = totalIncome > 0 ? Math.min(1, totalDebt / totalIncome) : 1
  const debtScore = Math.round(Math.max(0, Math.min(100, 100 - debtRatio * 80)))

  const efficiencyScore = totalBudgetLimit > 0 ? Math.round(Math.max(0, Math.min(100, (1 - budgetUsageRatio) * 100))) : 70

  const positiveIncomeTransactions = transactions.filter((t) => {
    const d = new Date(t.date)
    return (
      t.type === 'income' &&
      d.getMonth() === currentMonth &&
      d.getFullYear() === currentYear
    )
  }).length
  const stabilityScore = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        35 + Math.min(30, positiveIncomeTransactions * 10) + (cashflow > 0 ? 20 : -10) + (budgetUsageRatio <= 1 ? 15 : -10)
      )
    )
  )

  const savingsScore = Math.round(Math.max(0, Math.min(100, savingsRatio * 100)))

  const overallScore = Math.round(
    (cashflowScore * 0.22 + savingsScore * 0.18 + efficiencyScore * 0.2 + debtScore * 0.2 + stabilityScore * 0.2)
  )

  const financialCategory =
    overallScore >= 80 ? 'Sangat Sehat' : overallScore >= 60 ? 'Cukup Sehat' : overallScore >= 40 ? 'Kurang Stabil' : 'Buruk'

  const scoreColor =
    overallScore >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
    overallScore >= 60 ? 'text-lime-700 bg-lime-50 border-lime-100' :
    overallScore >= 40 ? 'text-amber-700 bg-amber-50 border-amber-100' :
    'text-red-700 bg-red-50 border-red-100'

  const scoreRingColor =
    overallScore >= 80 ? '#16A34A' :
    overallScore >= 60 ? '#65A30D' :
    overallScore >= 40 ? '#F59E0B' :
    '#DC2626'

  const healthAspects = [
    {
      label: 'Cashflow',
      score: cashflowScore,
      note: cashflow > 0 ? 'Pemasukan lebih besar dari pengeluaran.' : 'Perhatikan arus kas, pengeluaran melebihi pemasukan.',
    },
    {
      label: 'Rasio Tabungan',
      score: savingsScore,
      note: savingsRatio >= 0.25 ? 'Tabungan stabil dibanding pemasukan.' : 'Tabungan perlu ditingkatkan.',
    },
    {
      label: 'Efisiensi Pengeluaran',
      score: efficiencyScore,
      note: budgetUsageRatio <= 0.85 ? 'Pengeluaran masih terkendali.' : 'Pengeluaran mendekati atau melebihi anggaran.',
    },
    {
      label: 'Kondisi Hutang',
      score: debtScore,
      note: totalDebt > 0 ? 'Hutang terdeteksi; pelunasan disarankan.' : 'Tidak ada hutang teridentifikasi.',
    },
    {
      label: 'Stabilitas Arus Kas',
      score: stabilityScore,
      note: positiveIncomeTransactions >= 2 ? 'Arus kas cukup stabil bulan ini.' : 'Perlu pemasukan yang lebih konsisten.',
    },
  ]

  const circleRadius = 60
  const circleCircumference = 2 * Math.PI * circleRadius
  const progressOffset = circleCircumference * (1 - overallScore / 100)

  const totalPoints = 4250
  const carbonSaved = 125

  const quickActions = [
    { label: 'Kos', category: 'Kos', icon: '🏠' },
    { label: 'UKT', category: 'UKT', icon: '📚' },
    { label: 'Makan', category: 'Makan', icon: '🍜' },
    { label: 'Transportasi', category: 'Transportasi', icon: '🚌' },
    { label: 'Kebutuhan Kuliah', category: 'Kebutuhan Kuliah', icon: '✏️' },
    { label: 'Kebutuhan Lainnya', category: 'Kebutuhan Lainnya', icon: '🧩' },
  ]


  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-gradient-to-r from-[#2e8b87] via-[#38ADA9] to-[#4fb7b2] p-6 text-white shadow-xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,0.9fr)] xl:grid-cols-[1.8fr_0.8fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-100/80">Selamat Datang, Mahasiswa</p>
            <h1 className="mt-2 text-3xl font-semibold">{userProfile?.nama || 'Mahasiswa'}</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-100/90">
              Kelola keuangan kuliah, kos, dan pengeluaran sehari-hari dengan mudah.
            </p>
          </div>
          <div className="flex items-center justify-end">
            <div className="rounded-[28px] border border-white/20 bg-white/10 px-5 py-4 text-right text-slate-100/90 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.28em]">Saldo Dompet</p>
              <p className="mt-3 text-2xl font-semibold text-white">Rp {walletSummary.current.toLocaleString('id-ID')}</p>
              <p className="mt-1 text-xs text-slate-100/80">Saldo tersedia sekarang</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[32px] bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Pemasukan</p>
          <h2 className="mt-4 text-4xl font-semibold text-slate-900">Rp {totalIncome.toLocaleString('id-ID')}</h2>
          <p className="mt-3 text-sm text-slate-500">Ringkasan pemasukan bulanan yang membantu menilai cashflow.</p>
        </div>
        <div className="rounded-[32px] bg-[#F6B93B] p-6 text-white shadow-sm border border-[#e6a53f]">
          <p className="text-sm uppercase tracking-[0.24em] text-white/80">Pengeluaran</p>
          <h2 className="mt-4 text-4xl font-semibold">Rp {totalExpense.toLocaleString('id-ID')}</h2>
          <p className="mt-3 text-sm text-white/80">Total biaya sejauh ini</p>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Financial Health Score</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Nilai kesehatan keuangan Anda</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Skor dihitung dari cashflow, rasio tabungan, efisiensi pengeluaran, kondisi hutang, dan stabilitas arus kas.
            </p>
          </div>
          <div className={`rounded-3xl border px-4 py-3 text-center ${scoreColor}`}>
            <p className="text-xs uppercase tracking-[0.24em]">Status</p>
            <p className="mt-2 text-lg font-semibold">{financialCategory}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6 text-center">
            <div className="relative mx-auto h-[140px] w-[140px]">
              <svg className="h-full w-full" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  stroke="#E2E8F0"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  stroke={scoreRingColor}
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={progressOffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                  transform="rotate(-90 70 70)"
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Score</p>
                  <p className="mt-2 text-4xl font-semibold text-slate-900">{overallScore}</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Skor 0–100 berdasarkan kesehatan finansial bulanan.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {healthAspects.map((aspect) => (
              <div key={aspect.label} className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{aspect.label}</p>
                    <p className="mt-2 text-sm text-slate-500">{aspect.note}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900">
                    {aspect.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Aksi Cepat</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Kelola keuangan Anda</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => onQuickAction?.(action.category)}
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

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Budges Reminder</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900"></h2>
          </div>
          <span className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {budgets?.length || 0} kategori
          </span>
        </div>

        {budgets && budgets.length > 0 ? (
          <div className="space-y-4">
            {budgets.map((b) => (
              <BudgetCard key={b.id} category={b.category} usage={b.usage || 0} limit={b.limit || 0}>
                <span className="text-xs font-semibold text-slate-600">
                  {b.usage > b.limit ? '⚠️' : '✅'}
                </span>
              </BudgetCard>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Belum ada budget untuk bulan ini. Tambahkan melalui halaman Budget.</p>
        )}
      </section>

    </div>
  )
}

export default DashboardMahasiswaPage
