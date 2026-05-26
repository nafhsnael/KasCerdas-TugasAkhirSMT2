import { useEffect, useMemo, useState } from 'react'
import TransactionCard from '../components/TransactionCard'
import InvoiceModal from '../components/InvoiceModal'

import { transactionAPI } from '../utils/api'


const incomeCategories = ['Penghasilan Kerja', 'Uang Saku', 'Tabungan']
const expenseCategories = ['Makan', 'Hutang','Transport', 'Belanja', 'Tagihan', 'Kebutuhan Lainnya']

function TransactionsPage({ transactions, filters, setFilters, onAddTransaction }) {
  const [deletingId, setDeletingId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [fileInputKey, setFileInputKey] = useState(0)

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
      const category = e?.detail
      if (typeof category === 'string' && category.trim()) {
        setSearchQuery(category)
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

      // Hapus dari state lokal (UI)
      // Catatan: state ini hanya berisi data transaksi yang dipakai halaman.
      // Di implementasi saat ini transaksi dibuat lokal dengan id t{...},
      // sehingga delete hanya benar-benar tersinkron jika transaksi punya id dari backend.
      // Tetap kita filter untuk respons instan.
      // eslint-disable-next-line no-unused-vars
      // (update transaksi hanya dilakukan oleh parent, tapi parent saat ini menyimpan transaksi lokal)
      // Oleh karena itu, kembalikan perubahan ke UI lewat refresh sederhana: reload halaman.
      window.location.reload()
    } catch (e) {
      alert(e?.message || 'Gagal menghapus transaksi')
    } finally {
      setDeletingId(null)
    }
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

    if (isSaving) return

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
      type: form.type,
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
      // Alert error sudah ditampilkan dari App.jsx agar tidak dobel.
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Transaksi Masyarakat</p>
            <h2 className="text-xl font-semibold text-slate-900">Kelola pengeluaran dan pemasukan</h2>
              <p className="mt-2 text-sm text-slate-500">
            Rekam pemasukan dari uang saku dan penghasilan kerja, kebutuhan sehari-hari, dan lainnya.
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
            <label className="mb-2 block text-sm font-medium text-slate-700">Jumlah Uang</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              required
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
              placeholder="Rp"
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
              placeholder="Contoh: Makan siang di kantor"
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
          {form.type === 'expense' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Upload Bukti Nota</label>
              <input
                key={fileInputKey}
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
            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-3xl bg-[#38ADA9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2c8a7d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Riwayat Transaksi Masyarakat</p>
            <h2 className="text-xl font-semibold text-slate-900">Daftar terbaru</h2>
          </div>
          <span className="rounded-2xl bg-slate-100 px-3 py-1 text-sm text-slate-600">{visibleTransactions.length} transaksi</span>
        </div>
        
        
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div>
           <label className="mb-2 block text-sm font-medium text-slate-700">Filter Kategori</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ type: e.target.value })}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
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
           <label className="mb-2 block text-sm font-medium text-slate-700">Cari Transaksi</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul, kategori, catatan, atau invoice..."
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
    </div>
  )
}

export default TransactionsPage