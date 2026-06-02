import { useEffect, useMemo, useState } from 'react'
import TransactionCard from '../components/TransactionCard'
import InvoiceModal from '../components/InvoiceModal'
import CustomModal from '../components/CustomModal'

import { transactionAPI } from '../utils/api'


const incomeCategories = ['Penghasilan Kerja', 'Uang Saku', 'Tabungan']
const expenseCategories = ['Makan', 'Hutang', 'Transport', 'Belanja', 'Tagihan', 'Kebutuhan Lainnya']

function TransactionsPage({ transactions, filters, setFilters, onAddTransaction }) {
  const [deletingId, setDeletingId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [fieldErrors, setFieldErrors] = useState({})
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

  useEffect(() => {
    const handler = (e) => {
      const detail = e?.detail
      // Support legacy: detail is a string (category only)
      if (typeof detail === 'string' && detail.trim()) {
        setSearchQuery(detail)
        return
      }

      if (detail && typeof detail === 'object') {
        const { category, type } = detail

        if (typeof category === 'string' && category.trim()) {
          const safeType = type === 'income' ? 'income' : 'expense'
          setForm((prev) => ({
            ...prev,
            type: safeType,
            category,
          }))
          setSearchQuery(category)
          setSelectedMonth('')
        }
      }
    }

    window.addEventListener('quickActionCategory', handler)
    return () => window.removeEventListener('quickActionCategory', handler)
  }, [])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const visibleTransactions = useMemo(() => {
    let filtered = transactions

    // Filter berdasarkan kategori transaksi
    if (filters.type !== 'all') {
      filtered = filtered.filter((item) => item.category === filters.type)
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
    if (field === 'type') {
      const nextCategory = value === 'income' ? incomeCategories[0] : expenseCategories[0]
      return setForm((prev) => ({
        ...prev,
        type: value,
        category: value === 'income' && incomeCategories.includes(prev.category)
          ? prev.category
          : value === 'expense' && expenseCategories.includes(prev.category)
            ? prev.category
            : nextCategory,
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

  const handleViewInvoice = (transaction) => {
    setSelectedInvoice(transaction)
    setIsInvoiceModalOpen(true)
  }

  const handleCloseInvoiceModal = () => {
    setIsInvoiceModalOpen(false)
    setSelectedInvoice(null)
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    // Reset previous errors
    setFieldErrors({})
    setToastMessage('')

    if (isSaving) return

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
      type: incomeCategories.includes(form.category) ? 'income' : 'expense',
      invoice: generateInvoiceNumber(transactions || [], form.date),
      receipt: form.receipt,
      isSettled: form.isSettled,
      metadata: {
        is_masyarakat: true,
        is_mahasiswa: false,
      },
    }

    try {
      setIsSaving(true)

      // Tunggu sampai App.jsx menambahkan transaksi ke state dan menyimpan ke backend.
      await onAddTransaction(newTransaction)

      // Setelah berhasil, filter diarahkan ke kategori transaksi baru supaya langsung terlihat di riwayat.
      setFilters({ type: form.category })
      setSearchQuery('')
      setSelectedMonth('')

      setSuccessMessage('Transaksi baru berhasil ditambahkan!')
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
      setFileInputKey((prev) => prev + 1)
    } catch (e) {
      if (e.responseData && e.responseData.errors) {
        setFieldErrors(e.responseData.errors)
      }
      const msg = e.message || 'Terjadi kesalahan saat menyimpan'
      setToastMessage(msg)
    } finally {
      setIsSaving(false)
    }
  }

  const quickActionEmoji = (() => {
    const map = {
      Makan: '🍜',
      Hutang: '💳',
      Transport: '🚌',
      Belanja: '🛍️',
      Tagihan: '📄',
      'Kebutuhan Lainnya': '🧩',
    }
    return map[form.category] || ''
  })()

  return (
    <div className="space-y-8 animate-fade-in-up">
      <section className="bg-white rounded-[32px] border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-50">
          <div>
            <span className="text-sm uppercase tracking-widest font-normal text-slate-400/90">TRANSAKSI MASYARAKAT</span>
            <h3 className="text-lg font-bold text-gray-800 mt-1">Kelola Pengeluaran dan Pemasukan</h3>
            <p className="mt-1 text-xs text-gray-400">
              Rekam pemasukan dari uang saku dan penghasilan kerja, kebutuhan sehari-hari, dan lainnya.
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
            {fieldErrors.title && (
              <span className="text-sm text-red-500 mt-1">{Array.isArray(fieldErrors.title) ? fieldErrors.title[0] : fieldErrors.title}</span>
            )}
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
            {fieldErrors.amount && (
              <span className="text-sm text-red-500 mt-1">{Array.isArray(fieldErrors.amount) ? fieldErrors.amount[0] : fieldErrors.amount}</span>
            )}
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
              placeholder="Contoh: Makan siang di kantor"
              onChange={(e) => handleChange('note', e.target.value)}
            />
          </div>
          {form.type === 'expense' && (
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
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 bg-[#38ADA9] hover:bg-[#2c8a7d] text-white font-semibold rounded-xl text-sm shadow-sm shadow-[#38ADA9]/10 hover:shadow-md hover:shadow-[#38ADA9]/20 transition-all duration-300 hover:scale-105 active:scale-95 transform disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[32px] border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Riwayat Transaksi Masyarakat</p>
            <h2 className="text-xl font-semibold text-slate-900">Daftar terbaru</h2>
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
              <option value="Makan">Makan</option>
              <option value="Hutang">Hutang</option>
              <option value="Transport">Transport</option>
              <option value="Belanja">Belanja</option>
              <option value="Tagihan">Tagihan</option>
              <option value="Kebutuhan Lainnya">Kebutuhan Lainnya</option>
              <option value="Penghasilan Kerja">Penghasilan Kerja</option>
              <option value="Uang Saku">Uang Saku</option>
              <option value="Tabungan">Tabungan</option>
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
              <TransactionCard
                key={trx.id}
                transaction={trx}
                onViewInvoice={handleViewInvoice}
                onDelete={trx?.id ? deleteTransaction : undefined}
                isDeleting={deletingId === trx?.id}
              />
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

export default TransactionsPage