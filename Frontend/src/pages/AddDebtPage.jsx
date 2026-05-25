import { useState } from 'react'

function AddDebtPage({ onAddDebt, onNavigate }) {
  const [formData, setFormData] = useState({
    creditor: '',
    amount: '',
    dueDate: '',
    note: '',
  })

  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.creditor.trim() || !formData.amount || !formData.dueDate) {
      setMessage('Silakan isi semua field yang wajib')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    const amount = parseInt(formData.amount)
    if (amount <= 0) {
      setMessage('Jumlah hutang harus lebih dari 0')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    const dueDate = new Date(formData.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (dueDate < today) {
      setMessage('Tanggal jatuh tempo tidak boleh di masa lalu')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    const newDebt = {
      id: `d${Date.now()}`,
      creditor: formData.creditor.trim(),
      amount: amount,
      dueDate: formData.dueDate,
      note: formData.note.trim(),
      status: 'ongoing',
      createdAt: new Date().toISOString(),
    }

    onAddDebt(newDebt)
    setMessage('Hutang berhasil ditambahkan!')
    setTimeout(() => {
      setMessage('')
      onNavigate('reports')
    }, 2000)
  }

  const handleCancel = () => {
    onNavigate('reports')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Manajemen Hutang</p>
        <h1 className="text-3xl font-semibold text-slate-900">Tambah Hutang Baru</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Catat hutang Anda untuk memudahkan pelacakan dan pengingat jatuh tempo
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
            {/* Creditor */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nama Kreditur <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.creditor}
                onChange={(e) => setFormData({ ...formData, creditor: e.target.value })}
                placeholder="Contoh: Keluarga, Teman, Bank"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38ADA9] focus:border-transparent"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Jumlah Hutang (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Contoh: 1000000"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38ADA9] focus:border-transparent"
                min="1"
                required
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tanggal Jatuh Tempo <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38ADA9] focus:border-transparent"
              min={new Date().toISOString().split('T')[0]}
              required
            />
            <p className="mt-1 text-xs text-slate-500">Pilih tanggal minimal hari ini</p>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Tambahkan catatan tentang hutang ini..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38ADA9] focus:border-transparent resize-none"
            />
          </div>

          {/* Preview */}
          {formData.creditor && formData.amount && formData.dueDate && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">Pratinjau Hutang</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Kreditur:</span>
                  <span className="font-medium text-slate-900">{formData.creditor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Jumlah:</span>
                  <span className="font-medium text-slate-900">Rp {parseInt(formData.amount || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Jatuh Tempo:</span>
                  <span className="font-medium text-slate-900">{new Date(formData.dueDate).toLocaleDateString('id-ID')}</span>
                </div>
                {formData.note && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Catatan:</span>
                    <span className="font-medium text-slate-900">{formData.note}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-[#38ADA9] px-6 py-3 font-medium text-white hover:bg-[#2e8b87] transition focus:outline-none focus:ring-2 focus:ring-[#38ADA9] focus:ring-offset-2"
            >
              Tambah Hutang
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
      <div className="rounded-[32px] border border-slate-200 bg-blue-50 p-6">
        <h3 className="font-semibold text-slate-900 mb-3">💡 Tips Mengelola Hutang</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>✓ Catat semua hutang dengan detail untuk menghindari lupa</li>
          <li>✓ Set tanggal jatuh tempo yang realistis</li>
          <li>✓ Prioritaskan hutang dengan bunga atau yang mendesak</li>
          <li>✓ Buat rencana pembayaran yang teratur</li>
          <li>✓ Monitor progress pembayaran secara berkala</li>
        </ul>
      </div>
    </div>
  )
}

export default AddDebtPage
