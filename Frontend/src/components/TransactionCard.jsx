function TransactionCard({ transaction, onViewInvoice, onDelete, isDeleting }) {
  const isPengeluaran = transaction.type === 'expense'
  const nominal = `Rp ${transaction.amount.toLocaleString('id-ID')}`
  const tanggal = transaction.date

  const displayTitle = String(transaction.title || '').trim().toLowerCase() === 'initial balance' || String(transaction.title || '').trim().toLowerCase() === 'initial'
    ? 'Saldo Awal'
    : transaction.title

  const displayCategory = String(transaction.category || '').trim().toLowerCase() === 'initial' || String(transaction.category || '').trim().toLowerCase() === 'initial balance'
    ? 'Saldo Awal'
    : transaction.category

  const cleanNote = String(transaction.note || '').trim()
  const displayNote = cleanNote.toLowerCase() === 'initial' || cleanNote.toLowerCase() === 'initial balance'
    ? 'Saldo Awal'
    : transaction.note

  const noteInfo = displayNote ? ` • ${displayNote}` : ''

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all">
      
      <div className="flex items-center gap-4">
        {/* Indikator Pemasukan / Pengeluaran */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isPengeluaran ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
          {isPengeluaran ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 17l-4 4m0 0l-4-4m4 4V3" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7l4-4m0 0l4 4m-4-4v18" />
            </svg>
          )}
        </div>
        
        {/* Detail Transaksi (Judul & Kategori & Invoice) */}
        <div className="flex flex-col gap-0.5">
          <h4 className="text-sm font-semibold text-slate-800 capitalize">{displayTitle}</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">{displayCategory}</span>
            {transaction.invoice && (
              <span className="text-[10px] font-mono bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100/60 shrink-0">
                {transaction.invoice}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sisi Kanan (Nominal, Tanggal, Aksi) */}
      <div className="flex items-center gap-6">
        <div className="text-right flex flex-col gap-0.5">
          <span className={`text-sm font-bold ${isPengeluaran ? 'text-rose-600' : 'text-emerald-600'}`}>
            {isPengeluaran ? '-' : '+'} {nominal}
          </span>
          <span className="text-xs text-slate-400 max-w-[200px] truncate" title={`${tanggal}${noteInfo}`}>
            {tanggal}{noteInfo}
          </span>
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center gap-2">
          {transaction.invoice && (
            <button
              onClick={() => onViewInvoice?.(transaction)}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 font-medium rounded-lg text-xs transition-all shrink-0"
            >
              Lihat
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(transaction)}
              disabled={isDeleting}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60 shrink-0"
              title={isDeleting ? 'Menghapus...' : 'Hapus transaksi'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransactionCard
