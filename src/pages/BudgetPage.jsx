import { useState } from 'react'
import BudgetCard from '../components/BudgetCard'

function BudgetPage({ transactions, budgets, setBudgets }) {
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
  })
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const [message, setMessage] = useState('')

  // Calculate actual usage from transactions for current month
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const getActualUsage = (category) => {
    return transactions
      .filter((t) => {
        const date = new Date(t.date)
        return (
          t.type === 'expense' &&
          t.category === category &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        )
      })
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const handleAddBudget = () => {
    setEditingId(null)
    setFormData({ category: '', limit: '' })
    setShowForm(true)
  }

  const handleEditBudget = (budget) => {
    setEditingId(budget.id)
    setFormData({
      category: budget.category,
      limit: budget.limit.toString(),
    })
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.category.trim() || !formData.limit) {
      setMessage('Silakan isi semua field')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    const limit = parseInt(formData.limit)
    if (limit <= 0) {
      setMessage('Limit harus lebih dari 0')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    if (editingId) {
      // Edit existing budget
      setBudgets(
        budgets.map((b) =>
          b.id === editingId
            ? {
                ...b,
                category: formData.category,
                limit: limit,
              }
            : b
        )
      )
      setMessage('Budget berhasil diperbarui!')
    } else {
      // Add new budget
      const newId = Math.max(...budgets.map((b) => b.id), 0) + 1
      setBudgets([
        ...budgets,
        {
          id: newId,
          category: formData.category,
          limit: limit,
          usage: 0,
        },
      ])
      setMessage('Budget berhasil ditambahkan!')
    }

    setTimeout(() => setMessage(''), 3000)
    setShowForm(false)
    setFormData({ category: '', limit: '' })
  }

  const handleDeleteBudget = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus budget ini?')) {
      setBudgets(budgets.filter((b) => b.id !== id))
      setMessage('Budget berhasil dihapus!')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setFormData({ category: '', limit: '' })
    setEditingId(null)
  }

  // Calculate totals
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0)
  const totalUsage = budgets.reduce((sum, b) => {
    const actualUsage = getActualUsage(b.category)
    return sum + actualUsage
  }, 0)
  const totalRemaining = totalBudget - totalUsage
  const totalUsagePercent = totalBudget > 0 ? Math.round((totalUsage / totalBudget) * 100) : 0
  const budgetsExceeded = budgets.filter((b) => {
    const actualUsage = getActualUsage(b.category)
    return b.limit > 0 ? actualUsage > b.limit : actualUsage > 0
  }).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Pengaturan Keuangan</p>
        <h1 className="text-3xl font-semibold text-slate-900">Budget</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Kelola budget Anda per kategori untuk mengontrol pengeluaran
        </p>
      </section>

      {/* Summary Cards */}
      <div className="grid gap-4 xl:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.12em] text-slate-500">Total Budget</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">Rp {totalBudget.toLocaleString('id-ID')}</h3>
          <p className="mt-2 text-xs text-slate-500">{budgets.length} kategori aktif</p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.12em] text-slate-500">Terpakai</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">Rp {totalUsage.toLocaleString('id-ID')}</h3>
          <p className="mt-2 text-xs text-slate-500">{totalUsagePercent}% dari total</p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.12em] text-slate-500">Sisa Budget</p>
          <h3 className="mt-2 text-2xl font-semibold text-emerald-600">Rp {totalRemaining.toLocaleString('id-ID')}</h3>
          <p className="mt-2 text-xs text-slate-500">Masih tersedia</p>
        </div>

        <div className={`rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm ${budgetsExceeded > 0 ? 'ring-2 ring-rose-300' : ''}`}>
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Contoh: Makan, Hiburan, Transport"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38ADA9]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Limit Budget (Rp)</label>
              <input
                type="number"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                placeholder="Contoh: 1000000"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38ADA9]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-[#38ADA9] px-4 py-2 font-medium text-white hover:bg-[#2e8b87] transition"
              >
                {editingId ? 'Perbarui Budget' : 'Tambah Budget'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-900 hover:bg-slate-300 transition"
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
          className="w-full rounded-[28px] border-2 border-dashed border-[#38ADA9] bg-[#38ADA9]/5 px-4 py-4 font-medium text-[#38ADA9] hover:bg-[#38ADA9]/10 transition"
        >
          + Tambah Budget Baru
        </button>
      )}

      {/* Budget Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Kategori Budget</h2>
        <div className="grid gap-4 xl:grid-cols-2">
          {budgets.map((budget) => {
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
      </div>

      {/* Budget Tips */}
      <div className="rounded-[32px] border border-slate-200 bg-blue-50 p-6">
        <h3 className="font-semibold text-slate-900 mb-3">💡 Tips Manajemen Budget</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>✓ Tentukan budget untuk setiap kategori pengeluaran</li>
          <li>✓ Monitor penggunaan budget secara berkala</li>
          <li>✓ Kurangi pengeluaran jika mendekati atau melampaui budget</li>
          <li>✓ Sesuaikan budget berdasarkan pola pengeluaran Anda</li>
          <li>✓ Prioritaskan kebutuhan pokok terlebih dahulu</li>
        </ul>
      </div>
    </div>
  )
}

export default BudgetPage
