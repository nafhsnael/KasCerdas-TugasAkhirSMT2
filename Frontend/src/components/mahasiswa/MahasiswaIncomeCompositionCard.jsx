import { useMemo } from 'react'

const CATEGORY_COLOR = {
  Beasiswa: 'bg-emerald-500',
  Tabungan: 'bg-amber-500',
  "Uang Saku": 'bg-blue-500',
  "Penghasilan Kerja Paruh Waktu": 'bg-purple-500',
}

function formatRp(value) {
  const num = Number(value) || 0
  return `Rp ${num.toLocaleString('id-ID')}`
}

function MahasiswaIncomeCompositionCard({ transactions, periodLabel, compact = false }) {
  const rows = useMemo(() => {
    const tx = Array.isArray(transactions) ? transactions : []

    const incomeTx = tx.filter((t) => {
      const type = (t?.type || '').toLowerCase()
      return type === 'income'
    })

    const totalIncome = incomeTx.reduce((sum, t) => sum + (Number(t?.amount) || 0), 0)

    const normalizeCategory = (rawText) => {
      const raw = (rawText || '').toLowerCase()

      if (raw.includes('beasiswa')) return 'Beasiswa'
      if (raw.includes('tabungan')) return 'Tabungan'
      if (raw.includes('uang') && raw.includes('saku')) return 'Uang Saku'
      if (raw.includes('penghasilan') && raw.includes('paruh')) return 'Penghasilan Kerja Paruh Waktu'
      if (raw.includes('paruh waktu')) return 'Penghasilan Kerja Paruh Waktu'

      // fallback (gunakan pemasukan apa adanya jika tidak cocok)
      return 'Lainnya'
    }

    const byCategory = incomeTx.reduce((acc, t) => {
      const category = normalizeCategory(t?.category || t?.businessCategory)
      if (category === 'Lainnya') return acc

      acc[category] = (acc[category] || 0) + (Number(t?.amount) || 0)
      return acc
    }, {})

    const orderedCats = [
      'Beasiswa',
      'Tabungan',
      'Uang Saku',
      'Penghasilan Kerja Paruh Waktu',
    ]

    return orderedCats.map((category) => {
      const nominal = Number(byCategory[category] || 0)
      const percentage = totalIncome > 0 ? (nominal / totalIncome) * 100 : 0
      return { category, nominal, percentage }
    })
  }, [transactions])

  return (
    <section
      className={`rounded-[20px] border border-slate-200 bg-white shadow-sm ${compact ? 'p-4' : 'p-6'}`}
    >

      <div className={`mb-4 ${compact ? 'hidden' : ''}`}>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500 font-semibold">Komposisi Pemasukan Studi</p>
        <h3 className={`mt-2 font-bold text-slate-900 ${compact ? 'text-lg' : 'text-xl'}`}>Distribusi pemasukan mahasiswa</h3>
        <p className={`mt-2 text-sm text-slate-500 font-semibold ${compact ? 'hidden' : ''}`}>
          {periodLabel || 'Periode'} • Per kategori berdasarkan total pemasukan periode tersebut
        </p>
      </div>


      <div className="rounded-[20px] bg-slate-50/40 p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {rows.map((r) => {
            const pct = Math.max(0, Math.min(100, r.percentage || 0))
            const color = CATEGORY_COLOR[r.category] || 'bg-slate-400'
            const labelColor = (() => {
              switch (color) {
                case 'bg-emerald-500':
                  return 'text-emerald-600'
                case 'bg-amber-500':
                  return 'text-amber-600'
                case 'bg-blue-500':
                  return 'text-blue-600'
                case 'bg-purple-500':
                  return 'text-purple-600'
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

export default MahasiswaIncomeCompositionCard

