import { useState } from 'react'

function InitialBalancePage({ onSave, initialBalance = 0 }) {
  const [balance, setBalance] = useState(initialBalance.toString())
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!balance || !date) {
      alert('Mohon isi saldo awal dan tanggal')
      return
    }
    const parsedBalance = parseInt(balance) || 0
    onSave({ balance: parsedBalance, date, note })
    alert('Saldo awal berhasil disimpan!')
  }

  return (
    <div className="mx-auto max-w-lg">
      {/* Header Card */}
      <div className="mb-6 rounded-3xl bg-[#38ADA9] p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">Saldo Awal</h2>
            <p className="text-sm text-white/80">Masukkan saldo pertama Anda</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Input Saldo Awal
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">Rp</span>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 transition-all focus:border-[#38ADA9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38ADA9]/20"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tanggal
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition-all focus:border-[#38ADA9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38ADA9]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Catatan
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition-all focus:border-[#38ADA9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38ADA9]/20"
              placeholder="Tambahkan catatan (opsional)"
              rows={3}
            />
          </div>

          <button className="w-full rounded-2xl bg-gradient-to-r from-[#38ADA9] to-[#38ADA9] py-3.5 text-base font-semibold text-white shadow-lg shadow-[#38ADA9]/25 transition-all hover:shadow-xl hover:shadow-[#38ADA9]/30 hover:-translate-y-0.5">
            Simpan Saldo
          </button>
        </form>
      </div>
    </div>
  )
}

export default InitialBalancePage