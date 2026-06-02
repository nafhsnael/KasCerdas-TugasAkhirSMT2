import { useState } from 'react'
import BudgetCard from '../components/BudgetCard'
import CustomModal from '../components/CustomModal'

function BudgetPage({ transactions, budgets, setBudgets, userType }) {
  const [formData, setFormData] = useState({
    category: '', // kategori (dropdown)
    operationalDetail: '', // kebutuhan operasional (manual, opsional)
    limit: '',
  })
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const isMasyarakatUser = userType === 'masyarakat_umum' || userType === 'masyarakat'

  // debug (temporer)
  const debugLog = (...args) => console.log('[BudgetPage]', ...args)

  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
  })

  const showDangerConfirm = (message, onConfirm, title = 'Konfirmasi Hapus') => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type: 'danger',
      onConfirm,
    })
  }

  // Calculate actual usage from transactions for current month
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const getActualUsage = (category) => {
    return transactions
      .filter((t) => {
        const date = new Date(t.date)

        // Parse budget category to extract main category and the 'Jenis kebutuhan' sub-detail
        const budgetParts = String(category || '').split(' - ')
        const budgetMainCat = String(budgetParts[0] || '').toLowerCase().trim()
        const budgetSubDetail = budgetParts[1] ? String(budgetParts[1]).toLowerCase().trim() : ''

        const tType = String(t.type || '').toLowerCase().trim()
        const tCategory = String(t.kategori || t.category || '').toLowerCase().trim()
        const tTitle = String(t.judul || t.title || '').toLowerCase().trim()

        const isKebutuhanLainnya = budgetMainCat === 'kebutuhan lainnya'

        const targetMonth = selectedMonth !== '' ? Number(selectedMonth) - 1 : currentMonth

        if (isKebutuhanLainnya) {
          return (
            tType === 'expense' &&
            tCategory === 'kebutuhan lainnya' &&
            tTitle === budgetSubDetail &&
            date.getMonth() === targetMonth &&
            date.getFullYear() === currentYear
          )
        }

        return (
          tType === 'expense' &&
          tCategory === String(category).toLowerCase().trim() &&
          date.getMonth() === targetMonth &&
          date.getFullYear() === currentYear
        )
      })
      .reduce((sum, t) => sum + Number(t.jumlah_uang || t.amount || 0), 0)
  }

  const handleAddBudget = () => {
    setEditingId(null)
    setFormData({ category: '', operationalDetail: '', limit: '' })
    setShowForm(true)
  }

  const handleEditBudget = (budget) => {
    // For masyarakat_umum dan mahasiswa, try to split the category
    let categoryName = budget.category
    let categoryDetail = ''

    if (isMasyarakatUser) {
      const [mainCategory, ...rest] = budget.category.split(' - ')
      categoryName = mainCategory
      categoryDetail = rest.join(' - ')
    } else if (userType === 'mahasiswa') {
      const [mainCategory, ...rest] = budget.category.split(' - ')
      categoryName = mainCategory
      categoryDetail = rest.join(' - ')
    } else if (userType === 'umkm') {
      const [mainCategory, ...rest] = budget.category.split(' - ')
      categoryName = mainCategory
      categoryDetail = rest.join(' - ')
    }

    setEditingId(budget.id)
    setFormData({
      category: categoryName || '',
      operationalDetail: categoryDetail || '',
      limit: budget.limit.toString(),
    })
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const selectedOperationalCategory = formData.category

    const requiresOperationalDetail = (userType === 'mahasiswa' || isMasyarakatUser) && selectedOperationalCategory === 'Kebutuhan Lainnya'

    // Untuk "Kebutuhan Lainnya" di Mahasiswa atau Masyarakat, detail harus diisi
    if (requiresOperationalDetail && !formData.operationalDetail.trim()) {
      setMessage('Silakan jelaskan kebutuhan Anda')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    const isKategoriTanpaDetail = [
      'Beli Bahan Baku / Stok',
      'Utang Supplier',
      'Hutang Supplier',
      'Makan',
      'Hutang',
      'Transport',
      'Belanja',
      'Tagihan',
      'Transportasi',
      'Kebutuhan Kuliah',
    ].includes(selectedOperationalCategory)

    const operationalDetail = requiresOperationalDetail
      ? formData.operationalDetail.trim()
      : ''

    if (!selectedOperationalCategory || !formData.limit) {
      setMessage('Silakan isi kategori dan limit')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    const limit = parseInt(formData.limit)
    if (Number.isNaN(limit) || limit <= 0) {
      setMessage('Limit harus lebih dari 0')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    // Simpan format kategori agar konsisten dengan TransactionsMasyarakatPage.jsx.
    // Untuk Masyarakat, nama budget harus sama persis dengan kategori transaksi
    // supaya usage dan budget reminder bisa terbaca.
    let categoryName
    if ((userType === 'mahasiswa' || isMasyarakatUser) && selectedOperationalCategory === 'Kebutuhan Lainnya') {
      categoryName = operationalDetail
        ? `Kebutuhan Lainnya - ${operationalDetail}`
        : 'Kebutuhan Lainnya'
    } else {
      categoryName = selectedOperationalCategory
    }

    if (editingId) {
      // Edit existing budget
      setBudgets((currentBudgets) =>
        currentBudgets.map((b) =>
          b.id === editingId
            ? {
              ...b,
              category: categoryName,
              limit: limit,
            }
            : b
        )
      )
      setMessage('Budget berhasil diperbarui!')
    } else {
      // Add new budget
      // update state budgets harus benar-benar menambah item baru
      const newBudget = {
        id: Math.max(0, ...budgets.map((b) => b.id)) + 1,
        category: categoryName,
        limit: limit,
        usage: 0,
      }

      setBudgets((currentBudgets) => {
        // pastikan id unik meski ada race condition
        const nextId = Math.max(0, ...currentBudgets.map((b) => b.id)) + 1
        return [
          ...currentBudgets,
          {
            ...newBudget,
            id: nextId,
          },
        ]
      })
      setMessage('Budget berhasil ditambahkan!')
    }

    setTimeout(() => setMessage(''), 3000)
    setShowForm(false)
    setFormData({ category: '', operationalDetail: '', limit: '' })
  }

  const handleDeleteBudget = (id) => {
    showDangerConfirm('Apakah Anda yakin ingin menghapus budget ini?', () => {
      setBudgets((currentBudgets) => currentBudgets.filter((b) => b.id !== id))
      setMessage('Budget berhasil dihapus!')
      setTimeout(() => setMessage(''), 3000)
    })
  }

  const handleCancel = () => {
    setShowForm(false)
    setFormData({ category: '', operationalDetail: '', limit: '' })
    setEditingId(null)
  }

  // Get category options based on user type
  const getCategoryOptions = () => {
    if (isMasyarakatUser) {
      // Disamakan dengan kategori di TransactionsMasyarakatPage.jsx
      return [
        { value: 'Makan', label: 'Makan' },
        { value: 'Hutang', label: 'Hutang' },
        { value: 'Transport', label: 'Transport' },
        { value: 'Belanja', label: 'Belanja' },
        { value: 'Tagihan', label: 'Tagihan' },
        { value: 'Kebutuhan Lainnya', label: 'Kebutuhan Lainnya' },
      ]
    } else if (userType === 'umkm') {
      return [
        { value: 'Pengeluaran Operasional', label: 'Pengeluaran Operasional' },
        { value: 'Beli Bahan Baku / Stok', label: 'Beli Bahan Baku / Stok' },
        { value: 'Hutang Supplier', label: 'Hutang Supplier' },
      ]
    } else if (userType === 'mahasiswa') {
      // Kategori untuk mahasiswa
      return [
        { value: 'Makan', label: 'Makan' },
        { value: 'Transportasi', label: 'Transportasi' },
        { value: 'Kebutuhan Kuliah', label: 'Kebutuhan Kuliah' },
        { value: 'Kebutuhan Lainnya', label: 'Kebutuhan Lainnya' },
      ]
    } else {
      // Default untuk user type lain
      return [
        { value: 'Makan', label: 'Makan' },
        { value: 'Transport', label: 'Transport' },
        { value: 'Hiburan', label: 'Hiburan' },
        { value: 'Belanja', label: 'Belanja' },
      ]
    }
  }

  // Check if custom input is needed
  const shouldShowCustomInput = () => {
    if (userType === 'mahasiswa' || isMasyarakatUser) {
      return formData.category === 'Kebutuhan Lainnya'
    } else if (userType === 'umkm') {
      return !["Beli Bahan Baku / Stok", "Hutang Supplier"].includes(formData.category)
    }
    return false
  }

  // Filter budgets based on searchQuery and selectedMonth
  const filteredBudgets = budgets.filter((b) => {
    const category = String(b.category || b.name || '').toLowerCase()
    const matchesSearch = category.includes(searchQuery.toLowerCase())

    let matchesMonth = true
    if (selectedMonth !== '') {
      const targetMonthPad = String(selectedMonth).padStart(2, '0')
      const budgetPeriod = String(b.period_month || b.periodMonth || b.date || '')
      if (budgetPeriod) {
        matchesMonth = budgetPeriod.includes(`-${targetMonthPad}`)
      } else {
        const currentMonthPad = String(now.getMonth() + 1).padStart(2, '0')
        matchesMonth = targetMonthPad === currentMonthPad
      }
    }

    return matchesSearch && matchesMonth
  })

  // Calculate totals
  const totalBudget = filteredBudgets.reduce((sum, b) => sum + b.limit, 0)
  const totalUsage = filteredBudgets.reduce((sum, b) => {
    const actualUsage = getActualUsage(b.category)
    return sum + actualUsage
  }, 0)
  const totalRemaining = totalBudget - totalUsage
  const totalUsagePercent = totalBudget > 0 ? Math.round((totalUsage / totalBudget) * 100) : 0
  const budgetsExceeded = filteredBudgets.filter((b) => {
    const actualUsage = getActualUsage(b.category)
    return b.limit > 0 ? actualUsage > b.limit : actualUsage > 0
  }).length

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <section className="rounded-[32px] border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Pengaturan Keuangan</p>
        <h1 className="text-3xl font-semibold text-slate-900">Budget</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Kelola budget Anda per kategori untuk mengontrol pengeluaran
        </p>
      </section>

      {/* Summary Cards */}
      <div className="grid gap-4 xl:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300">
          <p className="text-sm uppercase tracking-[0.12em] text-slate-500">Total Budget</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">Rp {totalBudget.toLocaleString('id-ID')}</h3>
          <p className="mt-2 text-xs text-slate-500">{budgets.length} kategori aktif</p>
        </div>

        <div className="rounded-[28px] border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300">
          <p className="text-sm uppercase tracking-[0.12em] text-slate-500">Terpakai</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">Rp {totalUsage.toLocaleString('id-ID')}</h3>
          <p className="mt-2 text-xs text-slate-500">{totalUsagePercent}% dari total</p>
        </div>

        <div className="rounded-[28px] border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300">
          <p className="text-sm uppercase tracking-[0.12em] text-slate-500">Sisa Budget</p>
          <h3 className="mt-2 text-2xl font-semibold text-emerald-600">Rp {totalRemaining.toLocaleString('id-ID')}</h3>
          <p className="mt-2 text-xs text-slate-500">Masih tersedia</p>
        </div>

        <div className={`rounded-[28px] border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 ${budgetsExceeded > 0 ? 'ring-2 ring-rose-300' : ''}`}>
          <p className="text-sm uppercase tracking-[0.12em] text-slate-500">Status</p>
          <h3 className={`mt-2 text-2xl font-semibold ${budgetsExceeded > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {budgetsExceeded > 0 ? `${budgetsExceeded} Terlampaui` : 'Terkontrol'}
          </h3>
          <p className="mt-2 text-xs text-slate-500">{budgets.length - budgetsExceeded} budget normal</p>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`rounded-[20px] p-4 ${message.includes('yakin') ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            {editingId ? 'Edit Budget' : 'Tambah Budget Baru'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Kategori Budget</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value, operationalDetail: '' })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#38ADA9]"
              >
                <option value="" disabled selected hidden>
                  Pilih Kategori
                </option>
                {getCategoryOptions().map((option) => (
                  <option key={option.value} value={option.value} className="text-slate-900">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {(userType === 'mahasiswa' || isMasyarakatUser) && formData.category === 'Kebutuhan Lainnya' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Jenis kebutuhan</label>
                <input
                  type="text"
                  value={formData.operationalDetail || ''}
                  onChange={(e) => setFormData({ ...formData, operationalDetail: e.target.value })}
                  placeholder="Contoh: Perlengkapan, Kesehatan, dll"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38ADA9]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Limit Budget (Rp)</label>
              <input
                type="text"
                value={formData.limit ? Number(String(formData.limit).replace(/\D/g, '')).toLocaleString('id-ID') : ''}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, '');
                  setFormData({ ...formData, limit: rawValue });
                }}
                placeholder="Contoh: 1.000.000"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38ADA9]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-[#38ADA9] px-4 py-2 font-medium text-white hover:bg-[#2e8b87] hover:scale-105 active:scale-95 transition-all duration-300"
              >
                {editingId ? 'Perbarui Budget' : 'Tambah Budget'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-900 hover:bg-slate-300 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={handleAddBudget}
          className="w-full rounded-[28px] border-2 border-dashed border-[#38ADA9] bg-[#38ADA9]/5 px-4 py-4 font-medium text-[#38ADA9] hover:bg-[#38ADA9]/10 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-sm"
        >
          + Tambah Budget Baru
        </button>
      )}

      {/* Budget Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Kategori Budget</h2>

        {/* Search & Month Filter Layout */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5 w-full">
          {/* Bar Pencarian */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kategori budget..."
              className="w-full h-11 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#38ADA9]/20 focus:border-[#38ADA9] transition-all"
            />
          </div>

          {/* Filter Bulan */}
          <div className="relative w-full sm:w-48">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full h-11 appearance-none bg-white border border-slate-200 rounded-xl px-4 pr-10 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#38ADA9]/20 focus:border-[#38ADA9] cursor-pointer transition-all"
            >
              <option value="">Semua Bulan</option>
              <option value="1">Januari 2026</option>
              <option value="2">Februari 2026</option>
              <option value="3">Maret 2026</option>
              <option value="4">April 2026</option>
              <option value="5">Mei 2026</option>
              <option value="6">Juni 2026</option>
              <option value="7">Juli 2026</option>
              <option value="8">Agustus 2026</option>
              <option value="9">September 2026</option>
              <option value="10">Oktober 2026</option>
              <option value="11">November 2026</option>
              <option value="12">Desember 2026</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* List Budget */}
        {filteredBudgets.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
            <p className="text-lg font-medium">Tidak ada budget yang ditemukan</p>
            <p className="mt-2 text-sm text-slate-500">Coba ubah kata kunci pencarian atau filter bulan Anda.</p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredBudgets.map((budget) => {
              const actualUsage = getActualUsage(budget.category)
              return (
                <BudgetCard key={budget.id} category={budget.category} usage={actualUsage} limit={budget.limit}>

                  <button
                    onClick={() => handleEditBudget(budget)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition"
                    title="Edit"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(budget.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-rose-600 hover:bg-rose-100 transition"
                    title="Hapus"
                  >
                    ✕
                  </button>
                </BudgetCard>
              )
            })}
          </div>
        )}
      </div>


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

export default BudgetPage
