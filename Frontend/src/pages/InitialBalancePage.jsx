import { useState } from 'react'
import { createPortal } from 'react-dom'

function InitialBalancePage({ onSave, initialBalance = 0 }) {
  const [balance, setBalance] = useState(initialBalance.toString())
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [notif, setNotif] = useState({ open: false, type: '', message: '' });
  const [savedData, setSavedData] = useState(null);

  const backendUrl = 'https://backend-kascerdas-production.up.railway.app'

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!balance || !date) {
      setNotif({ open: true, type: 'error', message: 'Mohon isi saldo awal dan tanggal' });
      return;
    }

    setIsLoading(true)
    const parsedBalance = Number(balance.replace(/\./g, '')) || 0;

    try {
      // Simpan ke backend
      const token = window.localStorage.getItem('token')
      const res = await fetch(`${backendUrl}/api/wallets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: 'Dompet Pribadi',
          balance: parsedBalance,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        setNotif({ open: true, type: 'error', message: json?.message || 'Gagal menyimpan saldo awal' });
        setIsLoading(false)
        return
      }

      // Jika berhasil, tampilkan notifikasi sukses kustom dan otomatis tutup/lanjutkan setelah 3 detik
      const dataToSave = {
        balance: Number(json?.data?.balance ?? parsedBalance),
        wallet: json?.data || null,
        date,
        note,
      };
      setSavedData(dataToSave);
      setNotif({ open: true, type: 'success', message: 'Saldo awal berhasil disimpan!' });

      setTimeout(() => {
        setNotif(prev => {
          if (prev.open && prev.type === 'success') {
            onSave(dataToSave);
            return { open: false, type: '', message: '' };
          }
          return prev;
        });
      }, 3000);
    } catch (e) {
      console.error('Error saving wallet:', e)
      setNotif({ open: true, type: 'error', message: 'Terjadi kesalahan saat menyimpan saldo awal' });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      {/* Header Card */}
      <div className="mb-6 rounded-3xl bg-gradient-to-r from-teal-500 to-emerald-600 p-6 text-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/30 backdrop-blur-md">
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
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Input Saldo Awal</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium text-gray-400">Rp</span>
              <input
                type="text"
                value={balance}
                onChange={(e) => setBalance(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))}
                required
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-200 bg-gray-50 px-4 py-3 pl-12 text-lg text-gray-900 transition-all disabled:opacity-50 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-gray-50 px-4 py-3 text-lg text-gray-900 transition-all disabled:opacity-50 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Catatan</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-gray-50 px-4 py-3 text-lg text-gray-900 transition-all disabled:opacity-50 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              placeholder="Tambahkan catatan (opsional)"
              rows={3}
            />
          </div>

          <button
            disabled={isLoading}
            className="w-full rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:from-teal-700 hover:to-emerald-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Saldo'}
          </button>
        </form>
      </div>
      {notif.open && createPortal(
        <div className="!fixed !inset-0 !w-screen !h-screen !z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center space-y-4 max-w-xs w-full mx-4">
            {notif.type === 'success' ? (
              <svg className="h-12 w-12 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
              </svg>
            )}
            <p className="text-lg font-medium text-center">{notif.message}</p>
            <button
              onClick={() => {
                setNotif({ open: false, type: '', message: '' });
                if (notif.type === 'success' && savedData) {
                  onSave(savedData);
                }
              }}
              className="w-full py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
            >
              Lanjutkan ke Dashboard
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default InitialBalancePage