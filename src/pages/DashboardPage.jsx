import TransactionCard from '../components/TransactionCard'
import StatCard from '../components/StatCard'

function DashboardPage({ walletSummary, transactions, budgets, walletInfo, userProfile, umkmSummary, onQuickAction }) {

  const recentTransactions = transactions.slice(0, 4)
  const isUmkm = userProfile?.usertype === 'umkm'
  const businessIncome = isUmkm ? umkmSummary.income : walletSummary.income || 0
  const businessExpense = isUmkm ? umkmSummary.operationalExpense : walletSummary.expense || 0
  const inventoryItems = isUmkm
    ? umkmSummary.inventory
    : [
        { name: 'Bahan baku utama', stock: 18, reorderLevel: 10 },
        { name: 'Produk siap jual', stock: 6, reorderLevel: 15 },
        { name: 'Kemasan & label', stock: 32, reorderLevel: 8 },
      ]
  const lowStockItems = inventoryItems.filter((item) => item.stock <= item.reorderLevel)
  const totalPayables = isUmkm ? umkmSummary.payables : 4200000
  const totalReceivables = isUmkm ? umkmSummary.receivables : 1750000
  const estimatedHpp = isUmkm ? umkmSummary.estimatedHpp : Math.round(businessIncome * 0.42)
  const costOfGoodsSold = estimatedHpp
  const profitLoss = businessIncome - costOfGoodsSold - businessExpense
  const netCash = profitLoss
  const financialHealthRaw = businessIncome > 0 ? (netCash / businessIncome) * 100 : 0
  const financialHealthPercent = Math.max(0, Math.min(100, financialHealthRaw))

  const financialHealthStatus = financialHealthPercent >= 60 ? 'Aman' : 'Perlu perhatian'

  const smartCashPerDay = walletSummary?.smartCashPerDay ?? 0
  const smartReductionPerDay = walletSummary?.smartReductionPerDay ?? 0

  const umkmQuickActions = [
    { label: 'Penjualan', icon: '🧾', businessCategory: 'Penjualan' },
    { label: 'Pemasukan', icon: '＋', businessCategory: 'Pemasukan' },
    { label: 'Pengeluaran Operasional', icon: '−', businessCategory: 'Pengeluaran Operasional' },
    { label: 'Beli Bahan Baku', icon: '📦', businessCategory: 'Beli Bahan Baku / Stok' },
    { label: 'Piutang Pelanggan', icon: '👥', businessCategory: 'Piutang Pelanggan' },
    { label: 'Hutang Supplier', icon: '🏭', businessCategory: 'Hutang Supplier' },
  ]

  const quickActions = isUmkm
    ? umkmQuickActions
    : [
        { label: 'Transfer', icon: '🔁' },
        { label: 'Tagihan', icon: '📄' },
        { label: 'Investasi', icon: '📈' },
        { label: 'QRIS', icon: '🔲' },
        { label: 'Donasi', icon: '💚' },
        { label: 'Riwayat', icon: '🕘' },
      ]


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
            <p className="text-xs uppercase tracking-[0.24em] text-slate-100/80">Financial Score Health</p>
            <p className="mt-2 text-3xl font-semibold">{financialHealthPercent.toLocaleString('id-ID')}%</p>
            <p className="text-sm text-slate-100/80">Status: {financialHealthStatus}</p>
          </div>
        </div>
      </section>

      {isUmkm && (
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">UMKM</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Ringkasan Usaha</h2>
              <p className="mt-3 text-sm text-slate-500">
                Fitur khusus UMKM untuk memisahkan keuangan usaha dan pribadi, memantau arus kas, stok, laba rugi, dan hutang/piutang.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-slate-900">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Dompet</p>
              <p className="mt-2 text-xl font-semibold">Dompet Usaha</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Arus Kas Usaha</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">Rp {businessIncome.toLocaleString('id-ID')}</p>
              <p className="mt-2 text-sm text-slate-600">Pemasukan usaha</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-500">Pengeluaran Operasional</p>
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
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Hutang & Piutang</p>
              <div className="mt-3 space-y-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-500">Total Hutang</p>
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
      )}

      <section className="grid gap-4 xl:grid-cols-[1.7fr_1fr_1fr]">
        <div className="rounded-[32px] bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Saldo E-Wallet</p>
              <h2 className="mt-4 text-4xl font-semibold text-slate-900">Rp {walletSummary.current.toLocaleString('id-ID')}</h2>
              <p className="mt-3 text-sm text-slate-500">+12,5% dibanding bulan lalu</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-slate-900">
              <span className="text-2xl">💳</span>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] bg-slate-900 p-6 text-white shadow-sm border border-slate-800">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Financial Score Health</p>
          <h2
            className="mt-4 text-4xl font-semibold"
            style={{ color: '#fdfdfd' }}
          >
            {financialHealthPercent.toLocaleString('id-ID')}%
          </h2>
          <p className="mt-3 text-sm text-slate-300">Status: {financialHealthStatus}</p>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Saldo Pemasukan</p>
          <h2 className="mt-4 text-4xl font-semibold text-slate-900">Rp {smartCashPerDay.toLocaleString('id-ID')}</h2>
          <p className="mt-3 text-sm text-slate-500">Pemasukan per hari</p>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Saldo Pengeluaran</p>
          <h2 className="mt-4 text-4xl font-semibold text-slate-900">Rp {smartReductionPerDay.toLocaleString('id-ID')}</h2>
          <p className="mt-3 text-sm text-slate-500">Pengeluaran per hari</p>
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
              key={action.label}
              onClick={() => onQuickAction?.(action.businessCategory)}
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
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Riwayat Transaksi Terakhir</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Transaksi terbaru</h2>
          </div>
          <span className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {transactions.length} transaksi
          </span>
        </div>
        <div className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <p className="text-sm text-slate-500">Tidak ada transaksi terbaru saat ini.</p>
          )}
        </div>
      </section>

      {walletInfo && (
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Dompet Terhubung</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">{walletInfo.name}</h2>
            </div>
            <p className="text-sm text-slate-600">Saldo: Rp {Number(walletInfo.balance).toLocaleString('id-ID')}</p>
          </div>
        </section>
      )}
    </div>
  )
}

export default DashboardPage
