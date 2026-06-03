import { useMemo } from 'react'

const CATEGORY_COLOR = {
  'Penghasilan Kerja': 'bg-emerald-500',
  'Uang Saku': 'bg-blue-500',
  Tabungan: 'bg-amber-500',
}

const DEFAULT_ORDER = ['Penghasilan Kerja', 'Uang Saku', 'Tabungan']

function formatRp(value) {
  const num = Number(value) || 0
  return `Rp ${num.toLocaleString('id-ID')}`
}

function normalizeIncomeCategory(rawText) {
  const raw = (rawText || '').toLowerCase()

  // Prioritas mapping sesuai requirement
  if (raw.includes('uang') && raw.includes('saku')) return 'Uang Saku'
  if (raw.includes('tabungan')) return 'Tabungan'

  // Penghasilan kerja: fleksibel karena data bisa memakai variasi teks
  if (raw.includes('penghasilan') && (raw.includes('kerja') || raw.includes('paruh'))) {
    return 'Penghasilan Kerja'
  }

  // fallback: jika hanya ada kata penghasilan dan kerja/paruh ada di tempat lain
  if (raw.includes('penghasilan') && (raw.includes('kerja') || raw.includes('buruh') || raw.includes('paruh'))) {
    return 'Penghasilan Kerja'
  }

  // fallback lain: jangan memasukkan kategori di luar yang diminta
  return null
}

function MasyarakatIncomeCompositionCard({ transactions, periodLabel, compact = false }) {
  const rows = useMemo(() => {
    const isInitialBalanceTx = (t) => {
      const title = String(t?.title || '').trim().toLowerCase()
      const category = String(t?.category || '').trim().toLowerCase()
      const note = String(t?.note || '').trim().toLowerCase()
      return (
        title === 'initial' || title === 'initial balance' || title === 'saldo awal' ||
        category === 'initial' || category === 'initial balance' || category === 'saldo awal' ||
        note === 'initial' || note === 'initial balance' || note === 'saldo awal'
      )
    }

    const tx = (Array.isArray(transactions) ? transactions : []).filter((t) => !isInitialBalanceTx(t))

    const incomeTx = tx.filter((t) => {
      const type = (t?.type || '').toLowerCase()
      return type === 'income'
    })

    const totalIncome = incomeTx.reduce(
      (sum, t) => sum + (Number(t?.amount) || 0),
      0
    )

    const byCategory = incomeTx.reduce((acc, t) => {
      const category = normalizeIncomeCategory(t?.category)
      if (!category) return acc

      acc[category] = (acc[category] || 0) + (Number(t?.amount) || 0)
      return acc
    }, {})

    return DEFAULT_ORDER.map((category) => {
      const nominal = Number(byCategory[category] || 0)
      const percentage = totalIncome > 0 ? (nominal / totalIncome) * 100 : 0
      return { category, nominal, percentage }
    })
  }, [transactions])

  return (
    <section
      className={`rounded-[20px] border border-slate-200 bg-white shadow-sm ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      <div className={`mb-4 ${compact ? 'hidden' : ''}`}>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500 font-semibold">
          Komposisi Pemasukan Masyarakat
        </p>

        <h3 className={`mt-2 font-bold text-slate-900 ${compact ? 'text-lg' : 'text-xl'}`}>
          Distribusi pemasukan berdasarkan kategori masyarakat
        </h3>

        <p className={`mt-2 text-sm text-slate-500 font-semibold ${compact ? 'hidden' : ''}`}>
          {periodLabel || 'Periode'} • Ringkasan berdasarkan total pemasukan masyarakat pada periode tersebut
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
                default:
                  return 'text-slate-600'
              }
            })()

            return (
              <div
                key={r.category}
                className="rounded-[20px] bg-white border border-slate-200 px-5 py-4"
              >
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

export default MasyarakatIncomeCompositionCard

