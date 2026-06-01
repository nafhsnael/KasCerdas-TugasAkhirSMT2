function DashboardMasyarakatPage({ walletSummary, transactions, budgets, walletInfo, userProfile, onQuickAction }) {
  // Kategori ini disamakan dengan kategori di TransactionsMasyarakatPage.jsx
  const quickActions = [
    { label: 'Penghasilan Kerja', category: 'Penghasilan Kerja', icon: '💼' },
    { label: 'Uang Saku', category: 'Uang Saku', icon: '🪙' },
    { label: 'Tabungan', category: 'Tabungan', icon: '🏦' },
    { label: 'Makan', category: 'Makan', icon: '🍜' },
    { label: 'Hutang', category: 'Hutang', icon: '💳' },
    { label: 'Transport', category: 'Transport', icon: '🚌' },
    { label: 'Belanja', category: 'Belanja', icon: '🛍️' },
    { label: 'Tagihan', category: 'Tagihan', icon: '📄' },
    { label: 'Kebutuhan Lainnya', category: 'Kebutuhan Lainnya', icon: '🧩' },
  ]

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const monthTransactions = (transactions || []).filter((t) => {
    const d = new Date(t.date)
    return (
      !Number.isNaN(d.getTime()) &&
      d.getMonth() === currentMonth &&
      d.getFullYear() === currentYear
    )
  })

  const isSaldoAwalTransaction = (transaction) => {
    const cat = String(transaction.category || '').toLowerCase()
    const businessCat = String(transaction.businessCategory || '').toLowerCase()
    return (
      cat === 'saldo awal' ||
      cat === 'initial' ||
      businessCat === 'saldo awal' ||
      businessCat === 'initial'
    )
  }

  const saldoPemasukan = walletSummary?.income !== undefined && walletSummary?.income !== null
    ? Number(walletSummary.income)
    : monthTransactions
      .filter((t) => t.type === 'income' && !isSaldoAwalTransaction(t))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

  const saldoPemasukanBulanIniTermasukSaldoAwal = saldoPemasukan




  const saldoPengeluaranBulanIni = monthTransactions

    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

  const getBudgetUsage = (budget) => {
    const category = budget?.category || budget?.name || ''
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const actualUsage = (transactions || [])
      .filter((t) => {
        const date = new Date(t.date)
        if (Number.isNaN(date.getTime())) return false

        const budgetParts = String(category).split(' - ')
        const budgetMainCat = String(budgetParts[0] || '').toLowerCase().trim()
        const budgetSubDetail = budgetParts[1] ? String(budgetParts[1]).toLowerCase().trim() : ''

        const tType = String(t.type || '').toLowerCase().trim()
        const tCategory = String(t.kategori || t.category || '').toLowerCase().trim()
        const tTitle = String(t.judul || t.title || '').toLowerCase().trim()

        const isKebutuhanLainnya = budgetMainCat === 'kebutuhan lainnya'

        if (isKebutuhanLainnya) {
          return (
            tType === 'expense' &&
            tCategory === 'kebutuhan lainnya' &&
            tTitle === budgetSubDetail &&
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
          )
        }

        return (
          tType === 'expense' &&
          tCategory === String(category).toLowerCase().trim() &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        )
      })
      .reduce((sum, t) => sum + Number(t.jumlah_uang || t.amount || 0), 0)

    const savedUsage = Number(budget?.usage) || 0
    return Math.max(actualUsage, savedUsage)
  }

  const processedBudgets = (budgets || []).map((b) => {
    const limit = Number(b?.limit) || 0
    const usage = getBudgetUsage(b)
    const ratio = limit > 0 ? usage / limit : 0
    const category = b?.category || b?.name || 'Kategori'
    return { ...b, category, limit, usage, ratio }
  })

  const sortedBudgets = [...processedBudgets].sort((a, b) => b.ratio - a.ratio)
  const topBudget = sortedBudgets[0]
  const topRatioPercent = topBudget ? Math.round(topBudget.ratio * 100) : 0
  const isWarning = topBudget && topBudget.ratio >= 0.9

  const budgetReminderStatus = (() => {
    let label = 'Pengeluaran masih aman'
    let desc = 'Pengeluaran bulan ini masih terkendali.'
    let badge = `${topRatioPercent}%`

    if (!budgets || budgets.length === 0) {
      return {
        key: 'none',
        label: 'Belum ada budget',
        desc: 'Tambahkan budget agar ada pengingat otomatis.',
        badge: '-',
        iconBgClass: 'bg-slate-100 text-slate-500',
        badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
      }
    }

    if (isWarning) {
      return {
        key: 'warning',
        label: 'Peringatan: Anggaran Hampir Habis!',
        desc: `Pengeluaran untuk ${topBudget.category} telah mencapai ${topRatioPercent}%.`,
        badge: `${topRatioPercent}%`,
        iconBgClass: 'bg-amber-50 text-amber-500',
        badgeClass: topRatioPercent >= 100
          ? 'bg-red-50 text-red-600 border border-red-200'
          : 'bg-amber-50 text-amber-600 border border-amber-200',
      }
    }

    return {
      key: 'safe',
      label: label,
      desc: desc,
      badge: badge,
      iconBgClass: 'bg-green-50 text-green-500',
      badgeClass: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    }
  })()

  // businessIncome untuk perhitungan skor/health tidak boleh menganggap saldo awal sebagai pemasukan bisnis.
  // Karena feedback: saat akun baru (hanya saldo awal), skor dan metrik seharusnya tidak terlihat seolah-olah ada pemasukan.
  const businessIncome = saldoPemasukan

  const businessExpense = saldoPengeluaranBulanIni

  // Pakai saldo asli dari wallet backend dulu, baru fallback ke walletSummary.
  // Ini supaya Saldo E-Wallet selalu sesuai saldo yang diinput/tersimpan dan berubah setelah transaksi.
  const eWalletBalance = Number(walletInfo?.balance ?? walletSummary?.current ?? 0)
  const currentBalance = eWalletBalance

  const totalBudgetLimit = (budgets || []).reduce((sum, budget) => sum + (Number(budget?.limit) || 0), 0)
  const totalBudgetUsage = (budgets || []).reduce((sum, budget) => sum + getBudgetUsage(budget), 0)
  const budgetUsageRatio = totalBudgetLimit > 0
    ? Math.min(1.5, totalBudgetUsage / totalBudgetLimit)
    : businessExpense > 0
      ? Math.min(1.5, businessExpense / Math.max(businessIncome, 1))
      : 0

  const cashflow = businessIncome - businessExpense

  // Kondisi akun baru: tidak ada pemasukan/pengeluaran selain saldo awal.
  const hasNonInitialIncome = monthTransactions.some((t) => {
    if (t.type !== 'income') return false
    const cat = String(t.category || '').toLowerCase()
    const businessCat = String(t.businessCategory || '').toLowerCase()
    return !(cat === 'saldo awal' || cat === 'initial' || businessCat === 'saldo awal' || businessCat === 'initial')
  })


  const hasAnyExpense = businessExpense > 0
  const isAkunBaru = !hasNonInitialIncome && !hasAnyExpense

  const cashflowScore = isAkunBaru
    ? 100
    : businessIncome > 0
      ? Math.round(Math.max(0, Math.min(100, (cashflow / businessIncome) * 50 + 50)))
      : currentBalance > 0
        ? 60
        : 0

  const savingsRatio = businessIncome > 0
    ? Math.min(1, currentBalance / businessIncome)
    : currentBalance > 0
      ? 0.5
      : 0

  const savingsScore = isAkunBaru
    ? 100
    : Math.round(Math.max(0, Math.min(100, savingsRatio * 100)))

  const efficiencyScore = isAkunBaru
    ? 100
    : totalBudgetLimit > 0
      ? Math.round(Math.max(0, Math.min(100, (1 - Math.min(1, budgetUsageRatio)) * 100)))
      : businessExpense > 0 && businessIncome > 0
        ? Math.round(Math.max(0, Math.min(100, (1 - Math.min(1, businessExpense / businessIncome)) * 100)))
        : 70


  const debtTransactions = monthTransactions.filter((transaction) => {
    const term = `${transaction?.category || ''} ${transaction?.note || ''} ${transaction?.title || ''}`.toLowerCase()
    return /hutang|utang|debt|loan/.test(term)
  })
  const totalDebt = debtTransactions.reduce((sum, transaction) => sum + (Number(transaction?.amount) || 0), 0)
  const debtRatio = businessIncome > 0 ? Math.min(1, totalDebt / businessIncome) : totalDebt > 0 ? 1 : 0
  const debtScore = Math.round(Math.max(0, Math.min(100, 100 - debtRatio * 80)))

  const positiveIncomeTransactions = monthTransactions.filter((transaction) => transaction.type === 'income').length
  const stabilityScore = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        35 + Math.min(30, positiveIncomeTransactions * 10) + (cashflow >= 0 ? 20 : -10) + (budgetUsageRatio <= 1 ? 15 : -10)
      )
    )
  )

  const overallScore = Math.round(
    cashflowScore * 0.22 +
    savingsScore * 0.18 +
    efficiencyScore * 0.2 +
    debtScore * 0.2 +
    stabilityScore * 0.2
  )

  const financialCategory =
    overallScore >= 80 ? 'Sangat Sehat' :
    overallScore >= 60 ? 'Cukup Sehat' :
    overallScore >= 40 ? 'Kurang Stabil' :
    'Buruk'

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
      note: cashflow >= 0 ? 'Pemasukan lebih besar dari pengeluaran.' : 'Pengeluaran melebihi pemasukan.',
    },
    {
      label: 'Rasio Tabungan',
      score: savingsScore,
      note: savingsRatio >= 0.25 ? 'Tabungan stabil dibanding pemasukan.' : 'Perlu tingkatkan tabungan.',
    },
    {
      label: 'Efisiensi Pengeluaran',
      score: efficiencyScore,
      note: budgetUsageRatio <= 0.85 ? 'Pengeluaran berada dalam batas anggaran.' : 'Pengeluaran mendekati atau melewati anggaran.',
    },
    {
      label: 'Kondisi Hutang',
      score: debtScore,
      note: totalDebt > 0 ? 'Hutang terdeteksi; usahakan pelunasan.' : 'Tidak ada hutang teridentifikasi.',
    },
    {
      label: 'Stabilitas Arus Kas',
      score: stabilityScore,
      note: positiveIncomeTransactions >= 2 ? 'Arus kas cukup stabil bulan ini.' : 'Perlu pemasukan lebih konsisten.',
    },
  ]

  const circleRadius = 60
  const circleCircumference = 2 * Math.PI * circleRadius
  const progressOffset = circleCircumference * (1 - overallScore / 100)

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-gradient-to-r from-[#2e8b87] via-[#38ADA9] to-[#4fb7b2] p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-100/80">Selamat Datang</p>
            <h1 className="mt-2 text-3xl font-semibold">{userProfile?.nama || 'Pengguna'}</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-100/90">
              Pantau saldo e-wallet, pencapaian keberlanjutan, dan transaksi terbaru dalam satu tampilan bersih.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/20 bg-white/10 p-4 text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-100/80">Saldo E-Wallet</p>
            <p className="mt-2 text-3xl font-semibold">
              Rp {eWalletBalance.toLocaleString('id-ID')}
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
                Rp {saldoPemasukanBulanIniTermasukSaldoAwal.toLocaleString('id-ID')}
              </h2>

              <p className="mt-3 text-sm text-slate-500">Total pemasukan per bulan</p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] bg-[#F6B93B] p-6 text-white shadow-sm border border-[#e6a53f]">
          <p className="text-sm uppercase tracking-[0.24em] text-white/80">Saldo Pengeluaran</p>
          <h2 className="mt-4 text-4xl font-semibold text-white/80">
            Rp {saldoPengeluaranBulanIni.toLocaleString('id-ID')}
          </h2>
          <p className="mt-3 text-sm text-white/80">Total pengeluaran per bulan</p>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-[#f8fafc] to-[#eef2ff] p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${budgetReminderStatus.iconBgClass}`}>
                {budgetReminderStatus.key === 'none' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : budgetReminderStatus.key === 'warning' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase block">Budget Reminder</span>
                <h4 className="mt-0.5 text-[14px] font-bold text-slate-800 leading-tight">
                  {budgetReminderStatus.label}
                </h4>
                <p className="mt-0.5 text-xs text-slate-500 leading-tight line-clamp-2 w-full">
                  {budgetReminderStatus.desc}
                </p>
              </div>
            </div>

            <div className={`h-9 w-9 shrink-0 flex items-center justify-center rounded-full text-xs font-bold border ${budgetReminderStatus.badgeClass}`}>
              {budgetReminderStatus.badge}
            </div>
          </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Financial Health Score</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Kondisi Keuangan Anda</h2>
            <p className="mt-2 text-sm text-slate-500">
              Skor dihitung berdasarkan cashflow, rasio tabungan, efisiensi pengeluaran, kondisi hutang, dan stabilitas arus kas.
            </p>
          </div>
          <div className={`rounded-3xl border px-4 py-3 text-center ${scoreColor}`}>
            <p className="text-xs uppercase tracking-[0.24em]">Kategori</p>
            <p className="mt-2 text-lg font-semibold">{financialCategory}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6 text-center">
            <div className="relative mx-auto h-[140px] w-[140px]">
              <svg className="h-full w-full" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="60" stroke="#E2E8F0" strokeWidth="12" fill="transparent" />
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
                  transform="rotate(-90 70 70)"
                  className="transition-all duration-500"
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
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Mulai dengan cepat</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <button
              key={action.category}
              type="button"
              onClick={() => onQuickAction?.(action.category)}
              className="group flex items-center gap-3 rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-[#38ADA9] hover:bg-[#f5fffd]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e6f6f3] text-2xl text-[#2e8b87]">
                {action.icon}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{action.label}</p>
                <p className="text-sm text-slate-500">Buka kategori</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

export default DashboardMasyarakatPage
