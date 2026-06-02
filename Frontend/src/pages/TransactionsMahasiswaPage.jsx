import { useEffect, useMemo, useState } from 'react'
import TransactionCard from '../components/TransactionCard'
import InvoiceModal from '../components/InvoiceModal'
import CustomModal from '../components/CustomModal'

import { transactionAPI } from '../utils/api'


const incomeCategories = [
  'Beasiswa',
  'Tabungan',
  'Uang Saku',
  'Penghasilan Kerja Paruh Waktu',
]

const categories = [
  // Pemasukan
  'Beasiswa',
  'Tabungan',
  'Uang Saku',
  'Penghasilan Kerja Paruh Waktu',
  // Pengeluaran
  'Kos',
  'UKT',
  'Makan',
  'Hutang',
  'Transportasi',
  'Kebutuhan Kuliah',
  'Kebutuhan Lainnya',
]

function TransactionsMahasiswaPage({
  transactions,
  filters,
  setFilters,
  onAddTransaction,
  defaultCategory,
  onNavigateToReports,
}) {
  const [deletingId, setDeletingId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
  })

  const showAlert = (message, title = 'Pemberitahuan') => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type: 'info',
      onConfirm: null,
    })
  }

  const showDangerConfirm = (message, onConfirm, title = 'Konfirmasi Hapus') => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type: 'danger',
      onConfirm,
    })
  }

  const deleteTransaction = (transaction) => {
    if (!transaction?.id) {
      showAlert('Transaksi ini tidak bisa dihapus (data belum tersinkron ke server)', 'Pemberitahuan')
      return
    }

    showDangerConfirm('Apakah Anda yakin ingin menghapus transaksi ini?', async () => {
      try {
        setDeletingId(transaction.id)
        if (!String(transaction.id).startsWith('t')) {
          await transactionAPI.delete(transaction.id)
        }
        window.location.reload()
      } catch (e) {
        showAlert(e?.message || 'Gagal menghapus transaksi', 'Kesalahan')
      } finally {
        setDeletingId(null)
      }
    })
  }

  useEffect(() => {
    if (defaultCategory && filters?.type !== defaultCategory) {
      setFilters((prev) => ({ ...prev, type: defaultCategory }))
    }
  }, [defaultCategory, filters?.type, setFilters])

  useEffect(() => {
    if (filters?.type && filters.type !== 'all' && categories.includes(filters.type)) {
      setForm((prev) => ({ ...prev, category: filters.type }))
    }
  }, [filters?.type])

  useEffect(() => {
    const handler = (e) => {
      const detail = e?.detail
      if (typeof detail === 'string' && detail.trim()) {
        setSearchQuery(detail)
        return
      }

      if (!detail || typeof detail !== 'object') return

      const { category, type } = detail
      if (!category || typeof category !== 'string') return

      const safeType = type === 'income' ? 'income' : 'expense'
      setForm((prev) => ({ ...prev, type: safeType, category }))
      setSearchQuery(category)
      setSelectedMonth('')
    }

    window.addEventListener('quickActionCategory', handler)
    return () => window.removeEventListener('quickActionCategory', handler)
  }, [])

  const incomeCategories = ['Beasiswa', 'Tabungan', 'Uang Saku', 'Penghasilan Kerja Paruh Waktu']
  const expenseCategories = ['Kos', 'UKT', 'Makan', 'Hutang', 'Transportasi', 'Kebutuhan Kuliah', 'Kebutuhan Lainnya']

  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Makan',
    date: '',
    note: '',
    type: 'expense',
    receipt: null,
    isSettled: false,
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const visibleTransactions = useMemo(() => {
    let filtered = transactions || []

    if (filters.type !== 'all') {
      filtered = filtered.filter((item) => item.category === filters.type)
    }

    if (selectedMonth) {
      filtered = filtered.filter((item) => item.date.startsWith(selectedMonth))
    }

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
    if (field === 'type') {
      const nextCategory = value === 'income' ? incomeCategories[0] : expenseCategories[0]
      return setForm((prev) => ({
        ...prev,
        type: value,
        category: nextCategory,
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
      showAlert('Format file harus JPG, JPEG, PNG, atau PDF', 'Format Tidak Didukung')
      e.target.value = ''
      setForm((prev) => ({ ...prev, receipt: null }))
      return
    }

    if (file.size > maxSize) {
      showAlert('Ukuran file maksimal 5MB', 'Ukuran Terlalu Besar')
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

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.title || !form.amount || !form.date) {
      showAlert('Mohon isi semua field yang wajib (Judul, Jumlah, Tanggal)', 'Validasi Gagal')
      return
    }

    const newTransaction = {
      title: form.title,
      amount: parseInt(form.amount, 10),
      category: form.category,
      date: form.date,
      note: form.note,
      type: incomeCategories.includes(form.category) ? 'income' : 'expense',
      invoice: generateInvoiceNumber(transactions || [], form.date),
      receipt: form.receipt,
      wallet: 'Mahasiswa',
      isSettled: form.isSettled,
    }

    onAddTransaction(newTransaction)
    setSuccessMessage('Transaksi mahasiswa berhasil ditambahkan!')
    setTimeout(() => setSuccessMessage(''), 3000)
    setForm({
      title: '',
      amount: '',
      category: 'Makan',
      date: '',
      note: '',
      type: 'expense',
      receipt: null,
      isSettled: false,
    })
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <section className="bg-white rounded-[32px] border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-50">
          <div>
            <span className="text-sm uppercase tracking-widest font-normal text-slate-400/90">TRANSAKSI MAHASISWA</span>
            <h3 className="text-lg font-bold text-gray-800 mt-1">Kelola Pengeluaran Kos, Tagihan, dan Pemasukan Studi</h3>
            <p className="mt-1 text-xs text-gray-400">
              Rekam pemasukan dari uang saku, beasiswa, dan penghasilan kerja paruh waktu serta pengeluaran untuk UKT, kebutuhan kuliah, makan, dan lainnya.
            </p>
          </div>
          <div className="bg-gray-100/80 p-1 rounded-xl flex items-center w-fit self-start shrink-0">
            <button
              type="button"
              onClick={() => handleChange('type', 'expense')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${form.type === 'expense' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => handleChange('type', 'income')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${form.type === 'income' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Pemasukan
            </button>
          </div>
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
              placeholder="Contoh: Makan siang"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-normal text-slate-700">Jumlah Uang</label>
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
            <label className="text-xs font-bold uppercase tracking-normal text-slate-700">Kategori</label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full h-11 px-4 bg-gray-50/60 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 focus:bg-white transition-all duration-200 text-gray-700 cursor-pointer"
            >
              {(form.type === 'income' ? incomeCategories : expenseCategories).map((category) => (
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

          <div className="lg:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-normal text-slate-700">Catatan</label>
            <textarea
              value={form.note}
              rows="3"
              className="w-full p-4 bg-gray-50/60 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 focus:bg-white transition-all duration-200 text-gray-700"
              placeholder="Contoh: Makan siang di kantin kampus"
              onChange={(e) => handleChange('note', e.target.value)}
            />
          </div>

          {form.category !== 'Uang Saku' && form.category !== 'Beasiswa' && form.category !== 'Penghasilan Kerja Paruh Waktu' && form.category !== 'Tabungan' && (
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
            <button className="w-full py-3 bg-[#38ADA9] hover:bg-[#2c8a7d] text-white font-semibold rounded-xl text-sm shadow-sm shadow-[#38ADA9]/10 hover:shadow-md hover:shadow-[#38ADA9]/20 transition-all duration-300 hover:scale-105 active:scale-95 transform">
              Simpan Transaksi
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[32px] border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Riwayat Transaksi Mahasiswa</p>
            <h2 className="text-xl font-semibold text-slate-900">Daftar terbaru</h2>
          </div>
          <span className="rounded-2xl bg-slate-100 px-3 py-1 text-sm text-slate-600">{visibleTransactions.length} transaksi</span>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide">Cari Kategori</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ type: e.target.value })}
              className="w-full h-11 px-4 rounded-xl border border-gray-200/80 bg-white text-slate-900 focus:border-[#38ADA9] focus:ring-4 focus:ring-[#38ADA9]/10 focus:outline-none transition-all duration-200 cursor-pointer text-sm font-medium"
            >
              <option value="all">Semua</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
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
                placeholder="Cari judul, kategori, catatan..."
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

        {/* Connection buttons to Reports page */}
        {(filters.type === 'Tabungan' || filters.type === 'Hutang') && (
          <div className="mb-6 rounded-2xl border border-[#38ADA9] bg-blue-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {filters.type === 'Tabungan' ? 'Lihat detail tabungan Anda' : 'Lihat rekap hutang Anda'}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {filters.type === 'Tabungan'
                    ? 'Periksa target tabungan dan progress di halaman laporan'
                    : 'Periksa daftar lengkap hutang di halaman laporan'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToReports && onNavigateToReports(filters.type === 'Tabungan' ? 'savings' : 'debt')}
                className="whitespace-nowrap rounded-3xl bg-[#38ADA9] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2c8a7d]"
              >
                Lihat di Laporan
              </button>
            </div>
          </div>
        )}

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

      <CustomModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}

export default TransactionsMahasiswaPage
