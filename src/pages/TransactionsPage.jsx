import { useMemo, useState } from 'react'
import TransactionCard from '../components/TransactionCard'
import InvoiceModal from '../components/InvoiceModal'

const categories = ['Makan', 'Transport', 'Hiburan', 'Belanja', 'Tagihan']
const bank = ['Cash', 'Ovo', 'Dana', 'Bank']
const wallets = ['UMKM', 'Mahasiswa', 'Masyarakat Luas']

function TransactionsPage({ transactions, filters, setFilters, onAddTransaction }) {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Makan',
    wallet: 'UMKM',
    bank : 'Cash',
    date: '',
    note: '',
    type: 'expense',
    receipt: null,
    invoice: '',
  })
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
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleReceiptChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setForm((prev) => ({
          ...prev,
          receipt: {
            name: file.name,
            type: file.type,
            url: event.target.result,
          },
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleViewInvoice = (transaction) => {
    setSelectedInvoice(transaction)
    setIsInvoiceModalOpen(true)
  }

  const handleCloseInvoiceModal = () => {
    setIsInvoiceModalOpen(false)
    setSelectedInvoice(null)
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
      wallet: form.wallet,
      bank: form.bank,
      date: form.date,
      note: form.note,
      type: form.type,
      invoice: form.invoice,
      receipt: form.receipt,
    }
    onAddTransaction(newTransaction)
    alert('Transaksi baru berhasil ditambahkan!')
    setForm({ title: '', amount: '', category: 'Makan', wallet: 'UMKM', bank: 'Cash', date: '', note: '', type: 'expense', receipt: null, invoice: '' })
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Tambah Transaksi</p>
            <h2 className="text-xl font-semibold text-slate-900">Input data transaksi</h2>
          </div>
          <div className="flex gap-2">
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
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Dompet</label>
            <select
              value={form.wallet}
              onChange={(e) => handleChange('wallet', e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
            >
              {wallets.map((wallet) => (
                <option key={wallet} value={wallet}>{wallet}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Bank</label>
            <select
              value={form.bank}
              onChange={(e) => handleChange('bank', e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
            >
              {bank.map((bank) => (
                <option key={bank} value={bank}>{bank}</option>
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
              onChange={(e) => handleChange('note', e.target.value)}
              rows="3"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
              placeholder="Contoh: Makan siang di kantor"
            />
          </div>
          {form.type === 'expense' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Upload Bukti Nota</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleReceiptChange}
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-700"
              />
              {form.receipt && (
                <p className="mt-2 text-sm text-emerald-600">✓ {form.receipt.name}</p>
              )}
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Nomor Invoice</label>
            <input
              type="text"
              value={form.invoice}
              onChange={(e) => handleChange('invoice', e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
              placeholder="Contoh: INV-2026-001"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Tipe Transaksi</label>
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
          <div className="lg:col-span-2">
            <button className="w-full rounded-3xl bg-[#38ADA9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2c8a7d]">
              Simpan Transaksi
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Riwayat Transaksi</p>
            <h2 className="text-xl font-semibold text-slate-900">Daftar terbaru</h2>
          </div>
          <span className="rounded-2xl bg-slate-100 px-3 py-1 text-sm text-slate-600">{visibleTransactions.length} transaksi</span>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
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
