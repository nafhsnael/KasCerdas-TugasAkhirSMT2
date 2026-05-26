function InvoiceModal({ isOpen, transaction, onClose }) {
  if (!isOpen || !transaction) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-lg">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Detail Invoice</h2>
            <p className="text-sm text-slate-500">{transaction.invoice}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 px-6 py-6">
          {/* Informasi Transaksi */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
              Informasi Transaksi
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-600">Judul</p>
                <p className="text-sm font-semibold text-slate-900">{transaction.title}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-600">Kategori</p>
                <p className="text-sm font-semibold text-slate-900">{transaction.category}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-600">Tanggal</p>
                <p className="text-sm font-semibold text-slate-900">
                  {(() => {
                    const d = transaction.date
                    if (!d) return '-'

                    // Backend bisa mengirim format ISO date-time: 2026-05-26T00:00:00.000000Z
                    // UI cukup menampilkan tanggal: 2026-05-26
                    if (typeof d === 'string' && d.includes('T')) return d.slice(0, 10)
                    return d
                  })()}
                </p>
              </div>


              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-600">Jumlah</p>
                <p className="text-sm font-semibold text-slate-900">
                  Rp {transaction.amount.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          {/* Catatan */}
          {transaction.note && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
                Catatan
              </h3>
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                {transaction.note}
              </p>
            </div>
          )}

          {/* Detail Stok (khusus kategori beli bahan baku/stok) */}
          {(transaction.businessCategory === 'Beli Bahan Baku / Stok' || transaction.category === 'Beli Bahan Baku / Stok') && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
              
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-600">Item</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {transaction.stockItemName || transaction.stockItemId || '-'}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-600">Kuantitas</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {transaction.stockQty ?? '-'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bukti Nota */}
          {transaction.receipt && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
                Bukti Nota
              </h3>
              <div className="rounded-2xl bg-slate-50 p-4">
                {transaction.receipt.type.startsWith('image/') ? (
                  <img
                    src={transaction.receipt.url}
                    alt="Bukti Nota"
                    className="max-h-96 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-8 w-8 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{transaction.receipt.name}</p>
                      <p className="text-xs text-slate-500">File PDF</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-3xl bg-[#38ADA9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2c8a7d]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

export default InvoiceModal
