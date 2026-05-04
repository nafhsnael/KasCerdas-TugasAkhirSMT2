import StatCard from '../components/StatCard'

function AnalysisPage({ transactions }) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const monthTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  const totalIncomeMonth = monthTransactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const totalExpenseMonth = monthTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const totalExpenseAll = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const balanceMonth = totalIncomeMonth - totalExpenseMonth

  const expenseTransactions = monthTransactions.filter((transaction) => transaction.type === 'expense')

  const largestExpense = expenseTransactions.length
    ? expenseTransactions.reduce((max, transaction) => (transaction.amount > max.amount ? transaction : max), expenseTransactions[0])
    : null

  const smallestExpense = expenseTransactions.length
    ? expenseTransactions.reduce((min, transaction) => (transaction.amount < min.amount ? transaction : min), expenseTransactions[0])
    : null

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Analisis</p>
          <h2 className="text-2xl font-semibold text-slate-900">keuangan bulan ini</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Analisis otomatis dari transaksi pengguna tanpa diagram. Semua angka dihitung dari data transaksi saat ini.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <StatCard
            label="Total pemasukan bulan ini"
            value={`Rp ${totalIncomeMonth.toLocaleString('id-ID')}`}
            description="Jumlah pemasukan pada bulan berjalan dari transaksi pengguna"
          />
          <StatCard
            label="Total pengeluaran bulan ini"
            value={`Rp ${totalExpenseMonth.toLocaleString('id-ID')}`}
            description="Jumlah pengeluaran pada bulan berjalan dari transaksi pengguna"
          />
          <StatCard
            label="Sisa saldo bulan ini"
            value={`Rp ${balanceMonth.toLocaleString('id-ID')}`}
            description="Selisih antara pemasukan dan pengeluaran bulan berjalan"
          />
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Detail pengeluaran</p>
          <h3 className="text-xl font-semibold text-slate-900">Ringkasan pengeluaran</h3>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <StatCard
            label="Pengeluaran terbesar"
            value={largestExpense ? `Rp ${largestExpense.amount.toLocaleString('id-ID')}` : 'Rp 0'}
            description={largestExpense ? largestExpense.title : 'Tidak ada pengeluaran bulan ini'}
          />
          <StatCard
            label="Pengeluaran terkecil"
            value={smallestExpense ? `Rp ${smallestExpense.amount.toLocaleString('id-ID')}` : 'Rp 0'}
            description={smallestExpense ? smallestExpense.title : 'Tidak ada pengeluaran bulan ini'}
          />
          <StatCard
            label="Total keseluruhan pengeluaran"
            value={`Rp ${totalExpenseAll.toLocaleString('id-ID')}`}
            description="Jumlah pengeluaran dari seluruh transaksi pengguna"
          />
        </div>
      </section>
    </div>
  )
}

export default AnalysisPage
