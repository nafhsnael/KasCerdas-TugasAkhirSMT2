function TransactionCard({ transaction, onViewInvoice, onDelete, isDeleting }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-slate-900">{transaction.title}</p>
          <p className="text-sm text-slate-500">{transaction.category} • {transaction.bank || transaction.wallet || '-'}</p>

        </div>
        <div className="flex items-center gap-3">
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(transaction)}
              disabled={isDeleting}
              className="text-slate-400 transition hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              title={isDeleting ? 'Menghapus...' : 'Hapus transaksi'}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z" />
              </svg>
            </button>
          )}
          <span
            className={`rounded-2xl px-3 py-1 text-sm font-semibold ${transaction.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
          >
            {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
          </span>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-semibold text-slate-900">Rp {transaction.amount.toLocaleString('id-ID')}</p>
        <p className="text-sm text-slate-500">{transaction.date} • {transaction.note}</p>
      </div>
      {transaction.invoice && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Invoice</p>
              <p className="text-sm text-slate-700 mt-1">{transaction.invoice}</p>
            </div>
            <button
              onClick={() => onViewInvoice?.(transaction)}
              className="rounded-2xl bg-[#38ADA9] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#2c8a7d]"
            >
              Lihat
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionCard

