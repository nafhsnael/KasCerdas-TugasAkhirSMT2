import { useMemo } from 'react'


const CATEGORY_META = {
  'Makanan & Minuman': { icon: '◈', bar: 'bg-orange-500', barSoft: 'bg-orange-50', text: 'text-orange-700' },
  Transportasi: { icon: '◈', bar: 'bg-blue-500', barSoft: 'bg-blue-50', text: 'text-blue-700' },
  Belanja: { icon: '◈', bar: 'bg-purple-500', barSoft: 'bg-purple-50', text: 'text-purple-700' },
  Tagihan: { icon: '◈', bar: 'bg-green-500', barSoft: 'bg-green-50', text: 'text-green-700' },
  Hiburan: { icon: '◈', bar: 'bg-pink-500', barSoft: 'bg-pink-50', text: 'text-pink-700' },
  Lainnya: { icon: '◈', bar: 'bg-slate-400', barSoft: 'bg-slate-100', text: 'text-slate-700' },
}


function formatRp(value) {
  const num = Number(value) || 0
  return `Rp ${num.toLocaleString('id-ID')}`
}

function ExpenseCompositionCard({ transactions, periodLabel, compact = false }) {
  const { rows, totalExpense } = useMemo(() => {
    const tx = Array.isArray(transactions) ? transactions : []
    const expenseTx = tx.filter((t) => t?.type === 'expense')

    const totalExpenseLocal = expenseTx.reduce((sum, t) => sum + (Number(t?.amount) || 0), 0)

    const byCategory = expenseTx.reduce((acc, t) => {
      const category = t?.category || 'Lainnya'
      acc[category] = (acc[category] || 0) + (Number(t?.amount) || 0)
      return acc
    }, {})

    const orderedCats = ['Makanan & Minuman', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Lainnya']

    const mapped = orderedCats.map((cat) => {
      const nominal = Number(byCategory[cat] || byCategory[cat] || 0)
      const pct = totalExpenseLocal > 0 ? (nominal / totalExpenseLocal) * 100 : 0
      return { category: cat, nominal, percentage: pct }
    })

    return { rows: mapped, totalExpense: totalExpenseLocal }
  }, [transactions])

  return (
    <section className={`rounded-[20px] border border-slate-200 bg-white shadow-sm ${compact ? 'p-4' : 'p-6'}`}>
      <div className={`mb-4 ${compact ? 'hidden' : ''}`}>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500 font-extrabold">Komposisi Pengeluaran Per Kategori</p>
        <h3 className={`mt-2 font-bold text-slate-900 ${compact ? 'text-lg' : 'text-xl'}`}>
          Distribusi pengeluaran berdasarkan kategori
        </h3>
        <p className={`mt-2 text-sm text-slate-500 font-semibold ${compact ? 'hidden' : ''}`}>
          {periodLabel || 'Periode'} • Komposisi dihitung dari total pengeluaran pada periode tersebut
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rows.map((r) => {
          const meta = CATEGORY_META[r.category] || CATEGORY_META['Lainnya']
          const pct = Math.max(0, Math.min(100, r.percentage || 0))

          return (
            <div
              key={r.category}
              className="rounded-xl border border-slate-200 bg-white shadow-sm p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl ${meta.barSoft} flex items-center justify-center`}>
<span className="text-lg opacity-60">{meta.icon}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-800 text-sm leading-5">{r.category}</p>
                    <p className="text-sm font-semibold text-slate-900">{pct.toFixed(1)}%</p>
                  </div>
                  <p className={`mt-1 text-sm ${meta.text} font-semibold`}>{formatRp(r.nominal)}</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${meta.bar} transition-[width] duration-700 ease-out`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* keep height compact/clean */}
      <div className="mt-3 hidden" />
    </section>
  )
}

export default ExpenseCompositionCard


