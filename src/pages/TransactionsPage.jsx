import { useMemo, useState } from 'react'
import TransactionCard from '../components/TransactionCard'

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
  })

  const visibleTransactions = useMemo(() => {
    if (filters.type === 'all') return transactions
    return transactions.filter((item) => item.type === filters.type)
  }, [filters.type, transactions])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
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
    }
    onAddTransaction(newTransaction)
    alert('Transaksi baru berhasil ditambahkan!')
    setForm({ title: '', amount: '', category: 'Makan', wallet: 'UMKM', bank: 'Cash', date: '', note: '', type: 'expense', receipt: null })
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
                onChange={(e) => handleChange('receipt', e.target.files?.[0] || null)}
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-700"
              />
            </div>
          )}
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
        <div className="space-y-4">
          {visibleTransactions.map((trx) => (
            <TransactionCard key={trx.id} transaction={trx} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default TransactionsPage
