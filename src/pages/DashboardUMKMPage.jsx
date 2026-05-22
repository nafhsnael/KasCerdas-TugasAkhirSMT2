import TransactionCard from '../components/TransactionCard'

import { useMemo } from 'react'

function DashboardUMKMPage({
  walletSummary,
  transactions,
  budgets,
  walletInfo,
  userProfile,
  umkmSummary,
  onQuickAction,
}) {
  const recentTransactions = transactions.slice(0, 4)

  const businessIncome = umkmSummary.income
  const businessExpense = umkmSummary.operationalExpense
  const inventoryItems = umkmSummary.inventory
  const lowStockItems = inventoryItems.filter((item) => item.stock <= item.reorderLevel)
  const totalPayables = umkmSummary.payables
  const totalReceivables = umkmSummary.receivables
  const costOfGoodsSold = umkmSummary.estimatedHpp
  const profitLoss = businessIncome - costOfGoodsSold - businessExpense

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
          <div className="rounded-[28px] border border-white/20 bg-white/10 p-4 text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-100/80">Dompet Usaha</p>
            <p className="mt-2 text-3xl font-semibold">Rp {businessIncome.toLocaleString('id-ID')}</p>
            <p className="text-sm text-slate-100/80">Pemasukan bulan ini</p>
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
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Stok Barang</p>
            <div className="mt-3 space-y-3">
              {inventoryItems.map((item) => (
                <div key={item.name} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.stock <= item.reorderLevel ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {item.stock <= item.reorderLevel ? 'Menipis' : 'Aman'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Stok: {item.stock} unit</p>
                </div>
              ))}
            </div>
            {lowStockItems.length > 0 && (
              <p className="mt-4 text-sm text-rose-600">{lowStockItems.length} produk hampir menipis. Segera restock.</p>
            )}
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
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.7fr_1fr_1fr]">
        <div className="rounded-[32px] bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Saldo E-Wallet</p>
              <h2 className="mt-4 text-4xl font-semibold text-slate-900">Rp {walletSummary?.current?.toLocaleString?.('id-ID') ?? walletSummary?.current ?? 0}</h2>
              <p className="mt-3 text-sm text-slate-500">+0% dibanding bulan lalu</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-slate-900">
              <span className="text-2xl">💳</span>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] bg-slate-900 p-6 text-white shadow-sm border border-slate-800">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Financial Score Health</p>
          <h2 className="mt-4 text-4xl font-semibold" style={{ color: '#fdfdfd' }}>
            0%
          </h2>
          <p className="mt-3 text-sm text-slate-300">Status: Perlu perhatian</p>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Saldo Pemasukan</p>
          <h2 className="mt-4 text-4xl font-semibold text-slate-900">Rp {walletSummary?.smartCashPerDay?.toLocaleString?.('id-ID') ?? walletSummary?.smartCashPerDay ?? 0}</h2>
          <p className="mt-3 text-sm text-slate-500">Pemasukan per hari</p>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Saldo Pengeluaran</p>
          <h2 className="mt-4 text-4xl font-semibold text-slate-900">Rp {walletSummary?.smartReductionPerDay?.toLocaleString?.('id-ID') ?? walletSummary?.smartReductionPerDay ?? 0}</h2>
          <p className="mt-3 text-sm text-slate-500">Pengeluaran per hari</p>
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
