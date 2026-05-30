import { useMemo } from 'react'

const CATEGORY_COLOR = {
  Makan: 'bg-orange-500',
  Hutang: 'bg-rose-500',
  Transport: 'bg-blue-500',
  Belanja: 'bg-purple-500',
  Tagihan: 'bg-green-500',
  'Kebutuhan Lainnya': 'bg-slate-500',
}

const DEFAULT_CATEGORIES = [
  'Makan',
  'Hutang',
  'Transport',
  'Belanja',
  'Tagihan',
  'Kebutuhan Lainnya',
]

function formatRp(value) {
  const num = Number(value) || 0
  return `Rp ${num.toLocaleString('id-ID')}`
}

function MasyarakatExpenseCompositionCard({ transactions, periodLabel, compact = false, categories }) {
  const effectiveCategories = Array.isArray(categories) && categories.length ? categories : DEFAULT_CATEGORIES

  const data = useMemo(() => {
    const tx = Array.isArray(transactions) ? transactions : []

    const expenseTx = tx.filter((t) => {
      const type = (t?.type || '').toLowerCase()

      return (
        type === 'expense' ||
        type === 'pengeluaran'
      )
    })

    const totalExpense = expenseTx.reduce(
      (sum, t) => sum + (Number(t?.amount) || 0),
      0
    )

    const byCategory = expenseTx.reduce((acc, t) => {
      let category = t?.category || ''

      category = category.toLowerCase()

      if (category.includes('makan')) {
        category = 'Makan'
      } else if (category.includes('hutang')) {
        category = 'Hutang'
      } else if (category.includes('transport')) {
        category = 'Transport'
      } else if (category.includes('belanja')) {
        category = 'Belanja'
      } else if (category.includes('tagihan')) {
        category = 'Tagihan'
      } else {
        category = 'Kebutuhan Lainnya'
      }

      acc[category] = (acc[category] || 0) + (Number(t?.amount) || 0)

      return acc
    }, {})

    const rows = effectiveCategories.map((category) => {
      const nominal = Number(byCategory[category] || 0)

      const percentage =
        totalExpense > 0
          ? (nominal / totalExpense) * 100
          : 0

      return {
        category,
        nominal,
        percentage,
      }
    })

    return { totalExpense, rows }
  }, [transactions])

  const rows = data.rows || []

  return (
    <section
      className={`rounded-[20px] border border-slate-200 bg-white shadow-sm ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      <div className={`mb-4 ${compact ? 'hidden' : ''}`}>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500 font-semibold">
          Komposisi Pengeluaran Masyarakat
        </p>

        <h3
          className={`mt-2 font-bold text-slate-900 ${
            compact ? 'text-lg' : 'text-xl'
          }`}
        >
          Distribusi pengeluaran berdasarkan kategori masyarakat
        </h3>

        <p
          className={`mt-2 text-sm text-slate-500 font-semibold ${
            compact ? 'hidden' : ''
          }`}
        >
          {periodLabel || 'Periode'} • Ringkasan berdasarkan total pengeluaran masyarakat pada periode tersebut
        </p>
      </div>

      <div className="rounded-[20px] bg-slate-50/40 p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {effectiveCategories.map((cat) => {
            const item = rows.find((r) => r.category === cat)

            const nominal = item?.nominal || 0

            const pct = Math.max(
              0,
              Math.min(100, item?.percentage || 0)
            )

            const color =
              CATEGORY_COLOR[cat] || 'bg-slate-400'

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
              <div
                key={cat}
                className="rounded-[20px] bg-white border border-slate-200 px-5 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {cat}
                    </p>

                    <p className={`mt-1 text-sm ${labelColor}`}>
                      {formatRp(nominal)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {pct.toFixed(1)}%
                    </p>
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

export default MasyarakatExpenseCompositionCard