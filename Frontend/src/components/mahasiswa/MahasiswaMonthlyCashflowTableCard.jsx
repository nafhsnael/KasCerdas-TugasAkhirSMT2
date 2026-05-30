import { useMemo } from 'react'

function formatRp(value) {
  const num = Number(value) || 0
  return `Rp ${num.toLocaleString('id-ID')}`
}

function MahasiswaMonthlyCashflowTableCard({ transactions, periodLabel, compact = false }) {
  const stats = useMemo(() => {
    const tx = Array.isArray(transactions) ? transactions : []

    const incomes = tx.filter((t) => t?.type === 'income')
    const expenses = tx.filter((t) => t?.type === 'expense')

    const incomeAvg = incomes.length ? incomes.reduce((s, t) => s + (Number(t.amount) || 0), 0) / incomes.length : 0
    const expenseAvg = expenses.length ? expenses.reduce((s, t) => s + (Number(t.amount) || 0), 0) / expenses.length : 0

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

  const cards = [
    {
      label: 'Rata-rata pemasukan',
      value: formatRp(stats.incomeAvg),
      valueClass: 'text-emerald-700',
      bgClass: 'bg-emerald-50',
      icon: '↟',
    },
    {
      label: 'Rata-rata pengeluaran',
      value: formatRp(stats.expenseAvg),
      valueClass: 'text-rose-600',
      bgClass: 'bg-rose-50',
      icon: '↡',
    },
    {
      label: 'Rata-rata arus kas bersih',
      value: formatRp(stats.netCashFlow),
      valueClass: isNegative ? 'text-rose-600' : 'text-[#2563EB]',
      bgClass: 'bg-blue-50',
      icon: '↸',
    },
    {
      label: 'Arus kas tertinggi',
      value: formatRp(stats.highestNet),
      valueClass: stats.highestNet < 0 ? 'text-rose-600' : 'text-emerald-700',
      bgClass: 'bg-indigo-50',
      icon: '↝',
    },
    {
      label: 'Arus kas terendah',
      value: formatRp(stats.lowestNet),
      valueClass: 'text-rose-600',
      bgClass: 'bg-rose-50',
      icon: '↯',
    },
  ]

  return (
    <section className={`rounded-[20px] bg-white shadow-sm border border-slate-200 ${compact ? 'p-4' : 'p-6'}`}>
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500 font-semibold">Arus Kas Bulanan Mahasiswa</p>
        <h3 className={`mt-2 font-semibold text-slate-900 ${compact ? 'text-lg' : 'text-xl'}`}>{periodLabel || 'Periode Terpilih'}</h3>
        <p className={`mt-2 text-sm text-slate-500 ${compact ? 'hidden' : ''}`}>Ringkasan kondisi arus kas pengguna berdasarkan periode yang dipilih</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`group rounded-2xl bg-white border border-slate-200 shadow-sm p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${c.bgClass} ${c.iconClass}`}>
                <span className="text-[18px] font-semibold leading-none">{c.icon}</span>
              </div>
            </div>

            <div className="mt-4">
              <div className={`text-xl font-semibold ${c.valueClass}`}>{c.value}</div>
              <div className="mt-2 text-sm text-slate-500">{c.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default MahasiswaMonthlyCashflowTableCard

