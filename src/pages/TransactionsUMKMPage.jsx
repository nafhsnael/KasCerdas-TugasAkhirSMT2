import { useEffect, useMemo, useState } from 'react'

import TransactionCard from '../components/TransactionCard'
import InvoiceModal from '../components/InvoiceModal'

const categories = [
  'Penjualan',
  'Pemasukan',
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


  const defaultStockItemId = umkmSummary?.inventory?.[0]?.id ?? ''

  // Jika inventory baru ter-load dan form belum punya selected stock, isi otomatis.
  useEffect(() => {
    if (form.category !== 'Beli Bahan Baku / Stok') return
    if (!umkmSummary?.inventory?.length) return

    setForm((prev) => {
      // Kalau stockItemId sudah ada, jangan override.
      if (prev.stockItemId) return prev

      const nextId = umkmSummary.inventory[0]?.id ?? ''
      return {
        ...prev,
        stockItemId: nextId,
        stockItemSearch: '',
        linkedStock: Boolean(nextId),
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [umkmSummary?.inventory])

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
          return category === 'Pemasukan' || category === 'Penjualan'
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
      const isLinkedCategory = value === 'Penjualan' || value === 'Beli Bahan Baku / Stok' || value === 'Piutang Pelanggan' || value === 'Hutang Supplier'
      const isCreditType = value === 'Piutang Pelanggan' || value === 'Hutang Supplier'

      return setForm((prev) => ({
        ...prev,
        category: value,
        linkedStock: isLinkedCategory,
        isSettled: isCreditType,
      }))
    }

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

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.title || !form.amount || !form.date) {
      alert('Mohon isi semua field yang wajib (Judul, Jumlah, Tanggal)')
      return
    }

    const amount = parseInt(form.amount, 10)
    const stockQty = parseInt(form.stockQty, 10) || 1

    // If category is stock purchase, ensure we have a selected stock item.
    // Try to auto-match the typed search to a single inventory item before rejecting.
    let selectedStockId = form.stockItemId
    if (form.category === 'Beli Bahan Baku / Stok') {
      const qRaw = (form.stockItemSearch || '').trim()
      const q = qRaw.toLowerCase()

      if (!selectedStockId && q) {
        const inventory = umkmSummary?.inventory || []

        // First try exact name match (case-insensitive)
        const exact = inventory.find((it) => String(it.name || it.stockItemName || it.id).trim().toLowerCase() === q)
        if (exact) {
          selectedStockId = exact.id
        } else {
          // Fallback to contains match
          const matches = inventory.filter((it) => {
            const label = String(it.name || it.stockItemName || it.id).toLowerCase()
            return label.includes(q)
          })
          if (matches.length === 1) {
            selectedStockId = matches[0].id
          } else if (matches.length > 1) {
            // Prefer item whose name starts with query
            const starts = matches.find((it) => String(it.name || it.stockItemName || it.id).toLowerCase().startsWith(q))
            selectedStockId = (starts && starts.id) || matches[0].id
          }
        }
      }

      // If user typed an id directly, accept it if it exists in inventory
      if (!selectedStockId && form.stockItemSearch) {
        const asId = form.stockItemSearch.trim()
        const foundById = (umkmSummary?.inventory || []).find((it) => String(it.id) === asId)
        if (foundById) selectedStockId = foundById.id
      }

      let createdStockName = null
      if (!selectedStockId) {
        if (form.stockItemSearch && form.stockItemSearch.trim()) {
          // create a temporary new stock id and carry the name to backend handler
          selectedStockId = `new-${Date.now()}`
          createdStockName = form.stockItemSearch.trim()
        } else {
          alert('Mohon isi item stok')
          return
        }
      }

      // pastikan createdStockName terbaca saat membangun newTransaction di scope luar
      // (buat variabel yang sama di scope luar)
      // eslint-disable-next-line no-unused-vars
    }

    // createdStockName hanya relevan untuk kategori beli stok
    // deklarasi di scope luar agar tidak menimbulkan ReferenceError
    let createdStockName = null
    if (form.category === 'Beli Bahan Baku / Stok') {
      const qRaw = (form.stockItemSearch || '').trim()
      // kalau selectedStockId dibuat menjadi new-*, ambil nama dari input
      if (qRaw && (!form.stockItemId || String(form.stockItemId).startsWith('new-'))) {
        createdStockName = qRaw
      }
    }

    const newTransaction = {

      title: form.title,
      amount,
      category: form.category,
      date: form.date,
      note: form.note,



      type:
        form.category === 'Penjualan' ||
        form.category === 'Pemasukan' ||
        form.category === 'Piutang Pelanggan'
          ? 'income'
          : 'expense',
      invoice: generateInvoiceNumber(transactions, form.date),
      receipt: form.receipt,
      businessCategory: form.category,
      linkedStock: form.linkedStock,

      stockItemId: selectedStockId,
      stockItemName: createdStockName,
      stockQty,
      isCredit: isCreditCategory,
      isSettled: form.isSettled,
      typeLabel:
        form.category === 'Penjualan' || form.category === 'Pemasukan' || form.category === 'Piutang Pelanggan'
          ? 'Pemasukan'
          : 'Pengeluaran',
    }

    onAddUmkmTransaction(newTransaction)
    alert('Transaksi UMKM berhasil ditambahkan!')

    setForm({
      title: '',
      amount: '',
      category: 'Penjualan',
      date: '',
      note: '',
      linkedStock: false,
      stockItemId: defaultStockItemId,
      stockItemSearch: '',
      stockQty: '1',
      isSettled: false,
      receipt: null,
    })


  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Transaksi UMKM</p>
          <h2 className="text-xl font-semibold text-slate-900">Kelola arus kas, stok, dan kredit usaha</h2>
          <p className="mt-2 text-sm text-slate-500">
            Rekam penjualan, biaya operasional, pembelian stok, piutang, dan hutang secara terpisah.
          </p>
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
              placeholder="Contoh: Penjualan kue bolu"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Jumlah (Rp)</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              required
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
              placeholder="0"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Kategori </label>
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
            <label className="mb-2 block text-sm font-medium text-slate-700">Tanggal</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
            />
          </div>






          {form.category === 'Beli Bahan Baku / Stok' && (
            <div className="lg:col-span-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Item stok</label>

                  <div className="mt-0 grid grid-cols-1 gap-2">
                    <input
                      type="text"
                      value={form.stockItemSearch}
                      onChange={(e) => setForm((prev) => ({ ...prev, stockItemSearch: e.target.value }))}
                      placeholder="nama item stok (wajib)"
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                    />

                    <div className="mt-2 grid grid-cols-1 gap-2">
                      {(umkmSummary?.inventory || [])
                        .filter((it) => {
                          const label = String(it.name || it.stockItemName || it.id)

                          // Hilangkan bubble/item stok yang muncul tiba-tiba (mis. "gula")
                          if (String(label).trim().toLowerCase() === 'gula') return false

                          const q = (form.stockItemSearch || '').trim().toLowerCase()
                          if (!q) return true

                          return String(label).toLowerCase().includes(q)
                        })
                        .map((it) => {
                          const active = String(it.id) === String(form.stockItemId)

                          return (
                            <button
                              key={it.id}
                              type="button"
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  linkedStock: true,
                                  stockItemId: it.id,
                                }))
                              }}
                              className={
                                `rounded-2xl border px-3 py-2 text-left transition ` +
                                (active
                                  ? 'border-[#38ADA9] bg-[#38ADA9] text-white'
                                  : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300')
                              }
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="text-sm font-semibold">{it.name || it.stockItemName || it.id}</div>
                                <div className="text-right">
                                  {it.qty != null && (
                                    <div className="mt-1 text-xs text-slate-500">Stok: {it.qty}</div>
                                  )}
                                </div>
                              </div>
                            </button>
                          )
                        })}
                    </div>

                  </div>
                </div>

                <div className="">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Kuantitas</label>
                  <input
                    type="number"
                    min={1}
                    value={form.stockQty}
                    onChange={(e) => handleChange('stockQty', e.target.value)}
                    disabled={false}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9] disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          )}


          {form.category === 'Hutang Supplier' ? (
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Catatan</label>
              <textarea
                value={form.note}
                onChange={(e) => handleChange('note', e.target.value)}
                rows="3"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                placeholder="Contoh: Lunas hutang supplier bulan ini"
                readOnly
              />

              {isCreditCategory && (
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
          ) : (
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Catatan</label>
              <textarea
                value={form.note}
                onChange={(e) => handleChange('note', e.target.value)}
                rows="3"
                style={{ resize: 'none' }}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
                placeholder="Contoh: Penjualan kredit pelanggan A"
              />



              {isCreditCategory && (
                <div className="mt-3 flex items-center gap-3">
                  <input
                    id="isSettled"
                    type="checkbox"
                    checked={form.isSettled}
                    onChange={(e) => handleChange('isSettled', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#38ADA9] focus:ring-[#38ADA9]"
                  />
                  <label htmlFor="isSettled" className="text-sm text-slate-700">
                    TandaiSudah dibayar / dilunasi
                  </label>
                </div>
              )}
            </div>
          )}


          {(form.category === 'Pengeluaran Operasional' || form.category === 'Beli Bahan Baku / Stok') && (
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


          <div className="lg:col-span-2">
            <button type="submit" className="w-full rounded-3xl bg-[#38ADA9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2c8a7d]">
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
            <label className="mb-2 block text-sm font-medium text-slate-700">Filter Kategori </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ type: e.target.value })}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-[#38ADA9] focus:ring-2 focus:ring-[#38ADA9]"
            >
              <option value="all">Semua</option>
              <option value="Penjualan">Penjualan</option>
              <option value="Pemasukan">Pemasukan</option>
              <option value="Pengeluaran Operasional">Pengeluaran Operasional</option>
              <option value="Beli Bahan Baku / Stok">Beli Bahan Baku / Stok</option>
              <option value="Piutang Pelanggan">Piutang Pelanggan</option>
              <option value="Hutang Supplier">Hutang Supplier</option>
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
