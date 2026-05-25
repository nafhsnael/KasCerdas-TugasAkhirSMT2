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
  const recentTransactions = transactions.slice(0, 4)

  const businessIncome = umkmSummary.income
  const businessExpense = transactions
    .filter((t) => (t.businessCategory || t.category) === 'Pengeluaran Operasional')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

  const inventoryItems = Array.isArray(umkmSummary.inventory) ? umkmSummary.inventory : []

  const lowStockItems = inventoryItems.filter((item) => item.stock <= item.reorderLevel)
  const totalPayables = umkmSummary.payables
  const totalReceivables = umkmSummary.receivables
  const costOfGoodsSold = umkmSummary.estimatedHpp
  const profitLoss = businessIncome - costOfGoodsSold - businessExpense
  
  // Gunakan eWalletBalance dari props untuk Saldo E-Wallet
  const eWalletBalanceValue = Number(eWalletBalance ?? 0)
  
  // Hitung Financial Score Health (0-100%)
  const calculateFinancialScore = () => {
    let score = 50 // Base score
    
    // Bonus untuk memiliki pemasukan
    if (businessIncome > 0) score += 15
    
    // Bonus untuk pengeluaran terkontrol
    if (businessExpense > 0 && businessExpense <= businessIncome * 0.5) score += 20
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
          <div className="rounded-3xl bg-slate-50 p-4 text-slate-900">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Status</p>
            <p className="mt-2 text-xl font-semibold">Aktif</p>
          </div>
        </div>

        {/* Stat Cards (4 fitur) dalam 1 baris agar full satu baris */}
        <div className="mb-6 grid gap-4 lg:grid-cols-4">
          {/* E-Wallet Saldo */}
          <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-[#f0fffe] to-[#e6f6f3] p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Saldo E-Wallet</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">Rp {eWalletBalanceValue.toLocaleString('id-ID')}</p>
            <p className="mt-2 text-xs text-slate-600">Saldo yang kamu miliki saat ini</p>
          </div>


          {/* Saldo Pemasukan */}
          <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Saldo Pemasukan</p>
            <p className="mt-3 text-2xl font-semibold text-emerald-600">Rp {businessIncome.toLocaleString('id-ID')}</p>
            <p className="mt-2 text-xs text-slate-600">Saldo dihitung per bulan.</p>
          </div>

          {/* Saldo Pengeluaran */}
          <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-[#fef2f2] to-[#fee2e2] p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Saldo Pengeluaran</p>
            <p className="mt-3 text-2xl font-semibold text-rose-600">Rp {businessExpense.toLocaleString('id-ID')}</p>
            <p className="mt-2 text-xs text-slate-600">Saldo dihitung per bulan.</p>
          </div>

          {/* Financial Score Health */}
          <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-[#fffbf0] to-[#fef3c7] p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Financial Score</p>
            <p className="mt-3 text-2xl font-semibold" style={{ color: '#F6B93B' }}>{Math.round(financialScore)}%</p>
            <p className="mt-2 text-xs text-slate-600">Kesehatan keuangan bisnis</p>
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
                inventoryItems.map((item) => (
                  <div key={item.id ?? item.name} className="rounded-2xl bg-white p-4 shadow-sm">
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
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Aksi Cepat</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Kelola bisnis Anda</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
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


    </div>
  )
}

export default DashboardUMKMPage
