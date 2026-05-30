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

  // Instruksi: "Saldo Pemasukan" di dashboard UMKM harus memasukkan saldo awal.
  // Jadi businessIncome = income UMKM + saldo awal (tanpa mencoba heuristik double-add).
  const businessIncome = rawUmkmIncome + initialIncome

  // Untuk laba/rugi: SALDO AWAL tidak ikut masuk.
  const profitIncome = rawUmkmIncome

  const businessExpense = transactions
    .filter((t) => (t.businessCategory || t.category) === 'Pengeluaran Operasional')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)



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
      { label: 'Penjualan', icon: '💰', category: 'Penjualan' },
      { label: 'Pemasukan', icon: '💸', category: 'Pemasukan' },
      { label: 'Pengeluaran Operasional', icon: '🧾', category: 'Pengeluaran Operasional' },
      { label: 'Beli Bahan Baku / Stok', icon: '📦', category: 'Beli Bahan Baku / Stok' },
      { label: 'Piutang Pelanggan', icon: '📋', category: 'Piutang Pelanggan' },
      { label: 'Hutang Supplier', icon: '💳', category: 'Hutang Supplier' },
      { label: 'Tabungan', icon: '🏦', category: 'Tabungan' },
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
              const totalBudget = (budgets || []).reduce((sum, b) => sum + (Number(b?.limit) || 0), 0)
              const totalBudgetUsage = (budgets || []).reduce((sum, b) => sum + (Number(b?.usage) || 0), 0)
              const budgetUsageRatio = totalBudget > 0 ? totalBudgetUsage / totalBudget : 0

              const budgetByCategory = (budgets || []).reduce((acc, b) => {
                const category = b?.category || b?.name || 'Kategori'
                const limit = Number(b?.limit) || 0
                if (!acc[category]) acc[category] = { limit: 0, usage: 0 }
                acc[category].limit += limit
                acc[category].usage += Number(b?.usage) || 0
                return acc
              }, {})

              const topBudgetCategory = Object.entries(budgetByCategory)
                .map(([category, v]) => ({ category, ratio: v.limit > 0 ? v.usage / v.limit : 0, limit: v.limit, usage: v.usage }))
                .sort((a, b) => b.ratio - a.ratio)[0]

              const status =
                totalBudget <= 0
                  ? { key: 'none', label: 'Belum ada budget', desc: 'Tambahkan budget agar ada pengingat otomatis.', color: 'slate' }
                  : budgetUsageRatio <= 0.8
                    ? { key: 'safe', label: 'Pengeluaran masih aman', desc: 'Pengeluaran bulan ini masih terkendali.', color: 'emerald' }
                    : budgetUsageRatio <= 1
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

              const badgeText = totalBudget > 0 ? `${Math.round(budgetUsageRatio * 100)}%` : '-'

              return (
                <>
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
                </>
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
