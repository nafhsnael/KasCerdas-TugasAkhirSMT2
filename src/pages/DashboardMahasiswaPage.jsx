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

  const totalIncome = transactions
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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-100/80">Selamat Datang, Mahasiswa</p>
            <h1 className="mt-2 text-3xl font-semibold">{userProfile?.nama || 'Mahasiswa'}</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-100/90">
              Kelola keuangan kuliah, kos, dan pengeluaran sehari-hari dengan mudah.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/20 bg-white/10 p-4 text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-100/80">Saldo </p>
            <p className="mt-2 text-3xl font-semibold">Rp {totalIncome.toLocaleString('id-ID')}</p>
            <p className="text-sm text-slate-100/80">Pemasukan bulan ini</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[32px] bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Saldo Dompet</p>
              <h2 className="mt-4 text-4xl font-semibold text-slate-900">Rp {walletSummary.current.toLocaleString('id-ID')}</h2>
              <p className="mt-3 text-sm text-slate-500">Saldo tersedia sekarang</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-slate-900">
              <span className="text-2xl">💳</span>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] bg-slate-900 p-6 text-white shadow-sm border border-slate-800">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Pengeluaran Bulan Ini</p>
          <h2 className="mt-4 text-4xl font-semibold">Rp {totalExpense.toLocaleString('id-ID')}</h2>
          <p className="mt-3 text-sm text-slate-300">Total biaya sejauh ini</p>
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
