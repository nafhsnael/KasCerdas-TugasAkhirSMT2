import { useMemo } from 'react'

const CATEGORY_META = {
  Penjualan: { bar: 'bg-emerald-500', barSoft: 'bg-emerald-50', text: 'text-emerald-700' },
  Pemasukan: { bar: 'bg-blue-500', barSoft: 'bg-blue-50', text: 'text-blue-700' },
  Tabungan: { bar: 'bg-amber-500', barSoft: 'bg-amber-50', text: 'text-amber-700' },
}


function formatRp(value) {
  const num = Number(value) || 0
  return `Rp ${num.toLocaleString('id-ID')}`
}

function UmkmIncomeCompositionCard({ transactions, periodLabel, compact = false }) {
  const { rows, totalIncome } = useMemo(() => {
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

    const totalIncomeLocal = incomeTx.reduce((sum, t) => sum + (Number(t?.amount) || 0), 0)

    const normalizeIncomeCategory = (rawText) => {
      const raw = (rawText || '').toLowerCase()

      // kategori yang diminta:
      // - penjualan
      // - pemasukan
      // - tabungan
      if (raw.includes('penjualan')) return 'Penjualan'
      if (raw.includes('pemasukan')) return 'Pemasukan'
      if (raw.includes('tabungan')) return 'Tabungan'

      // fallback berbasis nama kategori yang mungkin berbeda
      if (raw.includes('jual')) return 'Penjualan'
      if (raw.includes('deposit') || raw.includes('top up') || raw.includes('transfer')) return 'Pemasukan'

      return 'Pemasukan'
    }

    const byCategory = incomeTx.reduce((acc, t) => {
      const category = normalizeIncomeCategory(t?.businessCategory || t?.category)
      acc[category] = (acc[category] || 0) + (Number(t?.amount) || 0)
      return acc
    }, {})

    const orderedCats = ['Penjualan', 'Pemasukan', 'Tabungan']

    const mapped = orderedCats.map((cat) => {
      const nominal = Number(byCategory[cat] || 0)
      const percentage = totalIncomeLocal > 0 ? (nominal / totalIncomeLocal) * 100 : 0
      return { category: cat, nominal, percentage }
    })

    return { rows: mapped, totalIncome: totalIncomeLocal }
  }, [transactions])

  return (
    <section className={`rounded-[20px] border border-slate-200 bg-white shadow-sm ${compact ? 'p-4' : 'p-6'}`}>
      <div className={`mb-4 ${compact ? 'hidden' : ''}`}>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500 font-semibold">
          Komposisi Pemasukan per Pos
        </p>
        <h3 className={`mt-2 font-bold text-slate-900 ${compact ? 'text-lg' : 'text-xl'}`}>
          Distribusi pemasukan berdasarkan kategori
        </h3>
        <p className={`mt-2 text-sm text-slate-500 font-semibold ${compact ? 'hidden' : ''}`}>
          {periodLabel || 'Periode'} • Ringkasan dihitung dari total pemasukan pada periode tersebut
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rows.map((r) => {
          const meta = CATEGORY_META[r.category] || CATEGORY_META['Pemasukan']
          const pct = Math.max(0, Math.min(100, r.percentage || 0))

          return (
            <div key={r.category} className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="flex items-center gap-3">
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
                  <div
                    className={`h-full rounded-full ${meta.bar} transition-[width] duration-700 ease-out`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 hidden" />
    </section>
  )
}

export default UmkmIncomeCompositionCard

