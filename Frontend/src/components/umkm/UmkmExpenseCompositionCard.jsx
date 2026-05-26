import { useMemo } from 'react'

const CATEGORY_COLOR = {
  'Makanan & Minuman': 'bg-orange-500',
  Transportasi: 'bg-blue-500',
  Belanja: 'bg-purple-500',
  Tagihan: 'bg-green-500',
  Hiburan: 'bg-pink-500',
}

function formatRp(value) {
  const num = Number(value) || 0
  return `Rp ${num.toLocaleString('id-ID')}`
}

function UmkmExpenseCompositionCard({ transactions, periodLabel, compact = false }) {
  const rows = useMemo(() => {
    const tx = Array.isArray(transactions) ? transactions : []
    const expenseTx = tx.filter((t) => t?.type === 'expense')

    const totalExpense = expenseTx.reduce((sum, t) => sum + (Number(t?.amount) || 0), 0)

    const byCategory = expenseTx.reduce((acc, t) => {
      const category = t?.category || 'Lainnya'
      acc[category] = (acc[category] || 0) + (Number(t?.amount) || 0)
      return acc
    }, {})

    const sorted = Object.entries(byCategory)
      .map(([category, nominal]) => {
        const percentage = totalExpense > 0 ? (nominal / totalExpense) * 100 : 0
        return { category, nominal, percentage }
      })
      .sort((a, b) => b.nominal - a.nominal)

    return { totalExpense, sorted }
  }, [transactions])

  const desiredOrder = ['Makanan & Minuman', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan']

  const orderedRows = (() => {
    const map = new Map(rows.sorted.map((r) => [r.category, r]))
    const final = []
    for (const c of desiredOrder) {
      if (map.has(c)) final.push(map.get(c))
    }
    for (const r of rows.sorted) {
      if (!desiredOrder.includes(r.category)) final.push(r)
    }
    return final.slice(0, 8)
  })()

  return (
    <section
      className={`rounded-[20px] border border-slate-200 bg-white shadow-sm ${compact ? 'p-4' : 'p-6'}`}
    >
      <div className={`mb-4 ${compact ? 'hidden' : ''}`}>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500 font-semibold">
          Komposisi Pengeluaran Operasional
        </p>
        <h3 className={`mt-2 font-bold text-slate-900 ${compact ? 'text-lg' : 'text-xl'}`}>
          Distribusi beban usaha berdasarkan kategori
        </h3>
        <p className={`mt-2 text-sm text-slate-500 font-semibold ${compact ? 'hidden' : ''}`}>
          {periodLabel || 'Periode'} • Ringkasan dihitung dari total pengeluaran pada periode tersebut
        </p>
      </div>

      <div className="rounded-[20px] bg-slate-50/40 p-4">
        {orderedRows.length > 0 ? (
          <div className="space-y-4">
            {orderedRows.map((r) => {
              const pct = Math.max(0, Math.min(100, r.percentage || 0))
              const color = CATEGORY_COLOR[r.category] || 'bg-slate-400'
              const labelColor = (() => {
                switch (color) {
                  case 'bg-orange-500':
                    return 'text-orange-600'
                  case 'bg-blue-500':
                    return 'text-blue-600'
                  case 'bg-purple-500':
                    return 'text-purple-600'
                  case 'bg-green-500':
                    return 'text-green-600'
                  case 'bg-pink-500':
                    return 'text-pink-600'
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
        ) : (
          <div className="space-y-4">
            {['Makanan & Minuman', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan'].map((cat) => {
              const color = CATEGORY_COLOR[cat] || 'bg-slate-400'
              return (
                <div key={cat} className="rounded-[20px] bg-white border border-slate-200 px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-800">{cat}</p>
                      <p className="mt-1 text-sm text-slate-600">Rp 0</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">0.0%</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color} transition-[width] duration-700 ease-out`}
                        style={{ width: '0%' }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default UmkmExpenseCompositionCard


