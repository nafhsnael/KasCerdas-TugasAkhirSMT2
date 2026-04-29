import { useState } from 'react'

function InitialBalancePage({ onSave, initialBalance = 0 }) {
  const [balance, setBalance] = useState(initialBalance.toString())
  const [note, setNote] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const parsedBalance = parseInt(balance) || 0
    onSave({ balance: parsedBalance, note })
    alert('Saldo awal berhasil disimpan!')
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Saldo Awal</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Jumlah Saldo</label>
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Masukkan saldo awal"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Catatan (Opsional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Tambahkan catatan"
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Simpan
        </button>
      </form>
    </div>
  )
}

export default InitialBalancePage