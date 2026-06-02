import TransactionCard from '../components/TransactionCard'

import { useMemo } from 'react'

function DashboardUMKMPage({
  walletSummary,
  transactions,
  budgets,
  walletInfo,
  userProfile,
  umkmSummary,
  eWalletBalance,
  onQuickAction,
}) {
  // initialIncome = saldo awal yang dimasukkan (Initial/Saldo Awal)
  // NOTE: di beberapa backend payload, saldo awal kadang sudah tercampur di umkmSummary.income.
  // Agar output benar-benar berubah sesuai instruksi: masukkan saldo awal dari transaksi, lalu
  // keluarkan saldo awal yang kemungkinan sudah ada di umkmSummary.income.
  const initialIncome = (transactions || [])
    .filter((t) => {
      const cat = (t.businessCategory || t.category || '').toString().toLowerCase()
      return cat === 'initial' || cat === 'saldo awal'
    })
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

  const rawUmkmIncome = Number(umkmSummary?.income ?? 0)

  // Aturan Bisnis UMKM: "Saldo Pemasukan" & "Arus Kas Usaha" HANYA boleh menjumlahkan pemasukan riil usaha dan bersih dari Saldo Awal.
  const businessIncome = rawUmkmIncome

  // Untuk laba/rugi: SALDO AWAL tidak ikut masuk.
  const profitIncome = rawUmkmIncome

  const businessExpense = Number(umkmSummary?.operationalExpense ?? 0)



  const inventoryItems = Array.isArray(umkmSummary.inventory) ? umkmSummary.inventory : []

  const lowStockItems = inventoryItems.filter((item) => item.stock <= item.reorderLevel)
  const totalPayables = umkmSummary.payables
  const totalReceivables = umkmSummary.receivables
  const costOfGoodsSold = umkmSummary.estimatedHpp
  const profitLoss = profitIncome - costOfGoodsSold - businessExpense
  
  // Gunakan eWalletBalance dari props untuk Saldo E-Wallet
  const eWalletBalanceValue = Number(eWalletBalance ?? 0)
  
  // Hitung Financial Score Health (0-100%)
  const calculateFinancialScore = () => {
    let score = 50 // Base score
    
    // Bonus untuk memiliki pemasukan
    if (businessIncome > 0) score += 15
    
    // Bonus untuk pengeluaran terkontrol
    // Jika belum ada pengeluaran sama sekali, efisiensi dianggap maksimal.
    if (businessExpense <= 0) score += 20
    else if (businessExpense <= businessIncome * 0.5) score += 20
    else if (businessExpense > businessIncome * 0.5) score -= 10

    
    // Bonus untuk stok yang sehat
    const lowStockRatio = inventoryItems.length > 0 ? lowStockItems.length / inventoryItems.length : 0
    if (lowStockRatio < 0.2) score += 15
    else if (lowStockRatio > 0.5) score -= 10
    
    // Bonus untuk profit positif
    if (profitLoss > 0) score += 20
    else if (profitLoss < 0) score -= 20
    
    // Bonus untuk piutang terkontrol
    if (totalReceivables <= businessIncome * 0.3) score += 10
    
    return Math.max(0, Math.min(100, score))
  }
  
  const financialScore = calculateFinancialScore()

  const quickActions = useMemo(
    () => [
      {
        label: 'Penjualan',
        category: 'Penjualan',
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        label: 'Pemasukan',
        category: 'Pemasukan',
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
      },
      {
        label: 'Pengeluaran Operasional',
        category: 'Pengeluaran Operasional',
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        label: 'Beli Bahan Baku / Stok',
        category: 'Beli Bahan Baku / Stok',
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        ),
      },
      {
        label: 'Piutang Pelanggan',
        category: 'Piutang Pelanggan',
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        ),
      },
      {
        label: 'Hutang Supplier',
        category: 'Hutang Supplier',
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        ),
      },
      {
        label: 'Tabungan',
        category: 'Tabungan',
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
      },
    ],
    []
  )


  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-gradient-to-r from-[#2e8b87] via-[#38ADA9] to-[#4fb7b2] p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-100/80">Selamat Datang di Dashboard UMKM</p>
            <h1 className="mt-2 text-3xl font-semibold">{userProfile?.nama || 'Pengusaha'}</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-100/90">
              Kelola arus kas usaha, pantau stok barang, track piutang dan utang, serta lihat laporan laba rugi real-time.
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 p-4 text-right text-slate-100/90 border border-white/20">
            <p className="text-xs uppercase tracking-[0.24em]">Saldo e-wallet</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              Rp {eWalletBalanceValue.toLocaleString('id-ID')}
            </p>
            <p className="text-sm text-slate-100/80">saldo e-wallet saat ini</p>
          </div>
        </div>
      </section>


      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">UMKM</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Ringkasan Usaha</h2>
            <p className="mt-3 text-sm text-slate-500">
              Pantau keuangan bisnis, stok, utang/piutang, dan perhitungan laba rugi otomatis.
            </p>
          </div>

        </div>

          {/* Stat Cards: 3 fitur utama (Budget Reminder tidak bikin bar kosong) */}
          <div className="mb-6 grid gap-3 lg:grid-cols-3">


          {/* Saldo Pemasukan */}
          <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] p-4 lg:col-span-1">


          
            <p className="text-[13px] uppercase tracking-[0.24em] text-slate-500">Saldo Pemasukan</p>
            <p className="mt-2 text-xl font-semibold text-emerald-600">Rp {businessIncome.toLocaleString('id-ID')}</p>
            <p className="mt-1 text-[11px] text-slate-600">Saldo dihitung per bulan.</p>
          </div>

          {/* Saldo Pengeluaran */}
          <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-[#fef2f2] to-[#fee2e2] p-4">
            <p className="text-[13px] uppercase tracking-[0.24em] text-slate-500">Saldo Pengeluaran</p>
            <p className="mt-2 text-xl font-semibold text-rose-600">Rp {businessExpense.toLocaleString('id-ID')}</p>
            <p className="mt-1 text-[11px] text-slate-600 leading-tight">Total pengeluaran per bulan (bulan berjalan).</p>
          </div>

          {/* Financial Score Health */}
          <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-[#fffbf0] to-[#fef3c7] p-4">
            <p className="text-[13px] uppercase tracking-[0.24em] text-slate-500">Financial Score</p>
            <p className="mt-2 text-xl font-semibold" style={{ color: '#F6B93B' }}>{Math.round(financialScore)}%</p>
            <p className="mt-1 text-[11px] text-slate-600">Kesehatan keuangan bisnis</p>
            <div className="mt-2 h-1.5 rounded-full bg-slate-200">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${financialScore}%`,
                  backgroundColor: '#F6B93B',
                }}
              />
            </div>
          </div>

          {/* Budget Reminder */}
          <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-[#f8fafc] to-[#eef2ff] p-4 lg:col-span-4">
            {(() => {
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

              // Status definitions
              let statusLabel = 'Pengeluaran masih aman'
              let statusDesc = 'Pengeluaran bulan ini masih terkendali.'
              let badgeText = `${topRatioPercent}%`

              if (!budgets || budgets.length === 0) {
                statusLabel = 'Belum ada budget'
                statusDesc = 'Tambahkan budget agar ada pengingat otomatis.'
                badgeText = '-'
              } else if (isWarning) {
                statusLabel = 'Peringatan: Anggaran Hampir Habis!'
                statusDesc = `Pengeluaran untuk ${topBudget.category} telah mencapai ${topRatioPercent}%.`
              }

              const iconBgClass = !budgets || budgets.length === 0
                ? 'bg-slate-100 text-slate-500'
                : isWarning
                  ? 'bg-amber-50 text-amber-500'
                  : 'bg-green-50 text-green-500'

              const badgeColorClass = !budgets || budgets.length === 0
                ? 'bg-slate-50 text-slate-700 border-slate-200'
                : isWarning
                  ? topRatioPercent >= 100
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'

              return (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconBgClass}`}>
                      {!budgets || budgets.length === 0 ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : isWarning ? (
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
                        {statusLabel}
                      </h4>
                      <p className="mt-0.5 text-xs text-slate-500 leading-tight line-clamp-2 w-full">
                        {statusDesc}
                      </p>
                    </div>
                  </div>

                  <div className={`h-9 w-9 shrink-0 flex items-center justify-center rounded-full text-xs font-bold border ${badgeColorClass}`}>
                    {badgeText}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>


        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Arus Kas Usaha</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">Rp {businessIncome.toLocaleString('id-ID')}</p>
            <p className="mt-2 text-sm text-slate-600">Pemasukan usaha</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Keluar Operasional</p>
                <p className="mt-2 text-lg font-semibold text-rose-600">Rp {businessExpense.toLocaleString('id-ID')}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">HPP Diperkirakan</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">Rp {costOfGoodsSold.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Laba Rugi Otomatis</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">Rp {profitLoss.toLocaleString('id-ID')}</p>
            <p className="mt-2 text-sm text-slate-600">Pendapatan dikurangi HPP dan biaya operasional</p>
          </div>




          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Utang & Piutang</p>
            <div className="mt-3 space-y-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Total Utang</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">Rp {totalPayables.toLocaleString('id-ID')}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Total Piutang</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">Rp {totalReceivables.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">stok bahan baku / barang</p>
            <div className="mt-3 space-y-3">
              {inventoryItems.length > 0 ? (
                inventoryItems.map((item, index) => (
                  <div key={item.id ?? item.transactionId ?? `${item.name}-${index}`} className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          Number(item.stock) <= Number(item.reorderLevel)
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {Number(item.stock) <= Number(item.reorderLevel) ? 'Menipis' : 'Aman'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">Kuantitas: {item.stock} unit</p>
                    {item.invoice && (
                      <p className="mt-1 text-xs text-slate-400">{item.invoice}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-500">Belum ada item stok.</p>
                </div>
              )}
            </div>
          </div>
            
        </div>
      </section>



      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Aksi Cepat</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Kelola bisnis Anda</h2>
          </div>
        </div>

        {/* UI: 1 baris maksimal 3 kartu agar pas dengan desain (misal: Piutang, Hutang, Tabungan) */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => onQuickAction?.(action.category)}
              className="group flex min-h-[88px] items-center gap-3 rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-[#38ADA9] hover:bg-[#f5fffd]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e6f6f3] text-2xl text-[#2e8b87]">
                {action.icon}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{action.label}</p>
                <p className="text-xs text-slate-500">Lihat detail</p>
              </div>
            </button>
          ))}
        </div>
      </section>



    </div>
  )
}

export default DashboardUMKMPage
