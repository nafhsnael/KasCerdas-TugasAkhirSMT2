import { useMemo } from 'react'

const CATEGORY_COLOR = {
  Kos: 'bg-rose-500',
  UKT: 'bg-emerald-500',
  Makan: 'bg-orange-500',
  Hutang: 'bg-rose-500',
  Transportasi: 'bg-blue-500',
  'Kebutuhan Kuliah': 'bg-purple-500',
  'Kebutuhan Lainnya': 'bg-slate-500',
}

function formatRp(value) {
  const num = Number(value) || 0
  return `Rp ${num.toLocaleString('id-ID')}`
}

function MahasiswaExpenseCompositionCard({ transactions, periodLabel, compact = false }) {
  const rows = useMemo(() => {
    const tx = Array.isArray(transactions) ? transactions : []
    const expenseTx = tx.filter((t) => {
      const type = (t?.type || '').toLowerCase()
      return type === 'expense' || type === 'pengeluaran'
    })

    const totalExpense = expenseTx.reduce((sum, t) => sum + (Number(t?.amount) || 0), 0)

    const byCategory = expenseTx.reduce((acc, t) => {
      let raw = (t?.category || '').toLowerCase()
      let category = 'Kebutuhan Lainnya'

      if (raw.includes('kos')) category = 'Kos'
      else if (raw.includes('ukt')) category = 'UKT'
      else if (raw.includes('makan')) category = 'Makan'
      else if (raw.includes('hutang') || raw.includes('utang')) category = 'Hutang'
      else if (raw.includes('transport')) category = 'Transportasi'
      else if (raw.includes('kebutuhan') && raw.includes('kuliah')) category = 'Kebutuhan Kuliah'

      acc[category] = (acc[category] || 0) + (Number(t?.amount) || 0)
      return acc
    }, {})

    const orderedCats = ['Kos', 'UKT', 'Makan', 'Hutang', 'Transportasi', 'Kebutuhan Kuliah', 'Kebutuhan Lainnya']

    const mapped = orderedCats.map((category) => {
      const nominal = Number(byCategory[category] || 0)
      const percentage = totalExpense > 0 ? (nominal / totalExpense) * 100 : 0
      return { category, nominal, percentage }
    })

    return { totalExpense, sorted: mapped }
  }, [transactions])

  const orderedRows = rows.sorted || []

  return (
    <section className={`rounded-[20px] border border-slate-200 bg-white shadow-sm ${compact ? 'p-4' : 'p-6'}`}>
      <div className={`mb-4 ${compact ? 'hidden' : ''}`}>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500 font-semibold">Komposisi Pengeluaran Studi & Harian</p>
        <h3 className={`mt-2 font-bold text-slate-900 ${compact ? 'text-lg' : 'text-xl'}`}>Distribusi pengeluaran mahasiswa</h3>
        <p className={`mt-2 text-sm text-slate-500 font-semibold ${compact ? 'hidden' : ''}`}>
          {periodLabel || 'Periode'} • Per kategori berdasarkan total pengeluaran periode tersebut
        </p>
      </div>

      <div className="rounded-[20px] bg-slate-50/40 p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {orderedRows.map((r) => {
            const pct = Math.max(0, Math.min(100, r.percentage || 0))
            const color = CATEGORY_COLOR[r.category] || 'bg-slate-400'
            const labelColor = (() => {
              switch (color) {
                case 'bg-orange-500':
                  return 'text-orange-600'
                case 'bg-rose-500':
                  return 'text-rose-600'
                case 'bg-blue-500':
                  return 'text-blue-600'
                case 'bg-purple-500':
                  return 'text-purple-600'
                case 'bg-green-500':
                  return 'text-green-600'
                default:
                  return 'text-slate-600'
              }
            })()

            return (
              <div key={r.category} className="rounded-[20px] bg-white border border-slate-200 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-800">{r.category}</p>
                    <p className={`mt-1 text-sm ${labelColor}`}>{formatRp(r.nominal)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{pct.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} transition-[width] duration-700 ease-out`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default MahasiswaExpenseCompositionCard

