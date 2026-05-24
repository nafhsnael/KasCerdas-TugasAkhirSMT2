import StatCard from '../components/StatCard'
import BiggestExpenseCard from '../components/BiggestExpenseCard'


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
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-6xl px-4 pt-4 pb-6 sm:px-6 lg:px-4">
        <div className="rounded-[32px] border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
          <h1 className="text-[32px] font-semibold leading-tight tracking-tight text-[#0F172A] sm:text-[34px]">
            Analisis Keuangan
          </h1>
          <p className="mt-2 text-[16px] leading-6 text-[#64748B]">
            Analisis keuangan membantu pengguna memantau kondisi keuangan secara ringkas dan jelas
          </p>
        </div>

        <div className="mt-8 space-y-8">
          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Ringkasan Bulanan</p>
              <h3 className="text-xl font-semibold text-slate-900">Pemasukan & Pengeluaran</h3>
            </div>

            <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
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

              <StatCard
                label="Total pemasukan bulan ini"
                value={`Rp ${totalIncomeMonth.toLocaleString('id-ID')}`}
                description="Jumlah pemasukan pada bulan berjalan dari transaksi pengguna"
              />

              <BiggestExpenseCard transactions={transactions} />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default AnalysisPage
