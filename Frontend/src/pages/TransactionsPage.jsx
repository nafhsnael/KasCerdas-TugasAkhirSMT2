import { useMemo, useState } from 'react'
import TransactionCard from '../components/TransactionCard'
import InvoiceModal from '../components/InvoiceModal'

const defaultCategories = ['Makan', 'Hutang','Transport', 'Belanja', 'Tagihan', 'Kebutuhan Lainnya']


function TransactionsPage({
  transactions,
  filters,
  setFilters,
  onAddTransaction,
  categories: categoriesProp,
}) {
  const categories = categoriesProp && categoriesProp.length ? categoriesProp : defaultCategories

  const initialCategory = categories.includes('Makan') ? 'Makan' : categories[0]

  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: initialCategory,
    date: '',
    note: '',
    type: 'expense',
    receipt: null,
  })

  const mahasiswaIncomeCategories = ['Uang Saku/Kiriman', 'Beasiswa', 'Penghasilan Kerja Paruh Waktu']
  const mahasiswaExpenseCategories = ['UKT', 'Buku/Alat Tulis', 'Makan','Hutang', 'Kos', 'Transportasi']

  const inferredTypeFromCategory = (category) => {
    if (mahasiswaIncomeCategories.includes(category)) return 'income'
    if (mahasiswaExpenseCategories.includes(category)) return 'expense'
    return form.type
  }
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const visibleTransactions = useMemo(() => {
    let filtered = transactions
    
    // Filter berdasarkan tipe transaksi
    if (filters.type !== 'all') {
      filtered = filtered.filter((item) => item.type === filters.type)
    }

    // Filter berdasarkan kategori
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter((item) => item.category === filters.category)
    }
    
    // Filter berdasarkan bulan
    if (selectedMonth) {
      filtered = filtered.filter((item) => item.date.startsWith(selectedMonth))
    }
    
    // Filter berdasarkan search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((item) => 
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.note.toLowerCase().includes(query) ||
        (item.invoice && item.invoice.toLowerCase().includes(query))
      )
    }
    
    return filtered
  }, [filters.type, transactions, searchQuery, selectedMonth])

  const handleChange = (field, value) => {
    if (field === 'category') {
      const nextType = inferredTypeFromCategory(value)
      setForm((prev) => ({ ...prev, category: value, type: nextType }))
      return
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

  const handleViewInvoice = (transaction) => {
    setSelectedInvoice(transaction)
    setIsInvoiceModalOpen(true)
  }

  const handleCloseInvoiceModal = () => {
    setIsInvoiceModalOpen(false)
    setSelectedInvoice(null)
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

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.title || !form.amount || !form.date) {
      alert('Mohon isi semua field yang wajib (Judul, Jumlah, Tanggal)')
      return
    }
    const newTransaction = {
      title: form.title,
      amount: parseInt(form.amount),
      category: form.category,
      date: form.date,
      note: form.note,
      type: form.type,
      invoice: generateInvoiceNumber(transactions, form.date),
      receipt: form.receipt,
    }
    onAddTransaction(newTransaction)
    alert('Transaksi baru berhasil ditambahkan!')
    setForm({ title: '', amount: '', category: 'Makan', date: '', note: '', type: 'expense', receipt: null })
  }

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="mb-6 pb-6 border-b border-gray-50">
          <span className="text-sm uppercase tracking-widest font-normal text-slate-400/90">TAMBAH TRANSAKSI</span>
          <h3 className="text-lg font-bold text-gray-800 mt-1">Input data transaksi</h3>
          <p className="mt-1 text-xs text-gray-400">
            Rekam data pemasukan dan pengeluaran keuangan secara teratur di sini.
          </p>
        </div>

        <form className="grid gap-5 lg:grid-cols-2" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-normal text-slate-700 block">Judul Transaksi</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              className="w-full h-11 px-4 bg-gray-50/60 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 focus:bg-white transition-all duration-200 text-gray-700 placeholder-gray-400"
              placeholder="Contoh: Makan siang"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-normal text-slate-700 block">Jumlah Uang</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-sm font-medium text-gray-400">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={form.amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') || ''}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '')
                  handleChange('amount', raw)
                }}
                required
                className="w-full h-11 pl-10 pr-4 bg-gray-50/60 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 focus:bg-white transition-all duration-200 font-medium text-gray-700"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-normal text-slate-700 block">Kategori</label>
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
            <label className="text-xs font-bold uppercase tracking-normal text-slate-700 block">Tanggal</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
              className="w-full h-11 px-4 bg-gray-50/60 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 focus:bg-white transition-all duration-200 text-gray-700"
            />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-normal text-slate-700 block">Catatan</label>
            <textarea
              value={form.note}
              onChange={(e) => handleChange('note', e.target.value)}
              rows="3"
              className="w-full p-4 bg-gray-50/60 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 focus:bg-white transition-all duration-200 text-gray-700"
              placeholder="Contoh: Makan siang di kantor"
            />
          </div>
          {form.type === 'expense' && (
            <div className="lg:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-normal text-slate-700 block">Upload Bukti Nota</label>
              <label className="border-2 border-dashed border-gray-200/80 hover:border-[#38ADA9]/80 bg-gray-50/30 rounded-xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1 group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-[#38ADA9] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
                <span className="text-xs text-gray-400 mt-1 font-medium">
                  {form.receipt ? `✓ ${form.receipt.name}` : 'Klik atau seret file ke sini untuk upload nota'}
                </span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  onChange={handleReceiptChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
          <div className="lg:col-span-2">
            <button
              type="submit"
              className="w-full py-3 bg-[#38ADA9] hover:bg-[#2c8a7d] text-white font-semibold rounded-xl text-sm shadow-sm shadow-[#38ADA9]/10 hover:shadow-md hover:shadow-[#38ADA9]/20 transition-all duration-200 transform active:scale-[0.99]"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Riwayat Transaksi</p>
            <h2 className="text-xl font-semibold text-slate-900">Daftar terbaru</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`rounded-3xl px-4 py-2 text-sm transition ${filters.type === 'all' ? 'bg-[#38ADA9] text-white' : 'bg-slate-100 text-slate-700'}`}
              onClick={() => setFilters({ type: 'all' })}
            >
              Semua
            </button>
            <button
              className={`rounded-3xl px-4 py-2 text-sm transition ${filters.type === 'income' ? 'bg-[#38ADA9] text-white' : 'bg-slate-100 text-slate-700'}`}
              onClick={() => setFilters({ type: 'income' })}
            >
              Pemasukan
            </button>
            <button
              className={`rounded-3xl px-4 py-2 text-sm transition ${filters.type === 'expense' ? 'bg-[#38ADA9] text-white' : 'bg-slate-100 text-slate-700'}`}
              onClick={() => setFilters({ type: 'expense' })}
            >
              Pengeluaran
            </button>
          </div>
          <span className="rounded-2xl bg-slate-100 px-3 py-1 text-sm text-slate-600">{visibleTransactions.length} transaksi</span>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
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
                placeholder="Cari judul, catatan, atau invoice..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200/80 bg-white text-slate-900 focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 focus:outline-none transition-all duration-200 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide">Filter Kategori</label>
            <select
              value={filters.category || 'all'}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full h-11 px-4 rounded-xl border border-gray-200/80 bg-white text-slate-900 focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 focus:outline-none transition-all duration-200 cursor-pointer text-sm font-medium"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide">Filter Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200/80 bg-white text-slate-900 focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 focus:outline-none transition-all duration-200 cursor-pointer text-sm font-medium"
            >
              <option value="">Semua Bulan</option>
              <option value="2026-01">Januari 2026</option>
              <option value="2026-02">Februari 2026</option>
              <option value="2026-03">Maret 2026</option>
              <option value="2026-04">April 2026</option>
              <option value="2026-05">Mei 2026</option>
              <option value="2026-06">Juni 2026</option>
              <option value="2026-07">Juli 2026</option>
              <option value="2026-08">Agustus 2026</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-10">Oktober 2026</option>
              <option value="2026-11">November 2026</option>
              <option value="2026-12">Desember 2026</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {visibleTransactions.length > 0 ? (
            visibleTransactions.map((trx) => (
              <TransactionCard key={trx.id} transaction={trx} onViewInvoice={handleViewInvoice} />
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-slate-500">Tidak ada transaksi yang cocok dengan pencarian.</p>
            </div>
          )}
        </div>
      </section>

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        transaction={selectedInvoice}
        onClose={handleCloseInvoiceModal}
      />
    </div>
  )
}

export default TransactionsPage
