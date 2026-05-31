import { useEffect, useMemo, useState } from 'react'

import TransactionCard from '../components/TransactionCard'
import InvoiceModal from '../components/InvoiceModal'

import { transactionAPI } from '../utils/api'


  const categories = [
  'Penjualan',
  'Pemasukan',
  'Tabungan',
  'Pengeluaran Operasional',
  'Beli Bahan Baku / Stok',
  'Piutang Pelanggan',
  'Hutang Supplier',
]


function TransactionsUMKMPage({
  transactions,
  filters,
  setFilters,
  onAddUmkmTransaction,
  umkmSummary,
  defaultCategory,
}) {
  const [deletingId, setDeletingId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [fileInputKey, setFileInputKey] = useState(0)
  const [fieldErrors, setFieldErrors] = useState({})
  const [toastMessage, setToastMessage] = useState('')

  const deleteTransaction = async (transaction) => {
    if (!transaction?.id) {
      alert('Transaksi ini tidak bisa dihapus (data belum tersinkron ke server)')
      return
    }

    const ok = window.confirm('Hapus transaksi ini?')
    if (!ok) return

    try {
      setDeletingId(transaction.id)
      
      // Jika ID diawali dengan 't', ini adalah ID lokal sementara yang belum tersimpan di backend.
      // Kita tidak perlu memanggil API delete di backend.
      if (!String(transaction.id).startsWith('t')) {
        await transactionAPI.delete(transaction.id)
      }
      
      window.location.reload()
    } catch (e) {
      alert(e?.message || 'Gagal menghapus transaksi')
    } finally {
      setDeletingId(null)
    }
  }


  useEffect(() => {
    // Sinkronisasi filter ketika datang dari quick action / defaultCategory
    // Normalisasi agar "Semua" selalu benar-benar menghapus filter.
    if (!defaultCategory) return

    const nextType = defaultCategory === 'all' ? 'all' : defaultCategory
    setFilters((prev) => ({ ...prev, type: nextType }))
  }, [defaultCategory, setFilters])


  useEffect(() => {
    // Pastikan dropdown input "Kategori Bisnis" ikut berubah saat filter dipakai
    if (filters?.type && filters.type !== 'all' && categories.includes(filters.type)) {
      setForm((prev) => ({ ...prev, category: filters.type }))
    }
  }, [filters?.type])


  // Untuk pembelian stok, item harus mengikuti teks yang user tulis.
  // Jangan otomatis memilih stok pertama, supaya input "Sabun" tidak masuk ke stok "minyak".
  const defaultStockItemId = ''

  const [form, setForm] = useState({

    title: '',
    amount: '',
    category: 'Penjualan',
    date: '',
    note: '',
    // Linking stok (khusus kategori beli bahan baku/stok)
    linkedStock: false,
    stockItemId: defaultStockItemId,
    stockQty: '1',
    stockItemSearch: '',
    // Kredit (piutang/hutang)
    isSettled: false,
    receipt: null,
  })



  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const visibleTransactions = useMemo(() => {
    let filtered = transactions

    if (filters.type !== 'all') {
      filtered = filtered.filter((item) => {
        const category = item.businessCategory || item.category

        // Normalisasi agar label filter cocok dengan data transaksi.
        // Berdasarkan perilaku form: kategori UMKM disimpan ke businessCategory.
        if (filters.type === 'Pemasukan') {
          return category === 'Pemasukan'
        }

        if (filters.type === 'Penjualan') {
          return category === 'Penjualan'
        }

        if (filters.type === 'Piutang Pelanggan') {
          return category === 'Piutang Pelanggan'
        }

        if (filters.type === 'Hutang Supplier') {
          return category === 'Hutang Supplier'
        }

        // fallback: match exact
        return category === filters.type
      })
    }


    if (selectedMonth) {
      filtered = filtered.filter((item) => item.date && item.date.startsWith(selectedMonth))
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((item) => {
        const title = (item.title || '').toLowerCase()
        const category = (item.businessCategory || item.category || '').toLowerCase()
        const note = (item.note || '').toLowerCase()
        const invoice = (item.invoice || '').toLowerCase()

        return (
          title.includes(query) ||
          category.includes(query) ||
          note.includes(query) ||
          invoice.includes(query)
        )
      })
    }

    return filtered
  }, [filters.type, transactions, searchQuery, selectedMonth])

  const handleChange = (field, value) => {
    if (field === 'category') {
      // kategori yang butuh linkage stok/hubungan lainnya hanya untuk bisnis tertentu
      const isLinkedCategory = value === 'Penjualan' || value === 'Beli Bahan Baku / Stok' || value === 'Piutang Pelanggan' || value === 'Hutang Supplier'
      const isCreditType = value === 'Piutang Pelanggan' || value === 'Hutang Supplier'

      return setForm((prev) => ({
        ...prev,
        category: value,
        linkedStock: isLinkedCategory,
        isSettled: isCreditType,
        stockItemId: value === 'Beli Bahan Baku / Stok' ? '' : prev.stockItemId,
        stockItemSearch: value === 'Beli Bahan Baku / Stok' ? '' : prev.stockItemSearch,
      }))
    }

    setForm((prev) => ({ ...prev, [field]: value }))
  }



  const handleReceiptChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) {
      setForm((prev) => ({ ...prev, receipt: null }))
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    const maxSize = 5 * 1024 * 1024 // 5MB, sama dengan validasi backend Laravel

    if (!allowedTypes.includes(file.type)) {
      alert('Format file harus JPG, JPEG, PNG, atau PDF')
      e.target.value = ''
      setForm((prev) => ({ ...prev, receipt: null }))
      return
    }

    if (file.size > maxSize) {
      alert('Ukuran file maksimal 5MB')
      e.target.value = ''
      setForm((prev) => ({ ...prev, receipt: null }))
      return
    }

    // Simpan File asli, bukan object/base64, supaya Laravel menerima sebagai file upload.
    setForm((prev) => ({ ...prev, receipt: file }))
  }

  const generateInvoiceNumber = (existingTransactions, date) => {
    const year = date?.slice(0, 4) || new Date().getFullYear().toString()
    const invoiceNumbers = existingTransactions
      .map((item) => item.invoice)
      .filter(Boolean)
      .map((invoice) => {
        const match = invoice.match(/^INV-(\d{4})-(\d{4})$/)
        return match ? { year: match[1], seq: parseInt(match[2], 10) } : null
      })
      .filter(Boolean)

    const sameYearInvoices = invoiceNumbers.filter((item) => item.year === year)
    const nextNumber = sameYearInvoices.length ? Math.max(...sameYearInvoices.map((item) => item.seq)) + 1 : 1
    return `INV-${year}-${String(nextNumber).padStart(4, '0')}`
  }

  const isLinkedStockCategory = form.category === 'Penjualan' || form.category === 'Piutang Pelanggan'
  const isStockPurchaseCategory = form.category === 'Beli Bahan Baku / Stok' || form.category === 'Hutang Supplier'
  const isCreditCategory = form.category === 'Piutang Pelanggan' || form.category === 'Hutang Supplier'

  const handleSubmit = async (event) => {
    event.preventDefault()
    // Reset previous errors
    setFieldErrors({})
    setToastMessage('')

    if (!form.title || !form.amount || !form.date) {
      setToastMessage('Mohon isi semua field yang wajib (Judul, Jumlah, Tanggal)')
      return
    }

    const newTransaction = {
      title: form.title,
      amount: parseInt(form.amount, 10),
      category: form.category,
      date: form.date,
      note: form.note,
      type: ['Penjualan', 'Pemasukan', 'Tabungan', 'Piutang Pelanggan'].includes(form.category) ? 'income' : 'expense',
      invoice: generateInvoiceNumber(transactions || [], form.date),
      receipt: form.receipt,
      isSettled: form.isSettled,
      stockItemId: form.stockItemId || '',
      stockItemName: form.stockItemSearch || '',
      stockQty: form.stockQty || '',
      metadata: {
        is_umkm: true,
        is_mahasiswa: false,
        stockItemId: form.stockItemId || '',
        stockItemName: form.stockItemSearch || '',
        stockQty: form.stockQty || '',
      },
    }

    try {
      await onAddUmkmTransaction(newTransaction)

      setSuccessMessage('Transaksi UMKM berhasil ditambahkan!')
      setTimeout(() => setSuccessMessage(''), 3000)

      setForm({
        title: '',
        amount: '',
        category: 'Penjualan',
        date: '',
        note: '',
        type: 'expense',
        receipt: null,
        isSettled: false,
        linkedStock: false,
        stockItemId: '',
        stockQty: '1',
        stockItemSearch: '',
      })
      setFileInputKey((prev) => prev + 1)
    } catch (e) {
      if (e.responseData && e.responseData.errors) {
        setFieldErrors(e.responseData.errors)
      }
      const msg = e.message || 'Terjadi kesalahan saat menyimpan'
      setToastMessage(msg)
    }
  }

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="mb-6 pb-6 border-b border-gray-50">
          <span className="text-sm uppercase tracking-widest font-normal text-slate-400/90">TRANSAKSI UMKM</span>
          <h3 className="text-lg font-bold text-gray-800 mt-1">Kelola Arus Kas, Stok, dan Kredit Usaha</h3>
          <p className="mt-1 text-xs text-gray-400">
            Rekam penjualan, biaya operasional, pembelian stok, piutang, dan hutang secara terpisah.
          </p>
        </div>

          {toastMessage && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 text-sm font-medium flex items-center gap-2">
              <span>{toastMessage}</span>
            </div>
          )}
        <form className="grid gap-5 lg:grid-cols-2" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-normal text-slate-700">Judul Transaksi</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              className="w-full h-11 px-4 bg-gray-50/60 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 focus:bg-white transition-all duration-200 text-gray-700 placeholder-gray-400"
              placeholder="Contoh: Penjualan brownies"
            />
            {fieldErrors.title && (
              <span className="text-sm text-red-500 mt-1">{Array.isArray(fieldErrors.title) ? fieldErrors.title[0] : fieldErrors.title}</span>
            )}          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-normal text-slate-700">Jumlah Uang</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-sm font-medium text-gray-400">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={form.amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') || ''}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  handleChange('amount', raw);
                }}
                required
                className="w-full h-11 pl-10 pr-4 bg-gray-50/60 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 focus:bg-white transition-all duration-200 font-medium text-gray-700"
                placeholder="0"
              />
            {fieldErrors.amount && (
              <span className="text-sm text-red-500 mt-1">{Array.isArray(fieldErrors.amount) ? fieldErrors.amount[0] : fieldErrors.amount}</span>
            )}            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-normal text-slate-700">Kategori</label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full h-11 px-4 bg-gray-50/60 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 focus:bg-white transition-all duration-200 text-gray-700 cursor-pointer"
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-normal text-slate-700">Tanggal</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
              className="w-full h-11 px-4 bg-gray-50/60 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 focus:bg-white transition-all duration-200 text-gray-700"
            />
          </div>

          {form.category === 'Beli Bahan Baku / Stok' && (
            <div className="lg:col-span-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-normal text-slate-700">Item Stok</label>
                  <input
                    type="text"
                    value={form.stockItemSearch}
                    onChange={(e) => setForm((prev) => ({ ...prev, stockItemSearch: e.target.value }))}
                    placeholder="nama item stok (wajib)"
                    className="w-full h-11 px-4 bg-gray-50/60 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 focus:bg-white transition-all duration-200 text-gray-700"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-normal text-slate-700">Kuantitas</label>
                  <input
                    type="number"
                    min={1}
                    value={form.stockQty}
                    onChange={(e) => handleChange('stockQty', e.target.value)}
                    className="w-full h-11 px-4 bg-gray-50/60 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 focus:bg-white transition-all duration-200 text-gray-700"
                  />
                </div>
              </div>
            </div>
          )}

          {form.category === 'Hutang Supplier' ? (
            <div className="lg:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-normal text-slate-700">Catatan</label>
              <textarea
                value={form.note}
                onChange={(e) => handleChange('note', e.target.value)}
                rows="3"
                className="w-full p-4 bg-gray-50/60 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 focus:bg-white transition-all duration-200 text-gray-700 cursor-not-allowed opacity-60"
                placeholder="Contoh: Lunas hutang supplier bulan ini"
                readOnly
              />
            </div>
          ) : (
            <div className="lg:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-normal text-slate-700">Catatan</label>
              <textarea
                value={form.note}
                onChange={(e) => handleChange('note', e.target.value)}
                rows="3"
                style={{ resize: 'none' }}
                className="w-full p-4 bg-gray-50/60 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 focus:bg-white transition-all duration-200 text-gray-700"
                placeholder="Contoh: Penjualan brownies di toko 1"
              />
            </div>
          )}

          {(form.category === 'Pengeluaran Operasional' || form.category === 'Beli Bahan Baku / Stok') && (
            <div className="lg:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-normal text-slate-700">Upload Bukti Nota</label>
              <label className="border-2 border-dashed border-gray-200/80 hover:border-[#38ADA9]/80 bg-gray-50/30 rounded-xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1 group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-[#38ADA9] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
                <span className="text-xs text-gray-400 mt-1 font-medium">
                  {form.receipt ? `✓ ${form.receipt.name}` : 'Klik atau seret file ke sini untuk upload nota'}
                </span>
                <input
                  key={fileInputKey}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  onChange={handleReceiptChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          <div className="lg:col-span-2">
            {successMessage && (
              <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm font-medium flex items-center gap-2 transition-all duration-300">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}
            <button type="submit" className="w-full py-3 bg-[#38ADA9] hover:bg-[#2c8a7d] text-white font-semibold rounded-xl text-sm shadow-sm shadow-[#38ADA9]/10 hover:shadow-md hover:shadow-[#38ADA9]/20 transition-all duration-200 transform active:scale-[0.99]">
              Simpan Transaksi
            </button>
          </div>

        </form>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Riwayat Transaksi UMKM</p>
            <h2 className="text-xl font-semibold text-slate-900">Catatan bisnis terbaru</h2>
          </div>
          <span className="rounded-2xl bg-slate-100 px-3 py-1 text-sm text-slate-600">{visibleTransactions.length} transaksi</span>
        </div>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
         
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide">Filter Kategori</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ type: e.target.value })}
              className="w-full h-11 px-4 rounded-xl border border-gray-200/80 bg-white text-slate-900 focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 focus:outline-none transition-all duration-200 cursor-pointer text-sm font-medium"
            >
              <option value="all">Semua</option>
              <option value="Penjualan">Penjualan</option>
              <option value="Pemasukan">Pemasukan</option>
              <option value="Tabungan">Tabungan</option>
              <option value="Pengeluaran Operasional">Pengeluaran Operasional</option>
              <option value="Beli Bahan Baku / Stok">Beli Bahan Baku / Stok</option>
              <option value="Piutang Pelanggan">Piutang Pelanggan</option>
              <option value="Hutang Supplier">Hutang Supplier</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide">Cari Transaksi</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul, kategori, catatan, atau invoice..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200/80 bg-white text-slate-900 focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 focus:outline-none transition-all duration-200 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide">Filter Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200/80 bg-white text-slate-900 focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 focus:outline-none transition-all duration-200 cursor-pointer text-sm font-medium"
            >
              <option value="">Semua Bulan</option>
              {Array.from({ length: 12 }, (_, index) => {
                const month = String(index + 1).padStart(2, '0')
                const year = new Date().getFullYear()
                const label = new Date(year, index).toLocaleString('id-ID', { month: 'long', year: 'numeric' })
                return <option key={month} value={`${year}-${month}`}>{label}</option>
              })}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {visibleTransactions.length > 0 ? (
            visibleTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onViewInvoice={(trx) => {
                  setSelectedInvoice(trx)
                  setIsInvoiceModalOpen(true)
                }}
                onDelete={transaction?.id ? deleteTransaction : undefined}
                isDeleting={deletingId === transaction?.id}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-slate-500">Tidak ada transaksi yang cocok dengan filter ini.</p>
            </div>
          )}
        </div>
      </section>

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        transaction={selectedInvoice}
        onClose={() => {
          setIsInvoiceModalOpen(false)
          setSelectedInvoice(null)
        }}
      />
    </div>
  )
}

export default TransactionsUMKMPage
