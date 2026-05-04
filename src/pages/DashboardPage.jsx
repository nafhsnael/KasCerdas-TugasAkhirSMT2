import TransactionCard from '../components/TransactionCard'
import StatCard from '../components/StatCard'
import BudgetCard from '../components/BudgetCard'

function DashboardPage({ walletSummary, transactions, budgets }) {
  const overspentBudgets = budgets.filter((budget) => budget.usage > budget.limit)
  const highUsageBudgets = budgets
    .filter((budget) => budget.usage / budget.limit >= 0.8)
    .sort((a, b) => b.usage / b.limit - a.usage / a.limit)

  const budgetHighlights = overspentBudgets.length > 0 ? overspentBudgets : highUsageBudgets.slice(0, 3)

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Dashboard</p>
            <h2 className="text-2xl font-semibold text-slate-900">Ringkasan Keuangan</h2>
          </div>
          <p className="max-w-xl text-sm text-slate-500">
            Pantau saldo, transaksi terbaru, dan kategori budget yang perlu diperhatikan dalam satu tampilan ringkas.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Saldo saat ini"
            value={`Rp ${walletSummary.current.toLocaleString('id-ID')}`}
            description={`Total saldo bersih dari semua dompet`}
          />
          <StatCard
            label="Total pemasukan"
            value={`Rp ${walletSummary.income.toLocaleString('id-ID')}`}
            description={`Selama periode peninjauan`}
          />
          <StatCard
            label="Total pengeluaran"
            value={`Rp ${walletSummary.expense.toLocaleString('id-ID')}`}
            description={`Transaksi pengeluaran terakhir`}
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Transaksi terbaru</p>
              <h3 className="text-xl font-semibold text-slate-900">Riwayat singkat</h3>
            </div>
            <span className="rounded-2xl bg-slate-100 px-3 py-1 text-sm text-slate-600">
              {transactions.length} terakhir
            </span>
          </div>


          <div className="space-y-4">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <p className="text-sm text-slate-500">Tidak ada transaksi terbaru saat ini.</p>
            )}
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Budget Reminder</p>
            <h3 className="text-xl font-semibold text-slate-900">Perhatian anggaran</h3>
          </div>

          <div className="space-y-4">
            {budgetHighlights.length > 0 ? (
              budgetHighlights.map((budget) => (
                <BudgetCard key={budget.category} {...budget} />
              ))
            ) : (
              <p className="text-sm text-slate-500">Semua budget masih dalam batas aman.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default DashboardPage
