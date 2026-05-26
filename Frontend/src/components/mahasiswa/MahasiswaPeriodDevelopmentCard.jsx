import { useMemo } from 'react'

function formatRp(value) {
  const num = Number(value) || 0
  return `Rp ${num.toLocaleString('id-ID')}`
}

function safePctChange(current, previous) {
  const prev = Number(previous) || 0
  const cur = Number(current) || 0

  if (prev === 0 && cur === 0) return 0
  if (prev === 0) return 100

  return ((cur - prev) / prev) * 100
}

function indicatorPill(valuePct) {
  const isUp = valuePct >= 0
  const color = isUp
    ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
    : 'text-rose-700 bg-rose-50 border-rose-100'
  const arrow = isUp ? '▲' : '▼'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${color}`}>
      {arrow} {Math.abs(valuePct).toFixed(1)}%
    </span>
  )
}

function MahasiswaPeriodDevelopmentCard({ transactions, periodLabel }) {
  const currentPeriod = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const currentTx = (Array.isArray(transactions) ? transactions : []).filter((t) => {
      const d = new Date(t?.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    const prev = new Date(now)
    prev.setMonth(now.getMonth() - 1)
    const prevMonth = prev.getMonth()
    const prevYear = prev.getFullYear()

    const previousTx = (Array.isArray(transactions) ? transactions : []).filter((t) => {
      const d = new Date(t?.date)
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear
    })

    return { currentTx, previousTx }
  }, [transactions])

  const stats = useMemo(() => {
    const { currentTx, previousTx } = currentPeriod

    const incomeCur = currentTx.filter((t) => t?.type === 'income').reduce((s, t) => s + (Number(t?.amount) || 0), 0)
    const expenseCur = currentTx.filter((t) => t?.type === 'expense').reduce((s, t) => s + (Number(t?.amount) || 0), 0)
    const netCur = incomeCur - expenseCur

    const incomePrev = previousTx.filter((t) => t?.type === 'income').reduce((s, t) => s + (Number(t?.amount) || 0), 0)
    const expensePrev = previousTx.filter((t) => t?.type === 'expense').reduce((s, t) => s + (Number(t?.amount) || 0), 0)
    const netPrev = incomePrev - expensePrev

    const savingsRatioCur = incomeCur > 0 ? netCur / incomeCur : 0
    const savingsRatioPrev = incomePrev > 0 ? netPrev / incomePrev : 0

    return {
      incomeCur,
      expenseCur,
      netCur,
      savingsRatioCurPct: savingsRatioCur * 100,
      incomePrev,
      expensePrev,
      netPrev,
      savingsRatioPrevPct: savingsRatioPrev * 100,
    }
  }, [currentPeriod])

  const change = useMemo(() => {
    return {
      incomeChangePct: safePctChange(stats.incomeCur, stats.incomePrev),
      expenseChangePct: safePctChange(stats.expenseCur, stats.expensePrev),
      netChangePct: safePctChange(stats.netCur, stats.netPrev),
      savingsRatioChangePct: safePctChange(stats.savingsRatioCurPct, stats.savingsRatioPrevPct),
    }
  }, [stats])

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Perkembangan Keuangan Mahasiswa</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900">{periodLabel || 'Periode'}</h3>
        <p className="mt-2 text-sm text-slate-500">Perbandingan pemasukan-pengeluaran dengan bulan sebelumnya</p>
      </div>

      <div className="divide-y divide-slate-200 rounded-[20px] border border-slate-200 bg-slate-50/30">
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="min-w-[180px] text-sm text-slate-700">Total pemasukan</div>
          <div className="ml-auto text-right font-semibold text-slate-900">{formatRp(stats.incomeCur)}</div>
          <div className="ml-4">{indicatorPill(change.incomeChangePct)}</div>
        </div>

        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="min-w-[180px] text-sm text-slate-700">Total pengeluaran</div>
          <div className="ml-auto text-right font-semibold text-slate-900">{formatRp(stats.expenseCur)}</div>
          <div className="ml-4">{indicatorPill(change.expenseChangePct)}</div>
        </div>

        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="min-w-[180px] text-sm text-slate-700">Total arus kas bersih</div>
          <div
            className={`ml-auto text-right font-semibold ${change.netChangePct < 0 ? 'text-rose-700' : 'text-[#2563EB]'}`}
          >
            {formatRp(stats.netCur)}
          </div>
          <div className="ml-4">{indicatorPill(change.netChangePct)}</div>
        </div>

        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="min-w-[180px] text-sm text-slate-700">Rasio tabungan</div>
          <div
            className={`ml-auto text-right font-semibold ${stats.savingsRatioCurPct < 0 ? 'text-rose-700' : 'text-emerald-700'}`}
          >
            {stats.savingsRatioCurPct.toFixed(1)}%
          </div>
          <div className="ml-4">{indicatorPill(change.savingsRatioChangePct)}</div>
        </div>
      </div>
    </section>
  )
}

export default MahasiswaPeriodDevelopmentCard


