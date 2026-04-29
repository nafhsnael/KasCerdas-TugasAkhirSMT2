function TransactionCard({ transaction }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-slate-900">{transaction.title}</p>
          <p className="text-sm text-slate-500">{transaction.category} • {transaction.wallet}</p>
        </div>
        <span className={`rounded-2xl px-3 py-1 text-sm font-semibold ${transaction.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-semibold text-slate-900">Rp {transaction.amount.toLocaleString('id-ID')}</p>
        <p className="text-sm text-slate-500">{transaction.date} • {transaction.note}</p>
      </div>
    </div>
  )
}

export default TransactionCard
