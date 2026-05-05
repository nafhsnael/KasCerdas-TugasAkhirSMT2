import { useState } from 'react'

function AddSavingsPage({ onAddSavings, onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    deadline: '',
    current: '',
    note: '',
  })

  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.target || !formData.deadline) {
      setMessage('Silakan isi semua field yang wajib')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    const target = parseInt(formData.target)
    const current = parseInt(formData.current || 0)

    if (target <= 0) {
      setMessage('Target tabungan harus lebih dari 0')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    if (current < 0) {
      setMessage('Tabungan saat ini tidak boleh negatif')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    if (current >= target) {
      setMessage('Tabungan saat ini tidak boleh lebih besar atau sama dengan target')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    const deadline = new Date(formData.deadline)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (deadline <= today) {
      setMessage('Tanggal deadline harus di masa depan')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    const newSavings = {
      id: `s${Date.now()}`,
      name: formData.name.trim(),
      target: target,
      current: current,
      deadline: formData.deadline,
      note: formData.note.trim(),
      createdAt: new Date().toISOString(),
      status: 'active',
    }

    onAddSavings(newSavings)
    setMessage('Target tabungan berhasil ditambahkan!')
    setTimeout(() => {
      setMessage('')
      onNavigate('reports')
    }, 2000)
  }

  const handleCancel = () => {
    onNavigate('reports')
  }

  // Calculate progress and monthly required
  const target = parseInt(formData.target || 0)
  const current = parseInt(formData.current || 0)
  const deadline = formData.deadline ? new Date(formData.deadline) : null
  const now = new Date()

  const progress = target > 0 ? Math.round((current / target) * 100) : 0
  const remaining = target - current
  const monthsLeft = deadline ? Math.max(1, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24 * 30))) : 0
  const monthlyRequired = monthsLeft > 0 ? Math.ceil(remaining / monthsLeft) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Manajemen Tabungan</p>
        <h1 className="text-3xl font-semibold text-slate-900">Tambah Target Tabungan</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Tetapkan target tabungan Anda untuk mencapai tujuan finansial
        </p>
      </section>

      {/* Message Alert */}
      {message && (
        <div className={`rounded-[20px] p-4 ${message.includes('berhasil') ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      {/* Form */}
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nama Target <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Tabungan Rumah, Dana Darurat"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38ADA9] focus:border-transparent"
                required
              />
            </div>

            {/* Target Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target Tabungan (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                placeholder="Contoh: 50000000"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38ADA9] focus:border-transparent"
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Current Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tabungan Saat Ini (Rp)
              </label>
              <input
                type="number"
                value={formData.current}
                onChange={(e) => setFormData({ ...formData, current: e.target.value })}
                placeholder="Contoh: 10000000 (kosongkan jika 0)"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38ADA9] focus:border-transparent"
                min="0"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38ADA9] focus:border-transparent"
                min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                required
              />
              <p className="mt-1 text-xs text-slate-500">Minimal 1 hari dari sekarang</p>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Tambahkan motivasi atau rencana pencapaian target..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38ADA9] focus:border-transparent resize-none"
            />
          </div>

          {/* Preview */}
          {formData.name && formData.target && formData.deadline && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">Pratinjau Target Tabungan</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Nama Target:</span>
                  <span className="font-medium text-slate-900">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Target:</span>
                  <span className="font-medium text-slate-900">Rp {target.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Saat Ini:</span>
                  <span className="font-medium text-slate-900">Rp {current.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Progress:</span>
                  <span className="font-medium text-slate-900">{progress}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Sisa:</span>
                  <span className="font-medium text-slate-900">Rp {remaining.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Deadline:</span>
                  <span className="font-medium text-slate-900">{deadline.toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Target Bulanan:</span>
                  <span className="font-medium text-slate-900">Rp {monthlyRequired.toLocaleString('id-ID')}</span>
                </div>
                {formData.note && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Catatan:</span>
                    <span className="font-medium text-slate-900">{formData.note}</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1 text-center">{progress}% tercapai</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-[#38ADA9] px-6 py-3 font-medium text-white hover:bg-[#2e8b87] transition focus:outline-none focus:ring-2 focus:ring-[#38ADA9] focus:ring-offset-2"
            >
              Tambah Target Tabungan
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-lg bg-slate-200 px-6 py-3 font-medium text-slate-900 hover:bg-slate-300 transition focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Batal
            </button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="rounded-[32px] border border-slate-200 bg-emerald-50 p-6">
        <h3 className="font-semibold text-slate-900 mb-3">💡 Tips Menabung Efektif</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>✓ Tetapkan target yang realistis dan terukur</li>
          <li>✓ Buat deadline yang masuk akal</li>
          <li>✓ Sisihkan tabungan sebelum pengeluaran lainnya</li>
          <li>✓ Monitor progress secara berkala</li>
          <li>✓ Rayakan pencapaian milestone</li>
        </ul>
      </div>
    </div>
  )
}

export default AddSavingsPage
