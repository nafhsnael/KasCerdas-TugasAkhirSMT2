import TransactionCard from '../components/TransactionCard'
import StatCard from '../components/StatCard'

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

  const monthTransactions = transactions.filter((t) => {
    const d = new Date(t.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

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
              <p className="mt-3 text-sm text-slate-500">Pemasukan total bulan ini</p>
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
          <p className="mt-3 text-sm text-slate-500">Pengeluaran total bulan ini</p>
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
    </div>
  )
}

export default DashboardMasyarakatPage

