import StatCard from '../components/StatCard'
import BiggestExpenseCard from '../components/BiggestExpenseCard'
import MonthlyCashflowTableCard from '../components/MonthlyCashflowTableCard'
import ExpenseCompositionCard from '../components/ExpenseCompositionCard'
import PeriodDevelopmentCard from '../components/PeriodDevelopmentCard'

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
      <div className="mx-auto max-w-6xl px-3 pt-6 pb-6 sm:px-4 lg:px-4">
        <div className="rounded-[32px] border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
          <h1 className="text-[32px] font-semibold leading-tight tracking-tight text-[#0F172A] sm:text-[34px]">
            Analisis Keuangan
          </h1>
          <p className="mt-2 text-[16px] leading-6 text-[#64748B]">
            Analisis keuangan membantu pengguna memantau kondisi keuangan secara ringkas dan jelas
          </p>
        </div>

        <div className="mt-8 space-y-8">
          <section className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="min-w-0">
              <MonthlyCashflowTableCard transactions={transactions} periodLabel="Bulan Ini" compact />
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 px-2">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Komposisi Pengeluaran per Pos</p>
            </div>

            <div className="min-w-0">
              <ExpenseCompositionCard transactions={transactions} periodLabel="Bulan Ini" compact />
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-6">
              <PeriodDevelopmentCard transactions={transactions} periodLabel="Bulan Ini" />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default AnalysisPage
