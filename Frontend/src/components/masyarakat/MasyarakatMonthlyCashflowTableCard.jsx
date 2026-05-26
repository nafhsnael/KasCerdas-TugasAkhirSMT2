import { useMemo } from 'react'

function formatRp(value) {
  const num = Number(value) || 0
  return `Rp ${num.toLocaleString('id-ID')}`
}

function MasyarakatMonthlyCashflowTableCard({ transactions, periodLabel, compact = false }) {
  const stats = useMemo(() => {
    const tx = Array.isArray(transactions) ? transactions : []

    const incomes = tx.filter((t) => t?.type === 'income')
    const expenses = tx.filter((t) => t?.type === 'expense')

    const incomeAvg = incomes.length
      ? incomes.reduce((s, t) => s + (Number(t?.amount) || 0), 0) / incomes.length
      : 0
    const expenseAvg = expenses.length
      ? expenses.reduce((s, t) => s + (Number(t?.amount) || 0), 0) / expenses.length
      : 0

    const netCashFlow = incomeAvg - expenseAvg

    const perTxNet = tx
      .map((t) => {
        const amt = Number(t?.amount) || 0
        if (t?.type === 'income') return amt
        if (t?.type === 'expense') return -amt
        return 0
      })
      .filter((v) => typeof v === 'number' && !Number.isNaN(v))

    const highestNet = perTxNet.length ? Math.max(...perTxNet) : 0
    const lowestNet = perTxNet.length ? Math.min(...perTxNet) : 0

    return {
      incomeAvg,
      expenseAvg,
      netCashFlow,
      highestNet,
      lowestNet,
    }
  }, [transactions])

  const isNegative = stats.netCashFlow < 0

  return (
    <section className={`rounded-[20px] bg-white shadow-sm border border-slate-200 ${compact ? 'p-4' : 'p-6'}`}>
      <div className="mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500 font-semibold">Arus Kas Bulanan</p>
            <h3 className={`mt-2 font-semibold text-slate-900 ${compact ? 'text-lg' : 'text-xl'}`}>{periodLabel || 'Periode Terpilih'}</h3>
          </div>
        </div>
        <p className={`mt-2 text-sm text-slate-500 ${compact ? 'hidden' : ''}`}>Ringkasan arus kas untuk kebutuhan harian dan pencapaian eco</p>
      </div>

      <div className="rounded-[16px] border border-slate-200 bg-slate-50/40 overflow-hidden">
        {[
          {
            label: 'Rata-rata pemasukan e-wallet',
            value: formatRp(stats.incomeAvg),
            valueClass: 'text-emerald-700',
            leadingIcon: '↟',
          },
          {
            label: 'Rata-rata pengeluaran e-wallet',
            value: formatRp(stats.expenseAvg),
            valueClass: 'text-rose-600',
            leadingIcon: '↡',
          },
          {
            label: 'Rata-rata arus kas bersih',
            value: formatRp(stats.netCashFlow),
            valueClass: isNegative ? 'text-rose-600' : 'text-[#2563EB]',
            trailingIcon: '↸',
          },
          {
            label: 'Arus kas tertinggi',
            value: formatRp(stats.highestNet),
            valueClass: stats.highestNet < 0 ? 'text-rose-600' : 'text-emerald-700',
            leadingIcon: '↝',
          },
          {
            label: 'Arus kas terendah',
            value: formatRp(stats.lowestNet),
            valueClass: 'text-rose-600',
            leadingIcon: '↯',
          }
        ].map((row, idx) => (
          <div
            key={row.label}
            className={`flex items-center justify-between gap-4 px-5 py-4 ${idx !== 0 ? 'border-t border-slate-200' : ''}`}
          >
            <div className="flex items-center gap-3 text-slate-700">
              {row.leadingIcon ? (
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${isNegative ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}
                >
                  {row.leadingIcon}
                </span>
              ) : null}
              <span className="font-medium text-[15px]">{row.label}</span>
            </div>
            <div className={`font-semibold text-[16px] ${row.valueClass}`}>{row.value}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default MasyarakatMonthlyCashflowTableCard


