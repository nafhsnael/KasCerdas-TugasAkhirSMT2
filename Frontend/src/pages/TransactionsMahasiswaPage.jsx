import { useEffect, useMemo, useState } from 'react'
import TransactionCard from '../components/TransactionCard'
import InvoiceModal from '../components/InvoiceModal'

import { transactionAPI } from '../utils/api'


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
}) {
  const [deletingId, setDeletingId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

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

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.title || !form.amount || !form.date) {
      alert('Mohon isi semua field yang wajib (Judul, Jumlah, Tanggal)')
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
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Transaksi Mahasiswa</p>
            <h2 className="text-xl font-semibold text-slate-900">Kelola pengeluaran kos, tagihan, dan pemasukan studi</h2>
            <p className="mt-2 text-sm text-slate-500">
              Rekam pemasukan dari uang saku, beasiswa, dan penghasilan kerja paruh waktu serta pengeluaran untuk UKT, kebutuhan kuliah, makan, dan lainnya.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-sm font-medium text-slate-700"></p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleChange('type', 'income')}
                className={`rounded-3xl px-4 py-3 text-sm font-semibold transition ${form.type === 'income' ? 'bg-[#38ADA9] text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Pemasukan
              </button>
              <button
                type="button"
                onClick={() => handleChange('type', 'expense')}
                className={`rounded-3xl px-4 py-3 text-sm font-semibold transition ${form.type === 'expense' ? 'bg-[#38ADA9] text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Pengeluaran
              </button>
            </div>
          </div>
        </div>

        <form className="grid gap-5 lg:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Judul Transaksi</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
              placeholder="Contoh: Makan siang"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Jumlah (Rp)</label>
            <input
              type="number"
              inputMode="numeric"
              value={form.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              required
              // hilangkan spinner ▲▼ agar tidak mengganggu tampilan
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0"
            />
          </div>


          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Kategori</label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
            >
              {(form.type === 'income' ? incomeCategories : expenseCategories).map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Tanggal</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Catatan</label>
            <textarea
              value={form.note}
              rows="3"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
              placeholder="Contoh: Makan siang di kantin kampus"
              onChange={(e) => handleChange('note', e.target.value)}
            />
            {form.category === 'Hutang' && (
              <div className="mt-3 flex items-center gap-3">
                <input
                  id="isSettled"
                  type="checkbox"
                  checked={form.isSettled}
                  onChange={(e) => handleChange('isSettled', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#38ADA9] focus:ring-[#38ADA9]"
                />
                <label htmlFor="isSettled" className="text-sm text-slate-700">
                  Tandai Sudah dibayar / dilunasi
                </label>
              </div>
            )}
          </div>

          {form.category !== 'Uang Saku' && form.category !== 'Beasiswa' && form.category !== 'Penghasilan Kerja Paruh Waktu' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Upload Bukti Nota</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                onChange={handleReceiptChange}
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-700"
              />
              {form.receipt && (
                <p className="mt-2 text-sm text-emerald-600">✓ {form.receipt.name}</p>
              )}
            </div>
          )}

          <div className="lg:col-span-2">
            {successMessage && (
              <div className="mb-4 rounded-3xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm font-medium flex items-center gap-2 transition-all duration-300">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}
            <button className="w-full rounded-3xl bg-[#38ADA9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2c8a7d]">
              Simpan Transaksi
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Riwayat Transaksi Mahasiswa</p>
            <h2 className="text-xl font-semibold text-slate-900">Daftar terbaru</h2>
          </div>
          <span className="rounded-2xl bg-slate-100 px-3 py-1 text-sm text-slate-600">{visibleTransactions.length} transaksi</span>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Cari Kategori</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ type: e.target.value })}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
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
            <label className="mb-2 block text-sm font-medium text-slate-700">Cari Transaksi</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul, kategori, catatan..."
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Filter Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
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

export default TransactionsMahasiswaPage
